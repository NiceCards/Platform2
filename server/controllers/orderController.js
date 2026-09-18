import Order from '../models/Order.js';
import DeliveredOrder from '../models/DeliveredOrder.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import AppError from '../utils/appError.js';
import { generateOrderId, isValidObjectId, paginate, toJSON } from '../utils/helpers.js';

/**
 * POST /order - Place a new order without payment. Login required.
 * Validates stock for every line item, deducts stock atomically and
 * stores the order in MongoDB with status "pending".
 */
export const placeOrder = async (req, res, next) => {
  const session = await Order.startSession();
  session.startTransaction();

  try {
    const { name, email, phone, address, items } = req.body || {};

    if (!name || !email || !phone || !address) {
      return next(new AppError('Name, email, phone and address are required', 400));
    }
    if (!Array.isArray(items) || items.length === 0) {
      return next(new AppError('Your cart is empty. Add items before placing an order.', 400));
    }
    if (items.length > 50) {
      return next(new AppError('Too many items in the cart.', 400));
    }

    const orderItems = [];
    let total = 0;

    for (const item of items) {
      const productId = item.product || item.productId || item.id;
      if (!productId) {
        return next(new AppError('Each cart item must reference a product', 400));
      }

      const quantity = parseInt(item.quantity, 10) || 1;
      if (quantity < 1) {
        return next(new AppError('Each item quantity must be at least 1', 400));
      }
      const product = await Product.findById(productId).session(session);

      if (!product) {
        return next(new AppError(`Product ${productId} no longer exists`, 400));
      }
      if (!product.isActive) {
        return next(new AppError(`"${product.name}" is currently disabled`, 400));
      }
      if (product.stock < quantity) {
        return next(
          new AppError(
            `Only ${product.stock} unit${product.stock === 1 ? '' : 's'} of "${product.name}" available`,
            400
          )
        );
      }

      // Atomically deduct stock
      await Product.updateOne(
        { _id: product._id, stock: { $gte: quantity } },
        { $inc: { stock: -quantity } },
        { session }
      );

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity,
        image: (product.images && product.images[0]) || '',
      });
      total += product.price * quantity;
    }

    const order = await Order.create(
      [
        {
          orderId: generateOrderId(),
          user: req.user._id,
          customer: { name, email, phone, address },
          items: orderItems,
          total: Number(total.toFixed(2)),
          status: 'pending',
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order: toJSON(order[0]),
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};

/**
 * GET /orders - Return pending orders (admin) or a user's own orders.
 */
export const getOrders = async (req, res, next) => {
  try {
    const { page, limit, skip } = paginate(req.query);

    if (req.admin) {
      // Admin: pending orders feed, optionally filtered by search
      const filter = {};
      if (req.query.search) {
        filter.$or = [
          { orderId: { $regex: req.query.search, $options: 'i' } },
          { 'customer.name': { $regex: req.query.search, $options: 'i' } },
          { 'customer.email': { $regex: req.query.search, $options: 'i' } },
        ];
      }
      const [orders, total] = await Promise.all([
        Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
        Order.countDocuments(filter),
      ]);
      return res.status(200).json({
        success: true,
        count: orders.length,
        total,
        page,
        pages: Math.ceil(total / limit),
        orders: toJSON(orders),
      });
    }

    // Regular user: own order history
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: orders.length, orders: toJSON(orders) });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /order/:id/deliver - Mark a pending order as delivered.
 * Moves it from the Orders collection into DeliveredOrders.
 */
export const deliverOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);
    if (!order) {
      return next(new AppError('Order not found', 404));
    }
    if (order.status !== 'pending') {
      return next(new AppError('Order has already been delivered', 400));
    }

    const delivered = await DeliveredOrder.create({
      orderId: order.orderId,
      originalOrder: order._id,
      user: order.user,
      customer: order.customer,
      items: order.items,
      total: order.total,
      orderDate: order.createdAt,
      deliveredAt: new Date(),
      status: 'delivered',
    });

    await order.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Order marked as delivered',
      order: toJSON(delivered),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /order/:id - Delete a pending order. If stock was already
 * deducted for a user-attached order, it is restored.
 */
export const deleteOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);
    if (!order) {
      return next(new AppError('Order not found', 404));
    }

    // Restore stock for products that belong to this pending order
    for (const item of order.items) {
      await Product.updateOne(
        { _id: item.product },
        { $inc: { stock: item.quantity } }
      );
    }

    await order.deleteOne();
    res.status(200).json({ success: true, message: 'Order deleted and stock restored' });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /order/:id/cancel - Cancel one of the authenticated user's own pending
 * orders. Restores the stock that was deducted when the order was placed, then
 * removes the pending order. Delivered orders can no longer be cancelled.
 */
export const cancelOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = isValidObjectId(id)
      ? await Order.findById(id)
      : await Order.findOne({ orderId: id });

    if (!order) {
      return next(new AppError('Order not found', 404));
    }
    if (!order.user || String(order.user) !== String(req.user._id)) {
      return next(new AppError('You can only cancel your own orders', 403));
    }
    if (order.status !== 'pending') {
      return next(new AppError('Only pending orders can be cancelled', 400));
    }

    // Give the reserved stock back to the catalogue
    for (const item of order.items) {
      await Product.updateOne({ _id: item.product }, { $inc: { stock: item.quantity } });
    }

    await order.deleteOne();
    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      orderId: order.orderId,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /orders/delivered - List delivered orders (admin only).
 */
export const getDeliveredOrders = async (req, res, next) => {
  try {
    const { page, limit, skip } = paginate(req.query);
    const filter = {};
    if (req.query.search) {
      filter.$or = [
        { orderId: { $regex: req.query.search, $options: 'i' } },
        { 'customer.name': { $regex: req.query.search, $options: 'i' } },
        { 'customer.email': { $regex: req.query.search, $options: 'i' } },
      ];
    }

    const [orders, total] = await Promise.all([
      DeliveredOrder.find(filter).sort({ deliveredAt: -1 }).skip(skip).limit(limit),
      DeliveredOrder.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      orders: toJSON(orders),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /orders/delivered - (user variant) a single user's delivered orders.
 */
export const getUserDeliveredOrders = async (req, res, next) => {
  try {
    const orders = await DeliveredOrder.find({ user: req.user._id }).sort({ deliveredAt: -1 });
    res.status(200).json({ success: true, count: orders.length, orders: toJSON(orders) });
  } catch (error) {
    next(error);
  }
};
