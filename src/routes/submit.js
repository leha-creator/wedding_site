const express = require('express');
const router = express.Router();
const telegramService = require('../services/telegram');
// const sheetsService = require('../services/sheets');

router.post('/submit', async (req, res) => {
  const { guests, transport } = req.body;

  if (!Array.isArray(guests) || guests.length === 0) {
    return res.status(400).json({ error: 'guests must be a non-empty array' });
  }

  const validGuests = guests.filter((g) => typeof g === 'string' && g.trim());
  if (validGuests.length === 0) {
    return res.status(400).json({ error: 'at least one valid guest name required' });
  }

  const transportBool = Boolean(transport);
  const data = { guests: validGuests, transport: transportBool };

  console.log('[INFO] Form submission received:', data);

  try {
    await telegramService.sendToTelegram(data);
  } catch (err) {
    console.log('[INFO] Telegram delivery failed:', err.message);
    return res.status(502).json({ error: 'Не удалось отправить заявку. Попробуйте позже.' });
  }

  res.json({ success: true });
});

module.exports = router;
