/**
 * VetConnect Bookings — receives each "Continue to WhatsApp" booking from the
 * website and adds it as a row in this sheet.
 *
 * Setup: in the sheet, Extensions → Apps Script, paste this file, then
 * Deploy → New deployment → Web app (Execute as: Me, Who has access: Anyone).
 * Put the web app URL in Cloudflare as BOOKINGS_SHEET_URL.
 *
 * Columns are matched by header name, so you can reorder columns or add your
 * own (e.g. more follow-up columns) without touching this script.
 */

// Website field -> sheet column header.
var FIELDS = {
  ref: "Booking ID",
  date: "Consult date",
  slot: "Time slot",
  price: "Price (₹)",
  pet: "Pet",
  gender: "Gender",
  age: "Age",
  language: "Language",
  issue: "Issue",
  name: "Owner name",
  phone: "Phone",
  email: "Email",
  source: "Source",
};

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

    var values = {};
    Object.keys(FIELDS).forEach(function (key) {
      values[FIELDS[key]] = safe(data[key]);
    });
    values["Submitted at"] = Utilities.formatDate(new Date(), "Asia/Kolkata", "yyyy-MM-dd HH:mm");
    values["Status"] = "New";

    var row = headers.map(function (h) {
      return h in values ? values[h] : "";
    });
    sheet.appendRow(row);
    return out({ ok: true });
  } catch (err) {
    return out({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

/** Plain text only: stops a typed "=..." from running as a formula, keeps phone digits intact. */
function safe(v) {
  if (v === undefined || v === null) return "";
  var s = String(v).slice(0, 2000);
  return /^[=+\-@0-9]/.test(s) ? "'" + s : s;
}

function out(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
