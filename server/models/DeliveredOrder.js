import mongoose from 'mongoose';

const deliveredItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    image: { type: String },
  },
  { _id: false }
);

const deliveredOrderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
    },
    originalOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    customer: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
    },
    items: [deliveredItemSchema],
    total: { type: Number, required: true },
    orderDate: { type: Date, required: true },
    deliveredAt: { type: Date, default: Date.now },
    status: {
      type: String,
      default: 'delivered',
    },
  },
  { timestamps: true }
);

const DeliveredOrder = mongoose.model('DeliveredOrder', deliveredOrderSchema);
export default DeliveredOrder;
