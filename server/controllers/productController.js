import Product from '../models/Product.js';
import Category from '../models/Category.js';
import AppError from '../utils/appError.js';
import { isValidObjectId, slugify, generateSku, paginate, toJSON } from '../utils/helpers.js';
import { uploadImageFile, deleteImageByUrl } from '../services/storage.js';

/**
 * Build a Mongoose query from the request query string.
 * Supports: search, category, brand, minPrice, maxPrice, status, sort, page, limit.
 */
const buildProductQuery = async (query) => {
  const q = {};

  if (query.search) {
    q.$or = [
      { name: { $regex: query.search, $options: 'i' } },
      { brand: { $regex: query.search, $options: 'i' } },
      { sku: { $regex: query.search, $options: 'i' } },
      { description: { $regex: query.search, $options: 'i' } },
    ];
  }

  if (query.category) {
    q.category = isValidObjectId(query.category)
      ? query.category
      : { $in: await Category.find({ slug: query.category }).distinct('_id') };
  }

  if (query.brand) q.brand = query.brand;

  if (query.minPrice || query.maxPrice) {
    q.price = {};
    if (query.minPrice) q.price.$gte = Number(query.minPrice);
    if (query.maxPrice) q.price.$lte = Number(query.maxPrice);
  }

  // inStock=true -> only products with stock > 0, inStock=false -> out of stock only
  if (query.inStock === 'true') q.stock = { $gt: 0 };
  if (query.inStock === 'false') q.stock = 0;

  if (query.status === 'active') q.isActive = true;
  if (query.status === 'inactive') q.isActive = false;

  return q;
};

const buildSort = (sort) => {
  // Always include _id as a tie-breaker so that ordering is fully
  // deterministic. Without it, documents sharing the same sort key
  // (e.g. identical createdAt / numReviews / price) can appear on more
  // than one page or be skipped between pages.
  const map = {
    newest: { createdAt: -1, _id: -1 },
    price_asc: { price: 1, _id: 1 },
    price_desc: { price: -1, _id: -1 },
    name_asc: { name: 1, _id: 1 },
    rating: { rating: -1, _id: -1 },
    popular: { numReviews: -1, _id: -1 },
  };
  return map[sort] || { createdAt: -1, _id: -1 };
};

/**
 * Normalizes uploaded image files and JSON image lists into an array of URLs.
 * Newly uploaded files are pushed to Cloudflare R2 (falling back to base64 in
 * MongoDB when R2 is not configured). Existing image URLs are merged in so
 * admins can keep the current pictures while adding more (max 3 per product).
 */
const MAX_IMAGES = 3;

const parseImages = async (body, files) => {
  let existing = [];
  // Existing image URLs come via the "existingImages" text field (FormData) or
  // the "images" field on a plain JSON request. Never mix with file fields of
  // the same name to avoid multer conflicts.
  const raw = body.existingImages !== undefined ? body.existingImages : body.images;
  if (raw) {
    if (Array.isArray(raw)) {
      existing = raw;
    } else {
      try {
        const parsed = JSON.parse(raw);
        existing = Array.isArray(parsed) ? parsed : [raw];
      } catch {
        existing = [raw];
      }
    }
  }

  const uploaded = files && files.length > 0
    ? await Promise.all(files.map((f) => uploadImageFile(f)))
    : [];

  return [...existing, ...uploaded].filter(Boolean).slice(0, MAX_IMAGES);
};

/**
 * GET /products - List products with search, filter, sort and pagination.
 */
export const getProducts = async (req, res, next) => {
  try {
    const { page, limit, skip } = paginate(req.query);
    const filter = await buildProductQuery(req.query);
    const sort = buildSort(req.query.sort);

    const [products, total] = await Promise.all([
      Product.find(filter).sort(sort).skip(skip).limit(limit).allowDiskUse(true),
      Product.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      products: toJSON(products),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /product/:id - Fetch a single product by id or slug.
 */
export const getProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = isValidObjectId(id)
      ? await Product.findById(id)
      : await Product.findOne({ slug: id });

    if (!product) {
      return next(new AppError('Product not found', 404));
    }
    res.status(200).json({ success: true, product: toJSON(product) });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /product - Create a new product (admin only).
 */
export const createProduct = async (req, res, next) => {
  try {
    const { name, category, price, stock, ...rest } = req.body;

    if (!name || !category || price === undefined || stock === undefined) {
      return next(new AppError('Name, category, price and stock are required', 400));
    }
    if (!isValidObjectId(category)) {
      return next(new AppError('Please provide a valid category', 400));
    }

    const product = await Product.create({
      name,
      category,
      price: Number(price),
      stock: Number(stock),
      slug: slugify(name),
      sku: rest.sku || generateSku(name),
      images: await parseImages(req.body, req.files),
      ...rest,
      originalPrice: rest.originalPrice ? Number(rest.originalPrice) : 0,
    });

    res.status(201).json({ success: true, message: 'Product created', product: toJSON(product) });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /product/:id - Update a product (admin only).
 */
export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) {
      return next(new AppError('Product not found', 404));
    }

    const { name, price, stock, originalPrice } = req.body;

    if (name) product.name = name;
    if (price !== undefined) product.price = Number(price);
    if (stock !== undefined) product.stock = Math.max(0, Number(stock));
    if (originalPrice !== undefined) product.originalPrice = Number(originalPrice);
    if (req.body.description !== undefined) product.description = req.body.description;
    if (req.body.category) product.category = req.body.category;
    if (req.body.brand !== undefined) product.brand = req.body.brand;
    if (req.body.sku !== undefined) product.sku = req.body.sku;
    if (req.body.isActive !== undefined) product.isActive = req.body.isActive === true || req.body.isActive === 'true';

    if (
      (req.files && req.files.length > 0) ||
      req.body.images !== undefined ||
      req.body.existingImages !== undefined
    ) {
      product.images = await parseImages(req.body, req.files);
    }

    await product.save();
    res.status(200).json({ success: true, message: 'Product updated', product: toJSON(product) });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /product/:id - Delete a product (admin only).
 */
export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return next(new AppError('Product not found', 404));
    }

    // Best-effort cleanup of the product's images in Cloudflare R2.
    await Promise.allSettled((product.images || []).map((url) => deleteImageByUrl(url)));

    res.status(200).json({ success: true, message: 'Product deleted' });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /products/brands - Distinct list of brands for the filter sidebar.
 */
export const getBrands = async (_req, res, next) => {
  try {
    const brands = await Product.distinct('brand');
    res.status(200).json({ success: true, brands });
  } catch (error) {
    next(error);
  }
};
