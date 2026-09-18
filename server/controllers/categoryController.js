import Category from '../models/Category.js';
import Product from '../models/Product.js';
import AppError from '../utils/appError.js';
import { slugify, toJSON } from '../utils/helpers.js';

/**
 * GET /categories - List all active categories with product counts.
 */
export const getCategories = async (_req, res, next) => {
  try {
    const categories = await Category.find().sort({ name: 1 }).lean();

    const counts = await Product.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);
    const countMap = new Map(counts.map((c) => [String(c._id), c.count]));

    // Fall back to the newest active product image when a category has no image.
    const samples = await Product.aggregate([
      { $match: { isActive: true, 'images.0': { $exists: true, $ne: '' } } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: '$category',
          image: { $first: { $arrayElemAt: ['$images', 0] } },
        },
      },
    ]);
    const sampleMap = new Map(samples.map((s) => [String(s._id), s.image]));

    const result = categories.map((c) => ({
      ...c,
      image: c.image || sampleMap.get(String(c._id)) || '',
      productCount: countMap.get(String(c._id)) || 0,
    }));

    res.status(200).json({ success: true, count: result.length, categories: result });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /category - Create a category (admin only).
 */
export const createCategory = async (req, res, next) => {
  try {
    const { name, description, image } = req.body;
    if (!name) {
      return next(new AppError('Category name is required', 400));
    }

    const exists = await Category.findOne({ name: { $regex: `^${name}$`, $options: 'i' } });
    if (exists) {
      return next(new AppError('A category with this name already exists', 409));
    }

    const category = await Category.create({
      name,
      slug: slugify(name),
      description: description || '',
      image: image || '',
    });

    res.status(201).json({ success: true, message: 'Category created', category: toJSON(category) });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /category/:id - Update a category (admin only).
 */
export const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);
    if (!category) {
      return next(new AppError('Category not found', 404));
    }

    if (req.body.name) category.name = req.body.name;
    if (req.body.description !== undefined) category.description = req.body.description;
    if (req.body.image !== undefined) category.image = req.body.image;
    if (req.body.isActive !== undefined) {
      category.isActive = req.body.isActive === true || req.body.isActive === 'true';
    }

    await category.save();
    res.status(200).json({ success: true, message: 'Category updated', category: toJSON(category) });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /category/:id - Delete a category (admin only).
 */
export const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const productsInCategory = await Product.countDocuments({ category: id });
    if (productsInCategory > 0) {
      return next(
        new AppError(
          `Cannot delete this category because ${productsInCategory} product(s) are still assigned to it`,
          400
        )
      );
    }

    const category = await Category.findByIdAndDelete(id);
    if (!category) {
      return next(new AppError('Category not found', 404));
    }

    res.status(200).json({ success: true, message: 'Category deleted' });
  } catch (error) {
    next(error);
  }
};
