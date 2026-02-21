/**
 * Sends form submissions to a Telegram chat via Bot API.
 * Requires TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in .env
 */

function formatMessage(data, isUpdate = false) {
  const guests = data.guests.join('\n• ');
  const transport = data.transport ? 'Да' : 'Нет';
  const header = isUpdate ? '🔄 <b>Обновлённая анкета с сайта</b>' : '🆕 <b>Новая заявка с сайта</b>';
  return `${header}\n\n<b>Гости:</b>\n• ${guests}\n\n<b>Нужен транспорт:</b> ${transport}`;
}

async function sendToTelegram(data, isUpdate = false) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.log('[INFO] Telegram: skipped (TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set)');
    return;
  }

  const text = formatMessage(data, isUpdate);
  const url = `https://api.telegram.org/bot${token}/sendMessage`;

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
    console.log('[INFO] Telegram send failed:', err);
    throw new Error(`Telegram: ${err}`);
  }

  console.log('[INFO] Telegram: message sent to chat', chatId);
}

module.exports = { sendToTelegram };
