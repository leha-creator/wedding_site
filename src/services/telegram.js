/**
 * Sends form submissions to Telegram chats via Bot API.
 * Requires TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in .env
 * TELEGRAM_CHAT_ID: one ID or multiple IDs separated by comma
 */

function formatMessage(data, isUpdate = false) {
  const guests = data.guests.join('\n• ');
  const transport = data.transport ? 'Да' : 'Нет';
  const header = isUpdate ? '🔄 <b>Обновлённая анкета с сайта</b>' : '🆕 <b>Новая заявка с сайта</b>';
  return `${header}\n\n<b>Гости:</b>\n• ${guests}\n\n<b>Нужен транспорт:</b> ${transport}`;
}

async function sendToTelegram(data, isUpdate = false) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatIds = (process.env.TELEGRAM_CHAT_ID || '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);

  if (!token || chatIds.length === 0) {
    console.log('[INFO] Telegram: skipped (TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set)');
    return;
  }

  const text = formatMessage(data, isUpdate);
  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  let successCount = 0;
  const errors = [];

  for (const chatId of chatIds) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: 'HTML',
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.ok) {
        const err = json.description || `HTTP ${res.status}`;
        errors.push({ chatId, err });
        console.log('[INFO] Telegram send failed for chat', chatId, ':', err);
      } else {
        successCount++;
        console.log('[INFO] Telegram: message sent to chat', chatId);
      }
    } catch (err) {
      errors.push({ chatId, err: err.message });
      console.log('[INFO] Telegram send failed for chat', chatId, ':', err.message);
    }
  }

  if (successCount === 0 && errors.length > 0) {
    const firstErr = errors[0];
    throw new Error(`Telegram: ${firstErr.err}`);
  }
}

module.exports = { sendToTelegram };
