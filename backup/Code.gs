/**
 * Wedding Song Bingo backup.
 *
 * The website sends each guest's picks here when they save them. This script
 * keeps one row per guest on the "Picks" tab and updates that row when the
 * guest edits their picks. Deploy it as a web app (see README, "Google Sheet
 * backup").
 */
const SHEET_NAME = 'Picks';
const HEADERS = ['Guest ID', 'Name', 'Song 1', 'Artist 1', 'Song 2', 'Artist 2', 'Song 3', 'Artist 3', 'First saved', 'Last saved'];
const MAX_ROWS = 500;

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const entries = parseEntries_(e);
    const sheet = getSheet_();
    entries.forEach(function (entry) { upsert_(sheet, entry); });
    return json_({ ok: true, saved: entries.length });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

/** Opening the web app URL in a browser shows this, which confirms it is deployed. */
function doGet() {
  return ContentService.createTextOutput('Wedding Song Bingo backup is running.');
}

function parseEntries_(e) {
  const body = JSON.parse(e.postData.contents);
  const list = Array.isArray(body.picks) ? body.picks : [body];
  return list.filter(isValid_).slice(0, MAX_ROWS);
}

function isValid_(p) {
  return p && typeof p.id === 'string' && p.id.length > 0 && p.id.length <= 128 &&
    typeof p.name === 'string' && Array.isArray(p.songs) && p.songs.length === 3;
}

/** Trim, cap length, and stop text that starts like a formula from running as one. */
function clean_(v) {
  var s = String(v == null ? '' : v).slice(0, 200);
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}

function getSheet_() {
  const book = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = book.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = book.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) sheet.appendRow(HEADERS);
  return sheet;
}

function upsert_(sheet, p) {
  const last = sheet.getLastRow();
  const ids = last > 1 ? sheet.getRange(2, 1, last - 1, 1).getValues().map(function (r) { return String(r[0]); }) : [];
  const index = ids.indexOf(p.id);
  const row = [clean_(p.id), clean_(p.name)];
  p.songs.forEach(function (s) { row.push(clean_(s && s.title), clean_(s && s.artist)); });
  const now = new Date();
  if (index >= 0) {
    sheet.getRange(index + 2, 1, 1, row.length).setValues([row]);
    sheet.getRange(index + 2, 10).setValue(now);
  } else if (ids.length < MAX_ROWS) {
    sheet.appendRow(row.concat([now, now]));
  }
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
