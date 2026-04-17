// ==========================================
// HÙNG VƯƠNG GRAND OPENING - SPIN WHEEL GAME
// Mắt Việt Hùng Vương - Khai Trương 17.04 - 03.05.2026
// ==========================================

var GIFTS_SEED = [
  { slot: 1, ten: "Gia do dien thoai mascot Mat Viet", ma: "GIADODT",         stock: 100 },
  { slot: 2, ten: "Quat xep cam tay",                   ma: "QUATXEPCAMTAY",  stock: 20  },
  { slot: 3, ten: "Phu kien dinh kem khan",             ma: "MOCTREOMATVIET", stock: 30  },
  { slot: 4, ten: "Quai treo ly Mat Viet",              ma: "QUAITREOLYMV",   stock: 20  },
  { slot: 5, ten: "Guong moc khoa Mat Viet",            ma: "MKG-SSM009",     stock: 10  },
  { slot: 6, ten: "Hop dung kinh BD117",                ma: "HK-BD117",       stock: 10  },
  { slot: 7, ten: "Hop dung kinh BD054",                ma: "HK-BD054",       stock: 10  }
];

// ==========================================
// 1. SETUP - CHẠY 1 LẦN DUY NHẤT
// ==========================================
function setupEnvironment() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // Sheet "Gifts"
  var giftSheet = ss.getSheetByName("Gifts");
  if (!giftSheet) {
    giftSheet = ss.insertSheet("Gifts");
    giftSheet.appendRow(["Slot", "Tên hàng", "Mã hàng", "Stock ban đầu", "Còn lại"]);
    giftSheet.getRange("A1:E1")
      .setFontWeight("bold")
      .setBackground("#fde047")
      .setFontColor("#1e3a8a");
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

  // Sheet "Data"
  var dataSheet = ss.getSheetByName("Data");
  if (!dataSheet) {
    dataSheet = ss.insertSheet("Data");
    dataSheet.appendRow(["Thời gian", "Họ Tên", "SĐT", "Email", "Mã Quà", "Tên Quà", "Trạng thái SMS"]);
    dataSheet.getRange("A1:G1")
      .setFontWeight("bold")
      .setBackground("#1e3a8a")
      .setFontColor("#ffffff");
    dataSheet.setColumnWidth(1, 160);
    dataSheet.setColumnWidth(2, 200);
    dataSheet.setColumnWidth(3, 140);
    dataSheet.setColumnWidth(4, 240);
    dataSheet.setColumnWidth(5, 180);
    dataSheet.setColumnWidth(6, 280);
    dataSheet.setColumnWidth(7, 180);
    dataSheet.setFrozenRows(1);
  }

  // Sheet "Settings"
  var settingsSheet = ss.getSheetByName("Settings");
  if (!settingsSheet) {
    settingsSheet = ss.insertSheet("Settings");
    settingsSheet.appendRow(["Key", "Value"]);
    settingsSheet.appendRow(["ESMS_API_KEY",    "D7B626667A40553DE342055F58623B"]);
    settingsSheet.appendRow(["ESMS_SECRET_KEY", "ACE70FD4BA61E127C490963CFD1BA4"]);
    settingsSheet.appendRow(["BRANDNAME",       "MATVIET.VN"]);
    settingsSheet.appendRow(["SMS_TEMPLATE",    "Quy Khach than men! Cam on QK da tham gia Khai Truong MV Hung Vuong. QK nhan duoc {GIFT}. Kinh chuc Quy Khach that nhieu suc khoe."]);
    settingsSheet.getRange("A1:B1")
      .setFontWeight("bold")
      .setBackground("#fff2cc");
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

function isPhoneRegistered(phone) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var s = ss.getSheetByName("Data");
  var data = s.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][2].toString() === phone) return true;
  }
  return false;
}

// Allocate a gift weighted by remaining stock.
// Returns { rowIndex, slot, name, code, remaining } or null if all out.
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
      // Decrement stock in column E
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
// 4. POST REQUEST - PHÂN QUÀ + GỬI SMS
// ==========================================
function doPost(e) {
  var response = { status: "error", message: "" };

  try {
    var req = JSON.parse(e.postData.contents);
    var hoTen = req.hoTen || "";
    var sdt   = req.sdt || "";
    var email = req.email || "";

    if (!hoTen || !sdt || !email) throw new Error("Vui lòng điền đầy đủ thông tin.");
    if (!/^(0|\+84)\d{9,10}$/.test(sdt.replace(/\s/g, ""))) throw new Error("Số điện thoại không hợp lệ.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Email không hợp lệ.");

    sdt = sdt.replace(/\s/g, "");

    if (isPhoneRegistered(sdt)) {
      throw new Error("Số điện thoại này đã tham gia quay thưởng trước đó. Mỗi SĐT chỉ được quay 1 lần.");
    }

    var lock = LockService.getScriptLock();
    if (!lock.tryLock(10000)) throw new Error("Hệ thống đang bận, vui lòng thử lại sau vài giây.");

    var gift = allocateGift();
    if (!gift) {
      lock.releaseLock();
      throw new Error("Rất tiếc, toàn bộ phần quà đã được trao hết. Cảm ơn Quý Khách đã quan tâm.");
    }

    lock.releaseLock();

    // Send SMS
    var smsTemplate = getSetting("SMS_TEMPLATE");
    var smsMessage = smsTemplate.replace("{GIFT}", gift.name);

    var esmsPayload = {
      ApiKey:      getSetting("ESMS_API_KEY"),
      Content:     smsMessage,
      Phone:       sdt,
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

    // Log to Data
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var dataSheet = ss.getSheetByName("Data");
    var timeStamp = Utilities.formatDate(new Date(), "GMT+7", "dd/MM/yyyy HH:mm:ss");
    dataSheet.appendRow([timeStamp, hoTen, sdt, email, gift.code, gift.name, smsStatus]);

    response.status = "success";
    response.message = "Phân quà thành công!";
    response.giftSlot = gift.slot;
    response.giftName = gift.name;
    response.giftCode = gift.code;

    return ContentService.createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    response.status = "error";
    response.message = error.toString().replace("Error: ", "");
    return ContentService.createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
