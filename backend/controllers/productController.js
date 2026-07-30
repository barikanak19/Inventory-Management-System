const ProductService = require('../services/productService');
const asyncHandler = require('../utils/asyncHandler');

const list = asyncHandler(async (req, res) => {
  const { search, categoryId, sort, order, page, limit } = req.query;
  const result = await ProductService.list({ search, categoryId, sort, order, page, limit });
  res.status(200).json({ success: true, message: 'Products fetched', data: result });
});

const getOne = asyncHandler(async (req, res) => {
  const product = await ProductService.getById(req.params.id);
  res.status(200).json({ success: true, message: 'Product fetched', data: product });
});

const create = asyncHandler(async (req, res) => {
  const { name, price, categoryId } = req.body;
  const product = await ProductService.create(
    { name, price: Number(price), categoryId: Number(categoryId) },
    req.file
  );
  res.status(201).json({ success: true, message: 'Product created', data: product });
});

const update = asyncHandler(async (req, res) => {
  const { name, price, categoryId } = req.body;
  const product = await ProductService.update(
    req.params.id,
    { name, price: Number(price), categoryId: Number(categoryId) },
    req.file
  );
  res.status(200).json({ success: true, message: 'Product updated', data: product });
});

const remove = asyncHandler(async (req, res) => {
  await ProductService.remove(req.params.id);
  res.status(200).json({ success: true, message: 'Product deleted' });
});

module.exports = { list, getOne, create, update, remove };