// ==========================================
// OUTLET LANDING PAGE - GOOGLE APPS SCRIPT
// Mắt Việt - Nguyễn Trãi Outlet Program
// ==========================================

// ==========================================
// 1. HÀM SETUP MÔI TRƯỜNG (CHẠY 1 LẦN DUY NHẤT)
// ==========================================
function setupEnvironment() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. Tạo Sheet "Data" - Lưu thông tin đăng ký
  var dataSheet = ss.getSheetByName("Data");
  if (!dataSheet) {
    dataSheet = ss.insertSheet("Data");
    dataSheet.appendRow([
      "Thời gian",
      "Họ Tên",
      "SĐT",
      "Email",
      "Mã Voucher",
      "Hạn Sử Dụng",
      "Trạng thái SMS"
    ]);
    dataSheet.getRange("A1:G1").setFontWeight("bold").setBackground("#e0e0e0");
    dataSheet.setColumnWidth(1, 180);
    dataSheet.setColumnWidth(2, 200);
    dataSheet.setColumnWidth(3, 150);
    dataSheet.setColumnWidth(4, 250);
    dataSheet.setColumnWidth(5, 150);
    dataSheet.setColumnWidth(6, 150);
    dataSheet.setColumnWidth(7, 180);
  }

  // 2. Tạo Sheet "Vouchers" - Chứa mã voucher pre-generated
  var voucherSheet = ss.getSheetByName("Vouchers");
  if (!voucherSheet) {
    voucherSheet = ss.insertSheet("Vouchers");
    voucherSheet.appendRow([
      "Mã Voucher",
      "Trạng thái",
      "SĐT Nhận",
      "Thời gian cấp"
    ]);
    voucherSheet.getRange("A1:D1").setFontWeight("bold").setBackground("#d9ead3");
    voucherSheet.setColumnWidth(1, 200);
    voucherSheet.setColumnWidth(2, 120);
    voucherSheet.setColumnWidth(3, 150);
    voucherSheet.setColumnWidth(4, 180);
  }

  // 3. Tạo Sheet "Settings" - Cấu hình SMS API
  var settingsSheet = ss.getSheetByName("Settings");
  if (!settingsSheet) {
    settingsSheet = ss.insertSheet("Settings");
    settingsSheet.appendRow(["Key", "Value"]);
    settingsSheet.appendRow(["ESMS_API_KEY", "YOUR_API_KEY_HERE"]);
    settingsSheet.appendRow(["ESMS_SECRET_KEY", "YOUR_SECRET_KEY_HERE"]);
    settingsSheet.appendRow(["BRANDNAME", "MATVIET.VN"]);
    settingsSheet.appendRow(["VOUCHER_VALIDITY_DAYS", "14"]);
    settingsSheet.appendRow(["SMS_TEMPLATE", "Quy Khach than men! Ma voucher Outlet Mat Viet cua QK la {VOUCHER}. Han su dung den {EXPIRY}. Cam on QK da dang ky!"]);
    settingsSheet.getRange("A1:B1").setFontWeight("bold").setBackground("#fff2cc");
    settingsSheet.setColumnWidth(1, 250);
    settingsSheet.setColumnWidth(2, 500);
  }

  Browser.msgBox(
    "✅ Setup thành công!\n\n" +
    "Bước tiếp theo:\n" +
    "1. Điền mã Voucher vào sheet 'Vouchers' (cột Trạng thái để trống hoặc ghi 'Trống')\n" +
    "2. Cập nhật API key eSMS trong sheet 'Settings'\n" +
    "3. Deploy Web App (Execute as: Me, Access: Anyone)"
  );
}

// ==========================================
// 2. HÀM ĐỌC CẤU HÌNH TỪ SHEET SETTINGS
// ==========================================
function getSetting(key) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var settingsSheet = ss.getSheetByName("Settings");
  var data = settingsSheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === key) {
      return data[i][1].toString();
    }
  }
  return "";
}

// ==========================================
// 3. KIỂM TRA SĐT ĐÃ ĐĂNG KÝ CHƯA
// ==========================================
function isPhoneRegistered(phone) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var dataSheet = ss.getSheetByName("Data");
  var data = dataSheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][2].toString() === phone) {
      return true;
    }
  }
  return false;
}

// ==========================================
// 4. HÀM XỬ LÝ GET REQUEST (CORS preflight)
// ==========================================
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    "status": "ok",
    "message": "Mắt Việt Outlet API is running"
  })).setMimeType(ContentService.MimeType.JSON);
}

// ==========================================
// 5. HÀM XỬ LÝ POST REQUEST TỪ FRONTEND
// ==========================================
function doPost(e) {
  var response = {
    "status": "error",
    "message": ""
  };

  try {
    // 1. Parse dữ liệu từ Frontend
    var requestData = JSON.parse(e.postData.contents);
    var hoTen = requestData.hoTen || "";
    var sdt = requestData.sdt || "";
    var email = requestData.email || "";

    // Validate dữ liệu cơ bản
    if (!hoTen || !sdt || !email) {
      throw new Error("Vui lòng điền đầy đủ thông tin.");
    }

    // Validate SĐT format
    if (!/^(0|\+84)\d{9,10}$/.test(sdt.replace(/\s/g, ""))) {
      throw new Error("Số điện thoại không hợp lệ.");
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error("Email không hợp lệ.");
    }

    // Chuẩn hóa SĐT
    sdt = sdt.replace(/\s/g, "");

    // 2. Kiểm tra SĐT đã đăng ký chưa
    if (isPhoneRegistered(sdt)) {
      throw new Error("Số điện thoại này đã được đăng ký nhận voucher trước đó.");
    }

    // 3. LOCK SERVICE - Chống trùng voucher
    var lock = LockService.getScriptLock();
    if (!lock.tryLock(10000)) {
      throw new Error("Hệ thống đang bận, vui lòng thử lại sau vài giây.");
    }

    // 4. Tìm và cấp mã voucher
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var voucherSheet = ss.getSheetByName("Vouchers");
    var voucherData = voucherSheet.getDataRange().getValues();

    var allocatedVoucher = "";
    var voucherRowToUpdate = -1;

    for (var i = 1; i < voucherData.length; i++) {
      if (voucherData[i][1] === "Trống" || voucherData[i][1] === "") {
        allocatedVoucher = voucherData[i][0].toString();
        voucherRowToUpdate = i + 1;
        break;
      }
    }

    if (allocatedVoucher === "") {
      lock.releaseLock();
      throw new Error("Rất tiếc, chương trình đã hết mã ưu đãi. Vui lòng liên hệ CSKH.");
    }

    // Đánh dấu voucher đã cấp
    var timeStamp = Utilities.formatDate(new Date(), "GMT+7", "dd/MM/yyyy HH:mm:ss");
    voucherSheet.getRange(voucherRowToUpdate, 2).setValue("Đã cấp");
    voucherSheet.getRange(voucherRowToUpdate, 3).setValue(sdt);
    voucherSheet.getRange(voucherRowToUpdate, 4).setValue(timeStamp);

    lock.releaseLock();

    // 5. Tính ngày hết hạn
    var validityDays = parseInt(getSetting("VOUCHER_VALIDITY_DAYS")) || 14;
    var expDate = new Date();
    expDate.setDate(expDate.getDate() + validityDays);
    var formattedExp = Utilities.formatDate(expDate, "GMT+7", "dd/MM/yyyy");

    // 6. Gửi SMS qua eSMS API
    var smsTemplate = getSetting("SMS_TEMPLATE");
    var smsMessage = smsTemplate
      .replace("{VOUCHER}", allocatedVoucher)
      .replace("{EXPIRY}", formattedExp);

    var esmsPayload = {
      "ApiKey": getSetting("ESMS_API_KEY"),
      "Content": smsMessage,
      "Phone": sdt,
      "SecretKey": getSetting("ESMS_SECRET_KEY"),
      "Brandname": getSetting("BRANDNAME"),
      "SmsType": "2",
      "IsUnicode": 0,
      "SandBox": 0,
      "RequestId": "",
      "CallbackUrl": ""
    };

    var esmsOptions = {
      "method": "POST",
      "contentType": "application/json",
      "payload": JSON.stringify(esmsPayload),
      "muteHttpExceptions": true
    };

    var esmsResponse = UrlFetchApp.fetch(
      "http://rest.esms.vn/MainService.svc/json/SendMultipleMessage_V4_post_json/",
      esmsOptions
    );
    var jsonSmsResponse = JSON.parse(esmsResponse.getContentText());
    var smsStatus = (jsonSmsResponse.CodeResult === "100")
      ? "Gửi thành công"
      : ("Lỗi eSMS: " + jsonSmsResponse.ErrorMessage);

    // 7. Ghi dữ liệu vào Sheet "Data"
    var dataSheet = ss.getSheetByName("Data");
    dataSheet.appendRow([
      timeStamp,
      hoTen,
      sdt,
      email,
      allocatedVoucher,
      formattedExp,
      smsStatus
    ]);

    // 8. Trả kết quả thành công
    response.status = "success";
    response.message = "Đăng ký thành công! Mã voucher đã được gửi qua SMS.";
    response.voucherCode = allocatedVoucher;
    response.expiry = formattedExp;

    return ContentService.createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    response.status = "error";
    response.message = error.toString().replace("Error: ", "");
    return ContentService.createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
