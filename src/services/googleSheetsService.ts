import { Student, Criteria, ScoreLog, AppConfig } from '../types';

export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * =======================================================================
 * HỆ THỐNG QUẢN LÝ NỀ NẾP THI ĐUA THÔNG MINH - GOOGLE APPS SCRIPT BACKEND
 * Dành cho file Google Sheets: DU_LIEU_THI_DUA_6B1 hoặc DU_LIEU_THI_DUA_81
 * =======================================================================
 * HƯỚNG DẪN CÀI ĐẶT:
 * 1. Mở file Google Sheets mới trên Google Drive.
 * 2. Đổi tên file thành: DU_LIEU_THI_DUA_81 (hoặc theo tên lớp của bạn).
 * 3. Vào Tiện ích mở rộng (Extensions) -> Apps Script.
 * 4. Xóa hết mã cũ và dán toàn bộ đoạn mã này vào.
 * 5. Nhấn "Triển khai" (Deploy) -> "Triển khai dưới dạng ứng dụng web mới" (New deployment -> Web app).
 *    - Mô tả: "Sổ tay thi đua v1.0"
 *    - Người thực thi (Execute as): "Tôi" (Me)
 *    - Ai có quyền truy cập (Who has access): "Bất kỳ ai" (Anyone) -> RẤT QUAN TRỌNG!
 * 6. Cấp quyền truy cập cho Script, sau đó sao chép URL Ứng dụng web (Web App URL)
 * 7. Mở Web App Sổ Tay Thi Đua -> Cài đặt -> Dán Web App URL vào và bấm "Kiểm tra & Đồng bộ".
 * =======================================================================
 */

const SHEET_NAMES = {
  STUDENTS: 'DANH_SACH_HOC_SINH',
  CRITERIA: 'DANH_MUC_THI_DUA',
  LOGS: 'LICH_SU_CHAM_DIEM',
  CONFIG: 'CAU_HINH'
};

function doGet(e) {
  try {
    initDatabaseIfEmpty();
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // 1. Đọc danh sách học sinh
    var studentSheet = ss.getSheetByName(SHEET_NAMES.STUDENTS);
    var studentData = studentSheet.getDataRange().getValues();
    var students = [];
    for (var i = 1; i < studentData.length; i++) {
      if (studentData[i][0]) {
        students.push({
          id: String(studentData[i][0]),
          code: String(studentData[i][0]),
          name: String(studentData[i][1]),
          team: Number(studentData[i][2]),
          points: Number(studentData[i][3]) || 0,
          role: String(studentData[i][4] || 'Thành viên'),
          gender: String(studentData[i][5] || 'nam'),
          prevRank: Number(studentData[i][6]) || i
        });
      }
    }

    // 2. Đọc danh mục tiêu chí
    var criteriaSheet = ss.getSheetByName(SHEET_NAMES.CRITERIA);
    var criteriaData = criteriaSheet.getDataRange().getValues();
    var criteria = [];
    for (var j = 1; j < criteriaData.length; j++) {
      if (criteriaData[j][0]) {
        criteria.push({
          id: String(criteriaData[j][0]),
          name: String(criteriaData[j][1]),
          type: String(criteriaData[j][2]),
          points: Number(criteriaData[j][3]),
          category: String(criteriaData[j][4]),
          description: String(criteriaData[j][5] || '')
        });
      }
    }

    // 3. Đọc lịch sử chấm điểm
    var logSheet = ss.getSheetByName(SHEET_NAMES.LOGS);
    var logData = logSheet.getDataRange().getValues();
    var logs = [];
    for (var k = 1; k < logData.length; k++) {
      if (logData[k][0]) {
        logs.push({
          id: String(logData[k][0]),
          timestamp: String(logData[k][1]),
          formattedDate: String(logData[k][2]),
          operator: String(logData[k][3]),
          operatorRole: String(logData[k][4] || 'Cờ đỏ'),
          studentId: String(logData[k][5]),
          studentName: String(logData[k][6]),
          team: Number(logData[k][7]),
          criteriaId: String(logData[k][8]),
          criteriaName: String(logData[k][9]),
          pointChange: Number(logData[k][10]),
          type: String(logData[k][11]),
          note: String(logData[k][12] || '')
        });
      }
    }

    // 4. Đọc cấu hình
    var configSheet = ss.getSheetByName(SHEET_NAMES.CONFIG);
    var configData = configSheet.getDataRange().getValues();
    var config = {};
    for (var m = 1; m < configData.length; m++) {
      if (configData[m][0]) {
        config[configData[m][0]] = configData[m][1];
      }
    }

    return respondJSON({
      status: 'success',
      data: {
        students: students,
        criteria: criteria,
        logs: logs.reverse(), // Mới nhất lên đầu
        config: config
      }
    });
  } catch (err) {
    return respondJSON({
      status: 'error',
      message: err.toString()
    });
  }
}

function doPost(e) {
  try {
    initDatabaseIfEmpty();
    var postData = JSON.parse(e.postData.contents);
    var action = postData.action;
    var payload = postData.payload;
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    if (action === 'ADD_SCORE') {
      var logSheet = ss.getSheetByName(SHEET_NAMES.LOGS);
      var studentSheet = ss.getSheetByName(SHEET_NAMES.STUDENTS);

      // Thêm dòng lịch sử
      logSheet.appendRow([
        payload.id,
        payload.timestamp,
        payload.formattedDate,
        payload.operator,
        payload.operatorRole || '',
        payload.studentId,
        payload.studentName,
        payload.team,
        payload.criteriaId,
        payload.criteriaName,
        payload.pointChange,
        payload.type,
        payload.note || ''
      ]);

      // Cập nhật điểm học sinh
      var studentData = studentSheet.getDataRange().getValues();
      for (var r = 1; r < studentData.length; r++) {
        if (String(studentData[r][0]) === String(payload.studentId)) {
          var currentPts = Number(studentData[r][3]) || 0;
          var newPts = currentPts + Number(payload.pointChange);
          studentSheet.getRange(r + 1, 4).setValue(newPts);
          break;
        }
      }

      return respondJSON({ status: 'success', message: 'Đã lưu điểm thành công!' });
    }

    if (action === 'REVERT_SCORE') {
      var logSheet = ss.getSheetByName(SHEET_NAMES.LOGS);
      var studentSheet = ss.getSheetByName(SHEET_NAMES.STUDENTS);
      var logData = logSheet.getDataRange().getValues();
      var targetLog = null;
      var targetRow = -1;

      for (var l = 1; l < logData.length; l++) {
        if (String(logData[l][0]) === String(payload.logId)) {
          targetLog = logData[l];
          targetRow = l + 1;
          break;
        }
      }

      if (targetLog && targetRow > 0) {
        var studentId = targetLog[5];
        var pointChange = Number(targetLog[10]);

        // Hoàn trả điểm lại cho học sinh
        var studentData = studentSheet.getDataRange().getValues();
        for (var s = 1; s < studentData.length; s++) {
          if (String(studentData[s][0]) === String(studentId)) {
            var curr = Number(studentData[s][3]) || 0;
            studentSheet.getRange(s + 1, 4).setValue(curr - pointChange);
            break;
          }
        }

        // Xóa dòng lịch sử
        logSheet.deleteRow(targetRow);
        return respondJSON({ status: 'success', message: 'Đã hủy thao tác chấm điểm!' });
      }

      return respondJSON({ status: 'error', message: 'Không tìm thấy dòng log để hủy' });
    }

    if (action === 'SYNC_ALL_DATA') {
      // Ghi đè hoặc đồng bộ toàn bộ bảng
      saveWholeDataset(payload);
      return respondJSON({ status: 'success', message: 'Đã đồng bộ toàn bộ dữ liệu lên Google Sheets!' });
    }

    return respondJSON({ status: 'error', message: 'Unknown action: ' + action });
  } catch (err) {
    return respondJSON({ status: 'error', message: err.toString() });
  }
}

function respondJSON(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function initDatabaseIfEmpty() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. DANH_SACH_HOC_SINH
  var sSheet = ss.getSheetByName(SHEET_NAMES.STUDENTS);
  if (!sSheet) {
    sSheet = ss.insertSheet(SHEET_NAMES.STUDENTS);
    sSheet.appendRow(['MaHS', 'HoTen', 'To', 'TongDiem', 'ChucVu', 'GioiTinh', 'ThuHangCu']);
    sSheet.getRange('A1:G1').setBackground('#1e3a8a').setFontColor('#ffffff').setFontWeight('bold');
  }

  // 2. DANH_MUC_THI_DUA
  var cSheet = ss.getSheetByName(SHEET_NAMES.CRITERIA);
  if (!cSheet) {
    cSheet = ss.insertSheet(SHEET_NAMES.CRITERIA);
    cSheet.appendRow(['MaTieuChi', 'TenTieuChi', 'Loai', 'Diem', 'DanhMuc', 'MoTa']);
    cSheet.getRange('A1:F1').setBackground('#1e3a8a').setFontColor('#ffffff').setFontWeight('bold');
  }

  // 3. LICH_SU_CHAM_DIEM
  var lSheet = ss.getSheetByName(SHEET_NAMES.LOGS);
  if (!lSheet) {
    lSheet = ss.insertSheet(SHEET_NAMES.LOGS);
    lSheet.appendRow(['ID', 'ThoiGian', 'NgayGio', 'NguoiCham', 'ChucVu', 'MaHS', 'HoTen', 'To', 'MaTieuChi', 'TenTieuChi', 'DiemThayDoi', 'Loai', 'GhiChu']);
    lSheet.getRange('A1:M1').setBackground('#dc2626').setFontColor('#ffffff').setFontWeight('bold');
  }

  // 4. CAU_HINH
  var cfgSheet = ss.getSheetByName(SHEET_NAMES.CONFIG);
  if (!cfgSheet) {
    cfgSheet = ss.insertSheet(SHEET_NAMES.CONFIG);
    cfgSheet.appendRow(['Key', 'Value']);
    cfgSheet.appendRow(['className', 'Lớp 8/1']);
    cfgSheet.appendRow(['schoolYear', '2024 - 2025']);
    cfgSheet.appendRow(['semester', 'Học kỳ 1']);
    cfgSheet.appendRow(['currentWeek', '8']);
    cfgSheet.getRange('A1:B1').setBackground('#0f172a').setFontColor('#ffffff').setFontWeight('bold');
  }
}

function saveWholeDataset(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  if (data.students && data.students.length > 0) {
    var sSheet = ss.getSheetByName(SHEET_NAMES.STUDENTS);
    sSheet.clear();
    sSheet.appendRow(['MaHS', 'HoTen', 'To', 'TongDiem', 'ChucVu', 'GioiTinh', 'ThuHangCu']);
    sSheet.getRange('A1:G1').setBackground('#1e3a8a').setFontColor('#ffffff').setFontWeight('bold');
    var rows = data.students.map(function(s) {
      return [s.code, s.name, s.team, s.points, s.role || 'Thành viên', s.gender || 'nam', s.prevRank || 0];
    });
    sSheet.getRange(2, 1, rows.length, 7).setValues(rows);
  }

  if (data.criteria && data.criteria.length > 0) {
    var cSheet = ss.getSheetByName(SHEET_NAMES.CRITERIA);
    cSheet.clear();
    cSheet.appendRow(['MaTieuChi', 'TenTieuChi', 'Loai', 'Diem', 'DanhMuc', 'MoTa']);
    cSheet.getRange('A1:F1').setBackground('#1e3a8a').setFontColor('#ffffff').setFontWeight('bold');
    var cRows = data.criteria.map(function(c) {
      return [c.id, c.name, c.type, c.points, c.category, c.description || ''];
    });
    cSheet.getRange(2, 1, cRows.length, 6).setValues(cRows);
  }
}
`;

export interface FetchSheetsResult {
  students?: Student[];
  criteria?: Criteria[];
  logs?: ScoreLog[];
  config?: Partial<AppConfig>;
}

export async function testGoogleSheetsConnection(scriptUrl: string): Promise<{ success: boolean; message: string; data?: FetchSheetsResult }> {
  if (!scriptUrl || !scriptUrl.startsWith('https://script.google.com/')) {
    return { success: false, message: 'URL không hợp lệ. URL phải bắt đầu bằng https://script.google.com/' };
  }

  try {
    const response = await fetch(scriptUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      return { success: false, message: `Máy chủ Google trả về mã lỗi: ${response.status}` };
    }

    const json = await response.json();
    if (json.status === 'success') {
      return { success: true, message: 'Kết nối Google Sheets thành công!', data: json.data };
    } else {
      return { success: false, message: json.message || 'Lỗi xử lý trên Apps Script' };
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Không thể kết nối đến Google Sheets (Có thể do mạng hoặc URL sai)'
    };
  }
}

export async function sendScoreLogToSheets(
  scriptUrl: string,
  log: ScoreLog
): Promise<{ success: boolean; message: string }> {
  if (!scriptUrl) return { success: false, message: 'Chưa cấu hình URL Google Apps Script' };

  try {
    const response = await fetch(scriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // Avoid CORS preflight OPTIONS in Apps Script
      body: JSON.stringify({
        action: 'ADD_SCORE',
        payload: log,
      }),
    });

    const json = await response.json();
    return { success: json.status === 'success', message: json.message || 'Đã gửi' };
  } catch (err) {
    return { success: false, message: String(err) };
  }
}

export async function revertScoreLogOnSheets(
  scriptUrl: string,
  logId: string
): Promise<{ success: boolean; message: string }> {
  if (!scriptUrl) return { success: false, message: 'Chưa cấu hình URL Google Apps Script' };

  try {
    const response = await fetch(scriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        action: 'REVERT_SCORE',
        payload: { logId },
      }),
    });

    const json = await response.json();
    return { success: json.status === 'success', message: json.message || 'Đã hủy' };
  } catch (err) {
    return { success: false, message: String(err) };
  }
}

export async function syncWholeDatasetToSheets(
  scriptUrl: string,
  data: { students: Student[]; criteria: Criteria[] }
): Promise<{ success: boolean; message: string }> {
  if (!scriptUrl) return { success: false, message: 'Chưa cấu hình URL' };

  try {
    const response = await fetch(scriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        action: 'SYNC_ALL_DATA',
        payload: data,
      }),
    });

    const json = await response.json();
    return { success: json.status === 'success', message: json.message || 'Đã đồng bộ' };
  } catch (err) {
    return { success: false, message: String(err) };
  }
}
