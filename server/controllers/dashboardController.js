import Product from '../models/Product.js';
import Order from '../models/Order.js';
import DeliveredOrder from '../models/DeliveredOrder.js';
import User from '../models/User.js';
import Category from '../models/Category.js';
import { paginate, toJSON } from '../utils/helpers.js';

const LOW_STOCK_THRESHOLD = 1000;

/**
 * GET /admin/dashboard - Aggregate statistics for the admin dashboard.
 */
export const getDashboardStats = async (_req, res, next) => {
  try {
    const [
      totalProducts,
      activeProducts,
      totalCustomers,
      pendingOrdersCount,
      deliveredOrdersCount,
      categoriesCount,
      pendingAgg,
      deliveredAgg,
      lowStock,
      lowStockCount,
      latestCustomers,
      recentPendingOrders,
    ] = await Promise.all([
      Product.countDocuments(),
      Product.countDocuments({ isActive: true }),
      User.countDocuments(),
      Order.countDocuments({ status: 'pending' }),
      DeliveredOrder.countDocuments(),
      Category.countDocuments(),
      Order.aggregate([
        { $match: { status: 'pending' } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      DeliveredOrder.aggregate([
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      Product.find({ stock: { $lte: LOW_STOCK_THRESHOLD }, isActive: true })
        .sort({ stock: 1 })
        .limit(200)
        .select('name stock price images')
        .allowDiskUse(true),
      Product.countDocuments({ stock: { $lte: LOW_STOCK_THRESHOLD }, isActive: true }),
      User.find().sort({ createdAt: -1 }).limit(5).select('name email createdAt isActive'),
      Order.find({ status: 'pending' }).sort({ createdAt: -1 }).limit(5),
    ]);

    const pendingRevenue = pendingAgg[0] ? pendingAgg[0].total : 0;
    const deliveredRevenue = deliveredAgg[0] ? deliveredAgg[0].total : 0;

    res.status(200).json({
      success: true,
      stats: {
        totalProducts,
        activeProducts,
        totalCustomers,
        pendingOrders: pendingOrdersCount,
        deliveredOrders: deliveredOrdersCount,
        categories: categoriesCount,
        pendingRevenue: Number(pendingRevenue.toFixed(2)),
        deliveredRevenue: Number(deliveredRevenue.toFixed(2)),
        totalRevenue: Number((pendingRevenue + deliveredRevenue).toFixed(2)),
        lowStockCount,
        lowStock: toJSON(lowStock),
      },
      latestCustomers: toJSON(latestCustomers),
      recentOrders: toJSON(recentPendingOrders),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /admin/dashboard/charts - Data for the monthly orders & sales graphs.
 */
export const getCharts = async (_req, res, next) => {
  try {
    const monthsAgo = (n) => {
      const d = new Date();
      d.setMonth(d.getMonth() - n, 1);
      d.setHours(0, 0, 0, 0);
      return d;
    };

    const since = monthsAgo(6);
    const now = new Date();

    const pending = await Order.aggregate([
      { $match: { createdAt: { $gte: since, $lte: now } } },
      {
        $group: {
          _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
          orders: { $sum: 1 },
          sales: { $sum: '$total' },
        },
      },
    ]);

    const delivered = await DeliveredOrder.aggregate([
      { $match: { deliveredAt: { $gte: since, $lte: now } } },
      {
        $group: {
          _id: { month: { $month: '$deliveredAt' }, year: { $year: '$deliveredAt' } },
          orders: { $sum: 1 },
          sales: { $sum: '$total' },
        },
      },
    ]);

    // Build a 6 month series with zero filled months.
    const months = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    for (let i = 5; i >= 0; i -= 1) {
      const d = new Date();
      d.setMonth(d.getMonth() - i, 1);
      months.push({
        key: `${d.getMonth() + 1}-${d.getFullYear()}`,
        label: `${monthNames[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`,
      });
    }

    const mapTo = (rows) => {
      const m = new Map();
      rows.forEach((row) => {
        const key = `${row._id.month}-${row._id.year}`;
        m.set(key, { orders: row.orders, sales: row.sales });
      });
      return m;
    };

    const pendingMap = mapTo(pending);
    const deliveredMap = mapTo(delivered);

    const series = months.map((m) => {
      const p = pendingMap.get(m.key) || { orders: 0, sales: 0 };
      const d = deliveredMap.get(m.key) || { orders: 0, sales: 0 };
      return {
        month: m.label,
        pendingOrders: p.orders,
        deliveredOrders: d.orders,
        pendingSales: Number(p.sales.toFixed(2)),
        deliveredSales: Number(d.sales.toFixed(2)),
      };
    });

    res.status(200).json({ success: true, series });
  } catch (error) {
    next(error);
  }
};
