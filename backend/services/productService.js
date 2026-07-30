const ProductModel = require('../models/productModel');
const CategoryModel = require('../models/categoryModel');
const ApiError = require('../utils/ApiError');
const { deleteImageFile } = require('../middlewares/uploadMiddleware');
const { upload: uploadConfig } = require('../config/env');

const MAX_PAGE_SIZE = 100;

function toPublicImagePath(imagePath) {
  return imagePath ? `/${uploadConfig.dir}/${imagePath.split('/').pop()}` : null;
}

function serialize(product) {
  return { ...product, image_path: toPublicImagePath(product.image_path) };
}

const ProductService = {
  async list({ search, categoryId, sort, order, page, limit }) {
    const safePage = Math.max(1, Number(page) || 1);
    const safeLimit = Math.min(MAX_PAGE_SIZE, Math.max(1, Number(limit) || 10));
    const normalizedOrder = order ? order.toUpperCase() : undefined;

    const { items, total } = await ProductModel.findPaginated({
      search,
      categoryId,
      sortBy: sort,
      sortOrder: normalizedOrder,
      page: safePage,
      limit: safeLimit
    });

    return {
      items: items.map(serialize),
      total,
      page: safePage,
      limit: safeLimit,
      totalPages: Math.max(1, Math.ceil(total / safeLimit))
    };
  },

  async getById(id) {
    const product = await ProductModel.findById(id);
    if (!product) {
      throw ApiError.notFound('Product not found');
    }
    return serialize(product);
  },

  async create({ name, price, categoryId }, file) {
    await this.assertCategoryExists(categoryId);

    const imagePath = file ? `${uploadConfig.dir}/${file.filename}` : null;
    const product = await ProductModel.create({ name, price, categoryId, imagePath });
    return serialize(product);
  },

  async update(id, { name, price, categoryId }, file) {
    const existing = await ProductModel.findById(id);
    if (!existing) {
      throw ApiError.notFound('Product not found');
    }
    await this.assertCategoryExists(categoryId);

    let imagePath;
    if (file) {
      imagePath = `${uploadConfig.dir}/${file.filename}`;
      deleteImageFile(existing.image_path);
    }

    const product = await ProductModel.update(id, { name, price, categoryId, imagePath });
    return serialize(product);
  },

  async remove(id) {
    const existing = await ProductModel.findById(id);
    if (!existing) {
      throw ApiError.notFound('Product not found');
    }
    await ProductModel.remove(id);
    deleteImageFile(existing.image_path);
  },

  async assertCategoryExists(categoryId) {
    const category = await CategoryModel.findById(categoryId);
    if (!category) {
      throw ApiError.badRequest('Selected category does not exist');
    }
  }
};

module.exports = ProductService;