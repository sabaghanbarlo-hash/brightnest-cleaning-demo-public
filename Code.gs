/**
 * BrightNest demo lead collector.
 * Attach this script to a Google Sheet, then deploy it as a Web App:
 * Execute as: Me
 * Who has access: Anyone
 *
 * The public website sends JSON using a simple text/plain POST.
 * This script validates the basic fields and appends one row per inquiry.
 */

const SHEET_NAME = "Leads";

function doPost(e) {
  try {
    const raw = e && e.postData && e.postData.contents;
    if (!raw || raw.length > 10000) {
      throw new Error("Missing or oversized request.");
    }

    const lead = JSON.parse(raw);
    const name = clean_(lead.name, 100);
    const email = clean_(lead.email, 160);
    const service = clean_(lead.service, 80);
    const homeSize = clean_(lead.homeSize, 80);
    const area = clean_(lead.area, 120);
    const preferredDate = clean_(lead.preferredDate, 40);
    const source = clean_(lead.source, 100);

    if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || !service) {
      throw new Error("Invalid lead fields.");
    }

    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    if (!spreadsheet) throw new Error("No spreadsheet is connected.");

    let sheet = spreadsheet.getSheetByName(SHEET_NAME);
    if (!sheet) sheet = spreadsheet.insertSheet(SHEET_NAME);

    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Received at", "Name", "Email", "Service", "Home size",
        "Area / postcode", "Preferred date", "Source"
      ]);
      sheet.setFrozenRows(1);
    }

    sheet.appendRow([
      new Date(),
      safeCell_(name),
      safeCell_(email),
      safeCell_(service),
      safeCell_(homeSize),
      safeCell_(area),
      safeCell_(preferredDate),
      safeCell_(source)
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    console.error(error);
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: "Could not save this inquiry." }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function clean_(value, maxLength) {
  return String(value == null ? "" : value).replace(/[\u0000-\u001F\u007F]/g, " ").trim().slice(0, maxLength);
}

// Prevent spreadsheet formula injection from visitor-provided text.
function safeCell_(value) {
  return /^[=+@-]/.test(value) ? "'" + value : value;
}
