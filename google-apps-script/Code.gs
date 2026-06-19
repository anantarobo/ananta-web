/**
 * Paste in: Sheet → Extensions → Apps Script → Save → Deploy (New version)
 * Set VITE_GOOGLE_SCRIPT_URL in .env to the Web app URL
 */

const SHEET_ID = '1e1FYCk3EiW22C-OJeFTcoTlMzYDIHbhnd8TZFdFKMg'

function doGet(e) {
  try {
    var params = e && e.parameter ? e.parameter : {}

    if (params.name || params.email || params.phone) {
      saveLead(params)
      return jsonResponse({
        ok: true,
        message: 'Data saved to Google Sheet successfully!',
      })
    }

    return jsonResponse({ ok: true, message: 'Apps Script is running' })
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) })
  }
}

function saveLead(data) {
  var sheet = getSheet()

  sheet.appendRow([
    String(data.name || '').trim(),
    String(data.email || '').trim(),
    String(data.phone || '').trim(),
    String(data.city || '').trim(),
    String(data.description || '').trim(),
  ])
}

function getSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet()
  if (ss) return ss.getSheets()[0]
  return SpreadsheetApp.openById(SHEET_ID).getSheets()[0]
}

function jsonResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON)
}
