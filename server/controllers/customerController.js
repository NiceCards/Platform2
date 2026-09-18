import User from '../models/User.js';
import Order from '../models/Order.js';
import DeliveredOrder from '../models/DeliveredOrder.js';
import Product from '../models/Product.js';
import AppError from '../utils/appError.js';
import { isValidObjectId, paginate, toJSON } from '../utils/helpers.js';

/**
 * GET /customers - List customers with search + pagination.
 * Each customer includes order count and total spending.
 */
export const getCustomers = async (req, res, next) => {
  try {
    const { page, limit, skip } = paginate(req.query);

    const filter = {};
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
        { phone: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    const [customers, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      User.countDocuments(filter),
    ]);

    const userIds = customers.map((c) => c._id);

    const [pendingAgg, deliveredAgg] = await Promise.all([
      Order.aggregate([
        { $match: { user: { $in: userIds } } },
        { $group: { _id: '$user', orders: { $sum: 1 }, spending: { $sum: '$total' } } },
      ]),
      DeliveredOrder.aggregate([
        { $match: { user: { $in: userIds } } },
        { $group: { _id: '$user', orders: { $sum: 1 }, spending: { $sum: '$total' } } },
      ]),
    ]);

    const stats = new Map();
    [...pendingAgg, ...deliveredAgg].forEach((row) => {
      const cur = stats.get(String(row._id)) || { orders: 0, spending: 0 };
      cur.orders += row.orders;
      cur.spending += row.spending;
      stats.set(String(row._id), cur);
    });

    const result = customers.map((c) => {
      const s = stats.get(String(c._id)) || { orders: 0, spending: 0 };
      return {
        ...c,
        password: undefined,
        totalOrders: s.orders,
        totalSpending: Number(s.spending.toFixed(2)),
      };
    });

    res.status(200).json({
      success: true,
      count: result.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      customers: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /customer/:id - Customer profile with full order history.
 */
export const getCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return next(new AppError('Invalid customer id', 400));
    }

    const customer = await User.findById(id);
    if (!customer) {
      return next(new AppError('Customer not found', 404));
    }

    const [orders, delivered] = await Promise.all([
      Order.find({ user: id }).sort({ createdAt: -1 }),
      DeliveredOrder.find({ user: id }).sort({ deliveredAt: -1 }),
    ]);

    const pendingOrders = orders.filter((o) => o.status === 'pending').length;
    const totalSpending = [...orders, ...delivered].reduce((sum, o) => sum + o.total, 0);

    res.status(200).json({
      success: true,
      customer: {
        ...toJSON(customer),
        password: undefined,
        stats: {
          totalOrders: orders.length + delivered.length,
          pendingOrders,
          deliveredOrders: delivered.length,
          totalSpending: Number(totalSpending.toFixed(2)),
        },
      },
      orderHistory: {
        pending: toJSON(orders),
        delivered: toJSON(delivered),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /customer/:id - Update customer (enable / disable account).
 */
export const updateCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return next(new AppError('Invalid customer id', 400));
    }

    const customer = await User.findById(id);
    if (!customer) {
      return next(new AppError('Customer not found', 404));
    }

    if (req.body.isActive !== undefined) {
      customer.isActive = req.body.isActive === true || req.body.isActive === 'true';
    }
    if (req.body.name) customer.name = req.body.name;
    if (req.body.phone) customer.phone = req.body.phone;

    await customer.save();
    res.status(200).json({ success: true, message: 'Customer updated', customer: toJSON(customer) });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /customer/:id - Delete a customer and their orders.
 */
export const deleteCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return next(new AppError('Invalid customer id', 400));
    }

    const customer = await User.findByIdAndDelete(id);
    if (!customer) {
      return next(new AppError('Customer not found', 404));
    }

    // Remove the customer's orders and restore product stock for pending orders.
    const pendingOrders = await Order.find({ user: id });
    for (const order of pendingOrders) {
      for (const item of order.items) {
        await Product.updateOne({ _id: item.product }, { $inc: { stock: item.quantity } });
      }
    }
    await Order.deleteMany({ user: id });
    await DeliveredOrder.deleteMany({ user: id });

    res.status(200).json({ success: true, message: 'Customer deleted' });
  } catch (error) {
    next(error);
  }
};
