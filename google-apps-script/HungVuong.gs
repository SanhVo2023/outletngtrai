// ==========================================
// HÙNG VƯƠNG GRAND OPENING - SPIN WHEEL GAME
// Mắt Việt Hùng Vương - Khai Trương 17.04 - 03.05.2026
// ==========================================

var GIFTS_SEED = [
  { slot: 1, ten: "Giá đỡ điện thoại mascot Mắt Việt", ma: "GIADODT",        stock: 100 },
  { slot: 2, ten: "Quạt xếp cầm tay",                   ma: "QUATXEPCAMTAY",  stock: 20  },
  { slot: 3, ten: "Phụ kiện đính kèm khăn",             ma: "MOCTREOMATVIET", stock: 30  },
  { slot: 4, ten: "Quai treo ly Mắt Việt",              ma: "QUAITREOLYMV",   stock: 20  },
  { slot: 5, ten: "Gương móc khóa Mắt Việt",            ma: "MKG-SSM009",     stock: 10  },
  { slot: 6, ten: "Hộp đựng kính BD117",                ma: "HK-BD117",       stock: 10  },
  { slot: 7, ten: "Hộp đựng kính BD054",                ma: "HK-BD054",       stock: 10  }
];

// ==========================================
// 1. SETUP - CHẠY 1 LẦN DUY NHẤT
// ==========================================
function setupEnvironment() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  var giftSheet = ss.getSheetByName("Gifts");
  if (!giftSheet) {
    giftSheet = ss.insertSheet("Gifts");
    giftSheet.appendRow(["Slot", "Tên hàng", "Mã hàng", "Stock ban đầu", "Còn lại"]);
    giftSheet.getRange("A1:E1").setFontWeight("bold").setBackground("#fde047").setFontColor("#1e3a8a");
    for (var i = 0; i < GIFTS_SEED.length; i++) {
      var g = GIFTS_SEED[i];
      giftSheet.appendRow([g.slot, g.ten, g.ma, g.stock, g.stock]);
    }
    giftSheet.setColumnWidth(1, 60);
    giftSheet.setColumnWidth(2, 280);
    giftSheet.setColumnWidth(3, 180);
    giftSheet.setColumnWidth(4, 120);
    giftSheet.setColumnWidth(5, 100);
    giftSheet.setFrozenRows(1);
  }

  var dataSheet = ss.getSheetByName("Data");
  if (!dataSheet) {
    dataSheet = ss.insertSheet("Data");
    dataSheet.appendRow(["Thời gian", "Họ Tên", "SĐT", "Email", "Mã Quà", "Tên Quà", "Trạng thái SMS", "Nội dung SMS"]);
    dataSheet.getRange("A1:H1").setFontWeight("bold").setBackground("#1e3a8a").setFontColor("#ffffff");
    dataSheet.setColumnWidth(1, 160);
    dataSheet.setColumnWidth(2, 200);
    dataSheet.setColumnWidth(3, 140);
    dataSheet.setColumnWidth(4, 240);
    dataSheet.setColumnWidth(5, 180);
    dataSheet.setColumnWidth(6, 280);
    dataSheet.setColumnWidth(7, 180);
    dataSheet.setColumnWidth(8, 500);
    dataSheet.setFrozenRows(1);
    // Force SĐT column to TEXT format so leading zeros are preserved
    dataSheet.getRange("C:C").setNumberFormat("@");
  }

  var settingsSheet = ss.getSheetByName("Settings");
  if (!settingsSheet) {
    settingsSheet = ss.insertSheet("Settings");
    settingsSheet.appendRow(["Key", "Value"]);
    settingsSheet.appendRow(["ESMS_API_KEY",    "D7B626667A40553DE342055F58623B"]);
    settingsSheet.appendRow(["ESMS_SECRET_KEY", "ACE70FD4BA61E127C490963CFD1BA4"]);
    settingsSheet.appendRow(["BRANDNAME",       "MATVIET.VN"]);
    settingsSheet.appendRow(["SMS_TEMPLATE",    "Quy Khach than men! QK nhan duoc {GIFT}. Kinh chuc Quy Khach that nhieu suc khoe."]);
    settingsSheet.getRange("A1:B1").setFontWeight("bold").setBackground("#fff2cc");
    settingsSheet.setColumnWidth(1, 220);
    settingsSheet.setColumnWidth(2, 600);
  }

  Browser.msgBox(
    "✅ Setup thành công!\n\n" +
    "- Sheet 'Gifts' đã có sẵn 7 phần quà (tổng 206).\n" +
    "- Sheet 'Settings' đã điền sẵn eSMS keys. Kiểm tra lại nếu cần.\n" +
    "- Deploy Web App (Execute as: Me, Access: Anyone) và lấy URL."
  );
}

// Chạy hàm này trên sheet đã tồn tại để:
// - Cập nhật SMS_TEMPLATE mới trong Settings
// - Thêm cột H "Nội dung SMS" vào Data nếu chưa có
function upgradeToV2() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  var settingsSheet = ss.getSheetByName("Settings");
  if (settingsSheet) {
    var data = settingsSheet.getDataRange().getValues();
    var newTemplate = "Quy Khach than men! QK nhan duoc {GIFT}. Kinh chuc Quy Khach that nhieu suc khoe.";
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] === "SMS_TEMPLATE") {
        settingsSheet.getRange(i + 1, 2).setValue(newTemplate);
        break;
      }
    }
  }

  var dataSheet = ss.getSheetByName("Data");
  if (dataSheet) {
    var header = dataSheet.getRange(1, 1, 1, dataSheet.getLastColumn()).getValues()[0];
    if (header.indexOf("Nội dung SMS") === -1) {
      var newCol = dataSheet.getLastColumn() + 1;
      dataSheet.getRange(1, newCol)
        .setValue("Nội dung SMS")
        .setFontWeight("bold")
        .setBackground("#1e3a8a")
        .setFontColor("#ffffff");
      dataSheet.setColumnWidth(newCol, 500);
    }
  }

  Browser.msgBox("✅ Đã cập nhật template SMS và thêm cột Nội dung SMS.");
}

// Chạy hàm này để sửa lỗi mất số 0 đầu SĐT ở sheet Data đã có
function fixPhoneFormat() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var s = ss.getSheetByName("Data");
  if (!s) {
    Browser.msgBox("Sheet 'Data' chưa tồn tại.");
    return;
  }
  s.getRange("C:C").setNumberFormat("@");
  // Re-stamp existing phone values as text so they lose any number-coercion
  var data = s.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    var raw = data[i][2];
    if (raw !== "" && raw !== null) {
      var str = raw.toString();
      // Restore leading zero if it was a Vietnamese phone stored as number
      if (/^\d{9}$/.test(str)) str = "0" + str;
      s.getRange(i + 1, 3).setValue(str);
    }
  }
  Browser.msgBox("✅ Đã ép cột SĐT thành dạng Text và chuẩn hóa số điện thoại.");
}

// Chạy hàm này để CẬP NHẬT tên quà có dấu cho sheet 'Gifts' đã tồn tại
// (không reset Stock, chỉ thay cột B - Tên hàng)
function updateGiftNames() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var giftSheet = ss.getSheetByName("Gifts");
  if (!giftSheet) {
    Browser.msgBox("Sheet 'Gifts' chưa tồn tại. Chạy setupEnvironment() trước.");
    return;
  }
  var data = giftSheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    var slot = parseInt(data[i][0]);
    for (var j = 0; j < GIFTS_SEED.length; j++) {
      if (GIFTS_SEED[j].slot === slot) {
        giftSheet.getRange(i + 1, 2).setValue(GIFTS_SEED[j].ten);
        break;
      }
    }
  }
  Browser.msgBox("✅ Đã cập nhật tên quà có dấu.");
}

// ==========================================
// 2. HELPERS
// ==========================================
function getSetting(key) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var s = ss.getSheetByName("Settings");
  var data = s.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === key) return data[i][1].toString();
  }
  return "";
}

// Normalize a phone number so the two most common stored forms match:
// "0901234567" (text) and 901234567 (coerced to number by Sheets).
function normalizePhone(p) {
  if (p === null || p === undefined) return "";
  var s = p.toString().trim().replace(/\s/g, "");
  // If 9 digits, assume it lost its leading zero
  if (/^\d{9}$/.test(s)) s = "0" + s;
  // If starts with +84, convert to 0
  s = s.replace(/^\+84/, "0");
  return s;
}

function isPhoneRegistered(phone) {
  var target = normalizePhone(phone);
  if (!target) return false;
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var s = ss.getSheetByName("Data");
  if (!s) return false;
  var data = s.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (normalizePhone(data[i][2]) === target) return true;
  }
  return false;
}

function findLatestRowByPhone(phone) {
  var target = normalizePhone(phone);
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var s = ss.getSheetByName("Data");
  var data = s.getDataRange().getValues();
  for (var i = data.length - 1; i >= 1; i--) {
    if (normalizePhone(data[i][2]) === target) {
      return { rowIndex: i + 1, row: data[i] };
    }
  }
  return null;
}

// Remove Vietnamese diacritics for non-Unicode SMS
function removeDiacritics(s) {
  if (!s) return "";
  return s.normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

function allocateGift() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var giftSheet = ss.getSheetByName("Gifts");
  var data = giftSheet.getDataRange().getValues();
  var total = 0;
  for (var i = 1; i < data.length; i++) {
    total += parseInt(data[i][4]) || 0;
  }
  if (total <= 0) return null;

  var pick = Math.floor(Math.random() * total);
  var acc = 0;
  for (var j = 1; j < data.length; j++) {
    var remaining = parseInt(data[j][4]) || 0;
    if (remaining <= 0) continue;
    acc += remaining;
    if (pick < acc) {
      giftSheet.getRange(j + 1, 5).setValue(remaining - 1);
      return {
        rowIndex: j + 1,
        slot: data[j][0],
        name: data[j][1],
        code: data[j][2],
        remaining: remaining - 1
      };
    }
  }
  return null;
}

function sendSMSForPhone(phone) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var dataSheet = ss.getSheetByName("Data");
  var found = findLatestRowByPhone(phone);
  if (!found) {
    return { ok: false, message: "Không tìm thấy đăng ký cho SĐT này." };
  }

  var giftName = found.row[5];  // column F: Tên Quà
  var currentStatus = found.row[6] ? found.row[6].toString() : "";
  if (currentStatus === "Gửi thành công") {
    return { ok: true, message: "SMS đã được gửi trước đó.", alreadySent: true };
  }

  var smsTemplate = getSetting("SMS_TEMPLATE");
  // Strip diacritics from the whole final message — eSMS non-Unicode (IsUnicode: 0)
  // rejects or garbles any Vietnamese diacritic character.
  var smsMessage = removeDiacritics(
    smsTemplate.replace("{GIFT}", giftName)
  );

  var esmsPayload = {
    ApiKey:      getSetting("ESMS_API_KEY"),
    Content:     smsMessage,
    Phone:       phone,
    SecretKey:   getSetting("ESMS_SECRET_KEY"),
    Brandname:   getSetting("BRANDNAME"),
    SmsType:     "2",
    IsUnicode:   0,
    SandBox:     0,
    RequestId:   "",
    CallbackUrl: ""
  };

  var esmsOptions = {
    method: "POST",
    contentType: "application/json",
    payload: JSON.stringify(esmsPayload),
    muteHttpExceptions: true
  };

  var smsStatus = "Chưa gửi";
  try {
    var esmsResponse = UrlFetchApp.fetch(
      "http://rest.esms.vn/MainService.svc/json/SendMultipleMessage_V4_post_json/",
      esmsOptions
    );
    var smsJson = JSON.parse(esmsResponse.getContentText());
    smsStatus = (smsJson.CodeResult === "100")
      ? "Gửi thành công"
      : ("Lỗi eSMS: " + smsJson.ErrorMessage);
  } catch (smsErr) {
    smsStatus = "Lỗi: " + smsErr.toString();
  }

  dataSheet.getRange(found.rowIndex, 7).setValue(smsStatus);
  dataSheet.getRange(found.rowIndex, 8).setValue(smsMessage);
  return { ok: smsStatus === "Gửi thành công", message: smsStatus };
}

// ==========================================
// 3. GET REQUEST
// ==========================================
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "ok",
    message: "Mat Viet Hung Vuong Spin Wheel API is running"
  })).setMimeType(ContentService.MimeType.JSON);
}

// ==========================================
// 4. POST REQUEST
// Supports two actions:
//   action: "spin"   -> validate, allocate gift, log (NO SMS)
//   action: "notify" -> send SMS for already-logged row
// Backward compat: no action => treat as "spin" + "notify" (old behavior)
// ==========================================
function doPost(e) {
  var response = { status: "error", message: "" };

  try {
    var req = JSON.parse(e.postData.contents);
    var action = req.action || "legacy";

    if (action === "notify") {
      var sdt = (req.sdt || "").replace(/\s/g, "");
      if (!sdt) throw new Error("Thiếu SĐT.");
      var smsResult = sendSMSForPhone(sdt);
      response.status = smsResult.ok ? "success" : "error";
      response.message = smsResult.message;
      return ContentService.createTextOutput(JSON.stringify(response))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // "spin" or "legacy"
    var hoTen = req.hoTen || "";
    var sdt   = (req.sdt || "").replace(/\s/g, "");
    var email = req.email || "";

    if (!hoTen || !sdt || !email) throw new Error("Vui lòng điền đầy đủ thông tin.");
    if (!/^(0|\+84)\d{9,10}$/.test(sdt)) throw new Error("Số điện thoại không hợp lệ.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Email không hợp lệ.");

    sdt = normalizePhone(sdt);

    // Acquire lock FIRST, then check dedup + allocate + write — all atomic
    var lock = LockService.getScriptLock();
    if (!lock.tryLock(10000)) throw new Error("Hệ thống đang bận, vui lòng thử lại sau vài giây.");

    try {
      if (isPhoneRegistered(sdt)) {
        throw new Error("Số điện thoại này đã tham gia quay thưởng trước đó. Mỗi SĐT chỉ được quay 1 lần.");
      }

      var gift = allocateGift();
      if (!gift) {
        throw new Error("Rất tiếc, toàn bộ phần quà đã được trao hết. Cảm ơn Quý Khách đã quan tâm.");
      }

      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var dataSheet = ss.getSheetByName("Data");
      // Ensure phone column stays text (preserves leading zero even after user manually edits)
      dataSheet.getRange("C:C").setNumberFormat("@");
      var timeStamp = Utilities.formatDate(new Date(), "GMT+7", "dd/MM/yyyy HH:mm:ss");
      dataSheet.appendRow([timeStamp, hoTen, sdt, email, gift.code, gift.name, "Chưa gửi", ""]);
      // Force text format on just-written phone cell as belt-and-braces
      dataSheet.getRange(dataSheet.getLastRow(), 3).setNumberFormat("@").setValue(sdt);
      SpreadsheetApp.flush();
    } finally {
      lock.releaseLock();
    }

    response.status = "success";
    response.message = "Phân quà thành công!";
    response.giftSlot = gift.slot;
    response.giftName = gift.name;
    response.giftCode = gift.code;

    // Legacy: send SMS immediately
    if (action === "legacy") {
      var smsResult = sendSMSForPhone(sdt);
      response.smsStatus = smsResult.message;
    }

    return ContentService.createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    response.status = "error";
    response.message = error.toString().replace("Error: ", "");
    return ContentService.createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
