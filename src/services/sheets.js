/**
 * Placeholder for Google Sheets integration.
 * Future: add form submissions to Google Sheet.
 */
async function addToSheets(data) {
  // TODO: use google-spreadsheet or googleapis
  // const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID);
  // await doc.addRow({ guests: data.guests.join(', '), transport: data.transport });
  console.log('[INFO] Sheets service: would add', data);
}

module.exports = { addToSheets };
