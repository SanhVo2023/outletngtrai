// ==========================================
// HÙNG VƯƠNG GRAND OPENING LANDING PAGE - GAS
// Mắt Việt Hùng Vương - Grand Opening 17.04 - 03.05.2026
// Simple registration (no voucher, no SMS)
// ==========================================

// ==========================================
// 1. SETUP - CHẠY 1 LẦN DUY NHẤT
// ==========================================
function setupEnvironment() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // Sheet "Registrations" - Lưu thông tin khách đăng ký
  var regSheet = ss.getSheetByName("Registrations");
  if (!regSheet) {
    regSheet = ss.insertSheet("Registrations");
    regSheet.appendRow([
      "Thời gian",
      "Họ Tên",
      "SĐT",
      "Email"
    ]);
    regSheet.getRange("A1:D1")
      .setFontWeight("bold")
      .setBackground("#fde047")
      .setFontColor("#1e3a8a");
    regSheet.setColumnWidth(1, 180);
    regSheet.setColumnWidth(2, 220);
    regSheet.setColumnWidth(3, 150);
    regSheet.setColumnWidth(4, 280);
    regSheet.setFrozenRows(1);
  }

  Browser.msgBox(
    "✅ Setup thành công!\n\n" +
    "Bước tiếp theo:\n" +
    "1. Deploy Web App (Execute as: Me, Access: Anyone)\n" +
    "2. Copy URL và dán vào Frontend"
  );
}

// ==========================================
// 2. KIỂM TRA SĐT ĐÃ ĐĂNG KÝ CHƯA
// ==========================================
function isPhoneRegistered(phone) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var regSheet = ss.getSheetByName("Registrations");
  var data = regSheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][2].toString() === phone) {
      return true;
    }
  }
  return false;
}

// ==========================================
// 3. GET REQUEST
// ==========================================
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    "status": "ok",
    "message": "Mắt Việt Hùng Vương Grand Opening API is running"
  })).setMimeType(ContentService.MimeType.JSON);
}

// ==========================================
// 4. POST REQUEST - LƯU ĐĂNG KÝ
// ==========================================
function doPost(e) {
  var response = {
    "status": "error",
    "message": ""
  };

  try {
    var requestData = JSON.parse(e.postData.contents);
    var hoTen = requestData.hoTen || "";
    var sdt = requestData.sdt || "";
    var email = requestData.email || "";

    // Validate
    if (!hoTen || !sdt || !email) {
      throw new Error("Vui lòng điền đầy đủ thông tin.");
    }

    if (!/^(0|\+84)\d{9,10}$/.test(sdt.replace(/\s/g, ""))) {
      throw new Error("Số điện thoại không hợp lệ.");
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error("Email không hợp lệ.");
    }

    sdt = sdt.replace(/\s/g, "");

    // Check duplicate
    if (isPhoneRegistered(sdt)) {
      throw new Error("Số điện thoại này đã đăng ký trước đó.");
    }

    // Lock để tránh ghi trùng
    var lock = LockService.getScriptLock();
    if (!lock.tryLock(10000)) {
      throw new Error("Hệ thống đang bận, vui lòng thử lại sau.");
    }

    // Append row
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var regSheet = ss.getSheetByName("Registrations");
    var timeStamp = Utilities.formatDate(new Date(), "GMT+7", "dd/MM/yyyy HH:mm:ss");

    regSheet.appendRow([
      timeStamp,
      hoTen,
      sdt,
      email
    ]);

    lock.releaseLock();

    response.status = "success";
    response.message = "Đăng ký thành công! Hẹn gặp bạn tại Grand Opening.";

    return ContentService.createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    response.status = "error";
    response.message = error.toString().replace("Error: ", "");
    return ContentService.createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
