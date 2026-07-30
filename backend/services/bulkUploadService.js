const { Readable } = require('stream');
const csvParser = require('csv-parser');
const ExcelJS = require('exceljs');
const CategoryModel = require('../models/categoryModel');
const ProductModel = require('../models/productModel');
const ApiError = require('../utils/ApiError');

const BATCH_SIZE = 500;
const REQUIRED_COLUMNS = ['name', 'price', 'category'];

function parseCsvBuffer(buffer) {
  return new Promise((resolve, reject) => {
    const rows = [];
    Readable.from(buffer)
      .pipe(csvParser())
      .on('data', (row) => rows.push(row))
      .on('end', () => resolve(rows))
      .on('error', reject);
  });
}

async function parseXlsxBuffer(buffer) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  const worksheet = workbook.worksheets[0];
  if (!worksheet) return [];

  const headerRow = worksheet.getRow(1);
  const headers = [];
  headerRow.eachCell((cell, colNumber) => {
    headers[colNumber] = String(cell.value ?? '').trim().toLowerCase();
  });

  const rows = [];
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const obj = {};
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      const key = headers[colNumber];
      if (key) obj[key] = cell.value !== null && cell.value !== undefined ? String(cell.value) : '';
    });
    if (Object.values(obj).some((v) => v !== '')) {
      rows.push(obj);
    }
  });
  return rows;
}

function validateRow(rawRow, categoryNameToId) {
  const name = (rawRow.name || '').toString().trim();
  const priceRaw = (rawRow.price || '').toString().trim();
  const categoryName = (rawRow.category || '').toString().trim();

  if (!name) return { valid: false, reason: 'Missing product name' };
  if (name.length > 200) return { valid: false, reason: 'Product name exceeds 200 characters' };

  const price = Number(priceRaw);
  if (!priceRaw || Number.isNaN(price) || price < 0) {
    return { valid: false, reason: `Invalid price: "${priceRaw}"` };
  }

  if (!categoryName) return { valid: false, reason: 'Missing category' };
  const categoryId = categoryNameToId.get(categoryName.toLowerCase());
  if (!categoryId) {
    return { valid: false, reason: `Unknown category: "${categoryName}"` };
  }

  return { valid: true, data: { name, price, categoryId } };
}

const BulkUploadService = {
  async processFile(file) {
    if (!file) {
      throw ApiError.badRequest('No file uploaded');
    }

    const ext = file.originalname.slice(file.originalname.lastIndexOf('.')).toLowerCase();
    let rawRows;

    if (ext === '.csv') {
      rawRows = await parseCsvBuffer(file.buffer);
    } else if (ext === '.xlsx') {
      rawRows = await parseXlsxBuffer(file.buffer);
    } else {
      throw ApiError.badRequest('Unsupported file type. Please upload a .csv or .xlsx file.');
    }

    if (!rawRows.length) {
      throw ApiError.badRequest('The uploaded file contains no data rows');
    }

    rawRows = rawRows.map((row) => {
      const normalized = {};
      for (const [key, value] of Object.entries(row)) {
        normalized[key.trim().toLowerCase()] = value;
      }
      return normalized;
    });

    const firstRowKeys = Object.keys(rawRows[0]);
    const missingColumns = REQUIRED_COLUMNS.filter((c) => !firstRowKeys.includes(c));
    if (missingColumns.length) {
      throw ApiError.badRequest(
        `Missing required column(s): ${missingColumns.join(', ')}. Expected columns: name, price, category`
      );
    }

    const categories = await CategoryModel.findAll();
    const categoryNameToId = new Map(categories.map((c) => [c.name.toLowerCase(), c.id]));

    const errors = [];
    const validRows = [];

    rawRows.forEach((rawRow, index) => {
      const rowNumber = index + 2;
      const result = validateRow(rawRow, categoryNameToId);
      if (result.valid) {
        validRows.push(result.data);
      } else {
        errors.push({ row: rowNumber, message: result.reason });
      }
    });

    let insertedCount = 0;
    for (let i = 0; i < validRows.length; i += BATCH_SIZE) {
      const batch = validRows.slice(i, i + BATCH_SIZE);
      insertedCount += await ProductModel.bulkInsert(batch);
    }

    return {
      totalRows: rawRows.length,
      successCount: insertedCount,
      failedCount: errors.length,
      errors: errors.slice(0, 200)
    };
  }
};

module.exports = BulkUploadService;