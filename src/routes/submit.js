const express = require('express');
const router = express.Router();
const telegramService = require('../services/telegram');
const submissions = require('../services/submissions');
// const sheetsService = require('../services/sheets');

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const LOG_LEVEL = (process.env.LOG_LEVEL || 'info').toLowerCase();
const log = {
  debug: (msg, data) =>
    ['debug'].includes(LOG_LEVEL) && console.log('[submit]', msg, data !== undefined ? data : ''),
  info: (msg, data) =>
    ['debug', 'info'].includes(LOG_LEVEL) &&
    console.log('[submit]', msg, data !== undefined ? data : ''),
  warn: (msg, data) =>
    ['debug', 'info', 'warn'].includes(LOG_LEVEL) &&
    console.warn('[submit] WARN', msg, data !== undefined ? data : ''),
};

function isValidUserId(id) {
  return typeof id === 'string' && UUID_REGEX.test(id);
}

router.post('/submit', async (req, res) => {
  const { user_id, guests, transport } = req.body;
  log.debug('POST /submit', { user_id: user_id ? '...' : null });

  if (!user_id || !isValidUserId(user_id)) {
    log.warn('Missing or invalid user_id');
    return res.status(400).json({ error: 'user_id is required and must be a valid UUID' });
  }

  if (!Array.isArray(guests) || guests.length === 0) {
    return res.status(400).json({ error: 'guests must be a non-empty array' });
  }

  const validGuests = guests.filter((g) => typeof g === 'string' && g.trim());
  if (validGuests.length === 0) {
    return res.status(400).json({ error: 'at least one valid guest name required' });
  }

  const transportBool = Boolean(transport);
  const data = { guests: validGuests, transport: transportBool };

  try {
    const { created } = submissions.createOrUpdate(user_id, data);
    log.info(created ? 'Created' : 'Updated', { user_id });

    try {
      await telegramService.sendToTelegram(data, !created);
    } catch (err) {
      log.warn('Telegram delivery failed', { message: err.message });
      return res.status(502).json({ error: 'Не удалось отправить заявку. Попробуйте позже.' });
    }

    const record = submissions.getByUserId(user_id);
    res.json({ success: true, data: record });
  } catch (err) {
    log.warn('createOrUpdate failed', { message: err.message });
    console.error('[submit] ERROR', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
