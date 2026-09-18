import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [120, 'Name must be at most 120 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [2000, 'Description must be at most 2000 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    originalPrice: {
      type: Number,
      default: 0,
      min: [0, 'Original price cannot be negative'],
    },
    brand: {
      type: String,
      trim: true,
      default: 'Nice Cards',
    },
    sku: {
      type: String,
      trim: true,
      unique: true,
      uppercase: true,
    },
    images: [
      {
        type: String,
      },
    ],
    stock: {
      type: Number,
      required: [true, 'Stock is required'],
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Supports the admin dashboard low-stock query (filter on isActive + stock, sorted by stock)
productSchema.index({ isActive: 1, stock: 1 });

// Virtual flag: whether the product is currently out of stock
productSchema.virtual('status').get(function () {
  return this.stock > 0 ? 'In Stock' : 'Out of Stock';
});

// Populate category name automatically when read
productSchema.pre(/^find/, function (next) {
  this.populate({ path: 'category', select: 'name slug' });
  next();
});

productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

const Product = mongoose.model('Product', productSchema);
export default Product;
