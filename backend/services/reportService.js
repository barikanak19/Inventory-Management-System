const ExcelJS = require('exceljs');
const ProductModel = require('../models/productModel');

function escapeCsvField(value) {
  const str = value === null || value === undefined ? '' : String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

const REPORT_COLUMNS = [
  { header: 'ID', key: 'id' },
  { header: 'Product Name', key: 'name' },
  { header: 'Price', key: 'price' },
  { header: 'Category', key: 'category_name' },
  { header: 'Created At', key: 'created_at' }
];

const ReportService = {
  async streamCsv(res, { search, categoryId }) {
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="products-report.csv"');

    res.write(REPORT_COLUMNS.map((c) => escapeCsvField(c.header)).join(',') + '\n');

    const dbStream = await ProductModel.streamAll({ search, categoryId });

    return new Promise((resolve, reject) => {
      dbStream.on('data', (row) => {
        const line = REPORT_COLUMNS.map((c) => escapeCsvField(row[c.key])).join(',');
        res.write(line + '\n');
      });
      dbStream.on('end', () => {
        res.end();
        resolve();
      });
      dbStream.on('error', (err) => {
        reject(err);
      });
    });
  },

  async streamXlsx(res, { search, categoryId }) {
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', 'attachment; filename="products-report.xlsx"');

    const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({ stream: res });
    const worksheet = workbook.addWorksheet('Products');
    worksheet.columns = REPORT_COLUMNS;

    const dbStream = await ProductModel.streamAll({ search, categoryId });

    return new Promise((resolve, reject) => {
      dbStream.on('data', (row) => {
        worksheet.addRow(row).commit();
      });
      dbStream.on('end', async () => {
        worksheet.commit();
        await workbook.commit();
        resolve();
      });
      dbStream.on('error', (err) => {
        reject(err);
      });
    });
  }
};

module.exports = ReportService;