function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  var data = JSON.parse(e.postData.contents);
  var email = data.email;
  
  if (!email) {
    return ContentService.createTextOutput(JSON.stringify({"status": "error", "message": "No email provided"}))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  // Check for duplicates
  var emails = sheet.getRange("A:A").getValues().flat();
  if (emails.includes(email)) {
     return ContentService.createTextOutput(JSON.stringify({"status": "success", "message": "Already subscribed"}))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  // Append new row
  sheet.appendRow([email, new Date()]);
  
  return ContentService.createTextOutput(JSON.stringify({"status": "success"}))
    .setMimeType(ContentService.MimeType.JSON);
}

function setup() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["Email", "Date"]);
  }
}
