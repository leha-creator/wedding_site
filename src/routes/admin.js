/**
 * Admin API: submissions list with pagination, sorting, search, export.
 */

const express = require('express');
const XLSX = require('xlsx');
const router = express.Router();
const submissions = require('../services/submissions');

const LOG_LEVEL = (process.env.LOG_LEVEL || 'info').toLowerCase();
const log = {
  info: (msg, data) =>
    ['debug', 'info'].includes(LOG_LEVEL) &&
    console.log('[admin]', msg, data !== undefined ? data : ''),
  warn: (msg, data) =>
    ['debug', 'info', 'warn'].includes(LOG_LEVEL) &&
    console.warn('[admin] WARN', msg, data !== undefined ? data : ''),
};

router.get('/submissions', (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
  const offset = (page - 1) * limit;
  const sortBy = req.query.sort || 'updated_at';
  const order = req.query.order || 'desc';
  const search = req.query.search || '';

  log.info('GET /admin/submissions', { page, limit, sortBy, order, hasSearch: !!search });

  try {
    const { items, total } = submissions.getAll({ limit, offset, sortBy, order, search });
    res.json({ items, total, page, limit });
  } catch (err) {
    console.error('[admin] ERROR', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/submissions/export', (req, res) => {
  const format = (req.query.format || 'csv').toLowerCase();
  const limit = Math.min(100000, Math.max(1, parseInt(req.query.limit, 10) || 10000));
  const search = req.query.search || '';

  log.info('Export requested', { format, limit, hasSearch: !!search });

  try {
    const { items } = submissions.getAll({
      limit,
      offset: 0,
      sortBy: 'updated_at',
      order: 'desc',
      search,
    });

    const headers = ['user_id', 'guests', 'transport', 'created_at', 'updated_at'];

    if (format === 'csv') {
      const lines = [headers.join(',')];
      items.forEach((row) => {
        const guests = (row.guests || []).join('; ');
        const transport = row.transport ? 'Да' : 'Нет';
        const escaped = (v) =>
          '"' + String(v || '').replace(/"/g, '""') + '"';
        lines.push(
          [
            escaped(row.user_id),
            escaped(guests),
            escaped(transport),
            escaped(row.created_at),
            escaped(row.updated_at),
          ].join(',')
        );
      });
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="submissions.csv"');
      res.send('\uFEFF' + lines.join('\n')); // BOM for Excel UTF-8
      return;
    }

    if (format === 'xlsx') {
      const rows = [
        ['User ID', 'Гости', 'Транспорт', 'Создано', 'Обновлено'],
        ...items.map((row) => [
          row.user_id,
          (row.guests || []).join(', '),
          row.transport ? 'Да' : 'Нет',
          row.created_at || '',
          row.updated_at || '',
        ]),
      ];
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(rows);
      XLSX.utils.book_append_sheet(wb, ws, 'Анкеты');
      const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="submissions.xlsx"');
      res.send(buf);
      return;
    }

    res.status(400).json({ error: 'Invalid format. Use csv or xlsx.' });
  } catch (err) {
    console.error('[admin] Export ERROR', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
