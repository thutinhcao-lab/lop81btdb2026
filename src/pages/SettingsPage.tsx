import React, { useState, useRef } from 'react';
import {
  Settings,
  Database,
  Cloud,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  Upload,
  Download,
  RotateCcw,
  Sparkles,
  ExternalLink,
  ShieldAlert,
  Volume2,
  FileCode,
  Camera,
  Trash2,
  Music,
  Youtube,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ClassLogo } from '../components/ClassLogo';
import { LoginBackgroundMusic } from '../components/LoginBackgroundMusic';
import { YouTubeModal } from '../components/YouTubeModal';
import { resizeAvatarImage } from '../utils/avatar';
import {
  GOOGLE_APPS_SCRIPT_CODE,
  testGoogleSheetsConnection,
} from '../services/googleSheetsService';
import {
  INITIAL_STUDENTS,
  INITIAL_CRITERIA,
  INITIAL_LOGS,
  INITIAL_CONFIG,
} from '../data/initialData';

export const SettingsPage: React.FC = () => {
  const {
    config,
    updateConfig,
    syncFromSheets,
    syncToSheets,
    isSyncing,
    syncStatus,
    lastSyncTime,
    addToast,
    user,
  } = useApp();

  const [scriptUrlInput, setScriptUrlInput] = useState(config.googleSheetScriptUrl || '');
  const [isTestingUrl, setIsTestingUrl] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Form config state
  const [classNameInput, setClassNameInput] = useState(config.className);
  const [schoolYearInput, setSchoolYearInput] = useState(config.schoolYear);
  const [semesterInput, setSemesterInput] = useState(config.semester);
  const [weekInput, setWeekInput] = useState(config.currentWeek);
  const [startingPointsInput, setStartingPointsInput] = useState(config.startingPoints || 100);
  const [isYouTubeModalOpen, setIsYouTubeModalOpen] = useState(false);

  const isTeacher = user?.role === 'TEACHER';
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleUploadLogoFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      addToast('error', 'Vui lòng chọn một tệp hình ảnh hợp lệ (PNG, JPG, WEBP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = async (e) => {
      const raw = e.target?.result as string;
      const optimized = await resizeAvatarImage(raw, 256, 256, 0.9);
      updateConfig({ customLogoUrl: optimized });
      addToast('success', 'Đã cập nhật logo cá nhân mới thành công!');
    };
    reader.readAsDataURL(file);
  };

  const handleResetLogo = () => {
    updateConfig({ customLogoUrl: undefined });
    addToast('info', 'Đã khôi phục logo huy hiệu khoa học mặc định.');
  };

  const handleSaveClassConfig = (e: React.FormEvent) => {
    e.preventDefault();
    updateConfig({
      className: classNameInput.trim() || 'Lớp 8/1',
      schoolYear: schoolYearInput.trim() || '2024 - 2025',
      semester: semesterInput,
      currentWeek: Number(weekInput) || 1,
      startingPoints: Number(startingPointsInput) || 100,
    });
  };

  const handleSaveScriptUrl = () => {
    updateConfig({ googleSheetScriptUrl: scriptUrlInput.trim() });
    addToast('success', 'Đã lưu URL Google Apps Script!');
  };

  const handleTestConnection = async () => {
    if (!scriptUrlInput.trim()) {
      setTestResult({ success: false, message: 'Vui lòng nhập URL Google Apps Script trước.' });
      return;
    }

    setIsTestingUrl(true);
    setTestResult(null);
    try {
      const res = await testGoogleSheetsConnection(scriptUrlInput.trim());
      setTestResult(res);
      if (res.success) {
        updateConfig({ googleSheetScriptUrl: scriptUrlInput.trim() });
      }
    } finally {
      setIsTestingUrl(false);
    }
  };

  const handleCopyScriptCode = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
    setCopiedCode(true);
    addToast('success', 'Đã sao chép toàn bộ mã Google Apps Script vào Clipboard!');
    setTimeout(() => setCopiedCode(false), 3000);
  };

  const handleResetToFactoryDefaults = () => {
    if (
      confirm(
        'Bạn có chắc muốn KHÔI PHỤC DỮ LIỆU GỐC?\nToàn bộ học sinh và điểm số mẫu sẽ được khôi phục về trạng thái ban đầu.'
      )
    ) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-200 max-w-4xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-3xl bg-linear-to-r from-slate-900 via-slate-800 to-indigo-950 p-6 text-white shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
            <Settings className="h-3.5 w-3.5" />
            <span>Cấu Hình & Đồng Bộ</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black mt-2 tracking-tight">
            Cài Đặt Hệ Thống & Google Sheets
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Kết nối đám mây Google Drive • Quản lý thông tin lớp học • Mã nguồn Apps Script
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div
            className={`flex items-center gap-2 rounded-2xl px-3.5 py-2 text-xs font-bold border ${
              syncStatus === 'synced'
                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                : 'bg-amber-500/20 border-amber-400 text-amber-300'
            }`}
          >
            <Cloud className="h-4 w-4" />
            <span>{syncStatus === 'synced' ? 'Đã liên kết Sheets' : 'Lưu trữ cục bộ'}</span>
          </div>
        </div>
      </div>

      {/* SECTION 1: GOOGLE SHEETS & APPS SCRIPT CONFIGURATION */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                1. Kết Nối Google Sheets (Google Apps Script API)
              </h3>
              <p className="text-xs text-slate-500">
                Tự động đồng bộ 100% dữ liệu vào file Google Sheets trên Google Drive
              </p>
            </div>
          </div>

          <span
            className={`rounded-full px-3 py-1 text-[11px] font-bold ${
              config.googleSheetScriptUrl
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {config.googleSheetScriptUrl ? '🟢 Đã cấu hình URL' : '⚪ Chưa có URL'}
          </span>
        </div>

        {/* Input Script URL */}
        <div className="space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            Web App URL (URL Ứng dụng web Google Apps Script)
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="url"
              placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
              value={scriptUrlInput}
              onChange={(e) => setScriptUrlInput(e.target.value)}
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-mono font-medium text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-hidden"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTestingUrl}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-sm active:scale-95 transition-all cursor-pointer"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isTestingUrl ? 'animate-spin' : ''}`} />
                <span>{isTestingUrl ? 'Đang test...' : 'Kiểm Tra'}</span>
              </button>
              <button
                type="button"
                onClick={handleSaveScriptUrl}
                className="rounded-xl border border-slate-200 bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 cursor-pointer"
              >
                Lưu
              </button>
            </div>
          </div>

          {/* Test Status feedback */}
          {testResult && (
            <div
              className={`flex items-start gap-2.5 rounded-2xl p-3.5 text-xs ${
                testResult.success
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                  : 'bg-rose-50 border border-rose-200 text-rose-900'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-bold">{testResult.message}</p>
                {testResult.success && (
                  <p className="text-[11px] text-emerald-700 mt-0.5">
                    Hệ thống đã nhận diện được 4 Sheet: DANH_SACH_HOC_SINH, DANH_MUC_THI_DUA,
                    LICH_SU_CHAM_DIEM, CAU_HINH.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Bi-directional Sync Actions */}
          {config.googleSheetScriptUrl && (
            <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-2.5">
              <button
                onClick={syncFromSheets}
                disabled={isSyncing}
                className="flex items-center gap-2 rounded-xl bg-blue-50 border border-blue-200 px-3.5 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100 active:scale-95 transition-all cursor-pointer"
              >
                <Download className="h-4 w-4" />
                <span>Tải dữ liệu mới nhất từ Google Sheets về Web</span>
              </button>
              <button
                onClick={syncToSheets}
                disabled={isSyncing}
                className="flex items-center gap-2 rounded-xl bg-slate-100 border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 active:scale-95 transition-all cursor-pointer"
              >
                <Upload className="h-4 w-4" />
                <span>Đẩy danh sách hiện tại lên Google Sheets (Ghi đè)</span>
              </button>
            </div>
          )}
        </div>

        {/* SECTION 2: ONE-CLICK APPS SCRIPT CODE & SETUP INSTRUCTIONS */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileCode className="h-4 w-4 text-emerald-600" />
                Đoạn Mã Google Apps Script (.gs) Mẫu Chuẩn
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Chỉ cần copy và paste vào Apps Script của file Google Sheet của bạn
              </p>
            </div>
            <button
              onClick={handleCopyScriptCode}
              className="flex items-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 px-3.5 py-2 text-xs font-bold text-white shadow-xs active:scale-95 transition-all cursor-pointer self-start sm:self-auto"
            >
              {copiedCode ? (
                <>
                  <Check className="h-4 w-4 text-emerald-400" />
                  <span>Đã sao chép!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span>Sao chép toàn bộ mã .gs</span>
                </>
              )}
            </button>
          </div>

          {/* Step-by-step instructions */}
          <div className="rounded-xl bg-white p-4 border border-slate-200 space-y-2 text-xs text-slate-700">
            <p className="font-bold text-slate-900 uppercase text-[11px] tracking-wider text-emerald-700">
              📋 Hướng Dẫn 7 Bước Thiết Lập Google Sheets:
            </p>
            <ol className="list-decimal list-inside space-y-1.5 leading-relaxed text-slate-600">
              <li>
                Mở Google Drive và tạo một file Google Sheets mới (Ví dụ đặt tên:{' '}
                <strong className="text-slate-800">DU_LIEU_THI_DUA_81</strong>).
              </li>
              <li>
                Trên thanh menu Google Sheets, chọn{' '}
                <strong className="text-slate-800">Tiện ích mở rộng (Extensions)</strong> &gt;{' '}
                <strong className="text-slate-800">Apps Script</strong>.
              </li>
              <li>
                Xóa toàn bộ mã mặc định trong tệp <code className="bg-slate-100 px-1">Mã.gs</code>,
                nhấn nút <strong>"Sao chép toàn bộ mã .gs"</strong> ở trên và dán vào.
              </li>
              <li>Nhấn nút 💾 Lưu (Ctrl + S).</li>
              <li>
                Nhấn nút <strong className="text-blue-600">Triển khai (Deploy)</strong> &gt;{' '}
                <strong>Triển khai dưới dạng ứng dụng web mới (New deployment)</strong>:
                <ul className="list-disc list-inside pl-4 mt-1 text-slate-500">
                  <li>
                    Người thực thi (Execute as): <strong>Tôi (Me)</strong>
                  </li>
                  <li>
                    Ai có quyền truy cập (Who has access):{' '}
                    <strong className="text-red-600">Bất kỳ ai (Anyone)</strong> *(Rất quan
                    trọng)*
                  </li>
                </ul>
              </li>
              <li>
                Nhấn <strong>Triển khai</strong>, cấp quyền cho script khi Google hỏi, sau đó sao
                chép <strong>URL Ứng dụng web (Web App URL)</strong>.
              </li>
              <li>
                Dán URL vào ô ở trên và bấm <strong>"Kiểm Tra"</strong>. File Google Sheets sẽ tự
                động sinh ra 4 Sheet đúng chuẩn!
              </li>
            </ol>
          </div>
        </div>
      </div>

      {/* SECTION 2: CLASS CONFIGURATION */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-black text-slate-900">
              2. Thông Tin Lớp Học & Chu Kỳ Thi Đua
            </h3>
            <p className="text-xs text-slate-500">
              Điều chỉnh logo nhận diện, tên lớp, năm học và thang điểm khởi đầu
            </p>
          </div>
        </div>

        {/* Hidden Logo File Input */}
        <input
          ref={logoInputRef}
          type="file"
          accept="image/png, image/jpeg, image/jpg, image/webp"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleUploadLogoFile(e.target.files[0]);
            }
          }}
        />

        {/* Logo Card */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-blue-50/60 border border-blue-200/80">
          <div className="flex items-center gap-4">
            <ClassLogo size="lg" />
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-blue-900">
                Logo Nhận Diện Cá Nhân (Cô Cao Tình - Lớp 8/1)
              </h4>
              <p className="text-[11px] text-blue-700 mt-0.5">
                {config.customLogoUrl
                  ? 'Đang sử dụng ảnh logo tùy chỉnh tải lên từ máy tính.'
                  : 'Huy hiệu chuyên nghiệp tông màu xanh dương với biểu tượng STEM & Khoa học.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => logoInputRef.current?.click()}
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer"
            >
              <Camera className="h-3.5 w-3.5" />
              <span>Tải logo từ máy tính</span>
            </button>
            {config.customLogoUrl && (
              <button
                type="button"
                onClick={handleResetLogo}
                className="flex items-center gap-1 rounded-xl text-rose-600 hover:bg-rose-100/60 px-2.5 py-2 text-xs font-semibold transition-colors cursor-pointer"
                title="Khôi phục logo mặc định"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Mặc định</span>
              </button>
            )}
          </div>
        </div>

        <form onSubmit={handleSaveClassConfig} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Tên Lớp Học
              </label>
              <input
                type="text"
                value={classNameInput}
                onChange={(e) => setClassNameInput(e.target.value)}
                placeholder="Ví dụ: Lớp 8/1 hoặc Lớp 6B1..."
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Năm học
              </label>
              <input
                type="text"
                value={schoolYearInput}
                onChange={(e) => setSchoolYearInput(e.target.value)}
                placeholder="Ví dụ: 2024 - 2025"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Học kỳ
              </label>
              <select
                value={semesterInput}
                onChange={(e) => setSemesterInput(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-900"
              >
                <option value="Học kỳ 1">Học kỳ 1</option>
                <option value="Học kỳ 2">Học kỳ 2</option>
                <option value="Hè">Hè</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Tuần thi đua hiện tại
              </label>
              <input
                type="number"
                min={1}
                max={40}
                value={weekInput}
                onChange={(e) => setWeekInput(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
              Điểm khởi điểm ban đầu mỗi tuần (Mặc định: 100 điểm)
            </label>
            <input
              type="number"
              value={startingPointsInput}
              onChange={(e) => setStartingPointsInput(Number(e.target.value))}
              className="w-full sm:w-64 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-900"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Điểm mốc chuẩn đầu tuần. Học sinh làm việc tốt được cộng thêm, vi phạm bị trừ dần.
            </p>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800 shadow-sm cursor-pointer"
            >
              Lưu Cấu Hình Lớp Học
            </button>
          </div>
        </form>
      </div>

      {/* SECTION 3: BACKGROUND MUSIC CONFIGURATION */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Music className="h-5 w-5 text-rose-600" />
              3. Nhạc Nền Màn Hình Đăng Nhập (Background Music)
            </h3>
            <p className="text-xs text-slate-500">
              Cài đặt bài nhạc phát khi người dùng truy cập màn hình đăng nhập (chỉ nhận file .mp3, .wav tối đa 5MB)
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold text-slate-800">
              Trạng thái & Quản lý file nhạc nền
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Hệ thống tự động phát sau cú click đầu tiên hoặc khi bấm nút Play ở góc màn hình đăng nhập. File được lưu trữ vĩnh viễn trên máy chủ.
            </p>
          </div>
          <LoginBackgroundMusic className="relative" compact={false} />
        </div>
      </div>

      {/* SECTION 4: YOUTUBE EMBED VIDEO */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Youtube className="h-5 w-5 text-red-600 fill-current" />
              4. Video YouTube Màn Hình Đăng Nhập (Modal Embed)
            </h3>
            <p className="text-xs text-slate-500">
              Nhúng video YouTube (giới thiệu lớp, nội quy hoặc bài hát truyền thống) phát qua popup modal trên màn hình đăng nhập
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold text-slate-800">
              Cài đặt đường link nhúng YouTube
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Tự động bóc tách ID video từ các định dạng youtube.com/watch?v=..., youtu.be/... và lưu vĩnh viễn trên hệ thống.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsYouTubeModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-red-500/20 hover:brightness-105 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
          >
            <Youtube className="h-4 w-4 fill-white" />
            <span>Cài Đặt & Xem Thử Video</span>
          </button>
        </div>
      </div>

      {/* SECTION 5: SYSTEM RESET */}
      <div className="rounded-3xl border border-rose-200 bg-rose-50/30 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-rose-950 flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-rose-600" />
            Khôi Phục Dữ Liệu Mẫu Thử Nghiệm
          </h3>
          <p className="text-xs text-rose-700 mt-0.5">
            Xóa bỏ các điểm số đã thử nghiệm và đặt lại danh sách 40 học sinh mẫu của 4 Tổ ban đầu.
          </p>
        </div>

        <button
          onClick={handleResetToFactoryDefaults}
          className="flex items-center gap-1.5 rounded-xl border border-rose-300 bg-white px-4 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 shadow-2xs active:scale-95 transition-all cursor-pointer self-start sm:self-auto"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Khôi Phục Mẫu</span>
        </button>
      </div>

      {/* YouTube Modal Popup */}
      <YouTubeModal
        isOpen={isYouTubeModalOpen}
        onClose={() => setIsYouTubeModalOpen(false)}
      />
    </div>
  );
};
