const CategoryModel = require('../models/categoryModel');
const ApiError = require('../utils/ApiError');

const CategoryService = {
  async list(search) {
    return CategoryModel.findAll(search);
  },

  async getById(id) {
    const category = await CategoryModel.findById(id);
    if (!category) {
      throw ApiError.notFound('Category not found');
    }
    return category;
  },

  async create({ name }) {
    const existing = await CategoryModel.findByName(name);
    if (existing) {
      throw ApiError.conflict('A category with this name already exists');
    }
    return CategoryModel.create({ name });
  },

  async update(id, { name }) {
    await this.getById(id);

    const existing = await CategoryModel.findByName(name);
    if (existing && existing.id !== Number(id)) {
      throw ApiError.conflict('A category with this name already exists');
    }
    return CategoryModel.update(id, { name });
  },

  async remove(id) {
    await this.getById(id);

    const productCount = await CategoryModel.productCount(id);
    if (productCount > 0) {
      throw ApiError.conflict(
        `Cannot delete this category: ${productCount} product(s) still reference it`
      );
    }

    await CategoryModel.remove(id);
  }
};

module.exports = CategoryService;