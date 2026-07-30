const CategoryService = require('../services/categoryService');
const asyncHandler = require('../utils/asyncHandler');

const list = asyncHandler(async (req, res) => {
  const categories = await CategoryService.list(req.query.search);
  res.status(200).json({ success: true, message: 'Categories fetched', data: categories });
});

const getOne = asyncHandler(async (req, res) => {
  const category = await CategoryService.getById(req.params.id);
  res.status(200).json({ success: true, message: 'Category fetched', data: category });
});

const create = asyncHandler(async (req, res) => {
  const category = await CategoryService.create(req.body);
  res.status(201).json({ success: true, message: 'Category created', data: category });
});

const update = asyncHandler(async (req, res) => {
  const category = await CategoryService.update(req.params.id, req.body);
  res.status(200).json({ success: true, message: 'Category updated', data: category });
});

const remove = asyncHandler(async (req, res) => {
  await CategoryService.remove(req.params.id);
  res.status(200).json({ success: true, message: 'Category deleted' });
});

module.exports = { list, getOne, create, update, remove };