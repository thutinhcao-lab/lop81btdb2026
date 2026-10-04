import React, { useState } from 'react';
import {
  FileBarChart,
  Trophy,
  Award,
  AlertTriangle,
  Printer,
  Download,
  Calendar,
  Lock,
  RotateCcw,
  Sparkles,
  Crown,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Student } from '../types';

interface WeeklyReportPageProps {
  onSelectStudent: (student: Student) => void;
}

export const WeeklyReportPage: React.FC<WeeklyReportPageProps> = ({ onSelectStudent }) => {
  const { students, teamStats, logs, config, resetWeeklyScores, user } = useApp();

  const [isLockModalOpen, setIsLockModalOpen] = useState(false);
  const [resetPointsOption, setResetPointsOption] = useState(true);

  const isTeacher = user?.role === 'TEACHER';

  // Sort students
  const sortedStudents = [...students].sort((a, b) => b.points - a.points);
  const top5Students = sortedStudents.slice(0, 5);
  const bottom3Students = [...sortedStudents].reverse().slice(0, 3);

  // Teams sorted by rank
  const sortedTeams = [...teamStats].sort((a, b) => b.totalPoints - a.totalPoints);
  const bestTeam = sortedTeams[0];
  const worstTeam = sortedTeams[sortedTeams.length - 1];

  // Logs this week
  const weekPlusLogs = logs.filter((l) => l.type === 'plus');
  const weekMinusLogs = logs.filter((l) => l.type === 'minus');

  const handlePrint = () => {
    window.print();
  };

  const handleExportReportCSV = () => {
    const lines = [
      `BIÊN BẢN TỔNG KẾT THI ĐUA SINH HOẠT LỚP - TUẦN ${config.currentWeek}`,
      `Lớp: ${config.className} - Năm học: ${config.schoolYear} - ${config.semester}`,
      `Thời gian xuất: ${new Date().toLocaleDateString('vi-VN')}`,
      '',
      '=== BẢNG XẾP HẠNG 4 TỔ ===',
      'Hạng,Tổ,Tổng Điểm,Điểm TB/HS,Sĩ Số,Đánh Giá',
      ...sortedTeams.map(
        (t, idx) =>
          `${idx + 1},${t.teamName},${t.totalPoints},${t.avgPoints},${t.studentCount},${
            idx === 0 ? 'XUẤT SẮC NHẤT' : idx === 3 ? 'CẦN CỐ GẮNG' : 'KHÁ TỐT'
          }`
      ),
      '',
      '=== TOP 5 HỌC SINH XUẤT SẮC ĐƯỢC TUYÊN DƯƠNG ===',
      'Hạng,Mã HS,Họ và Tên,Tổ,Điểm Số,Chức Vụ',
      ...top5Students.map(
        (s, idx) => `${idx + 1},${s.code},"${s.name}",Tổ ${s.team},${s.points},"${s.role || 'Thành viên'}"`
      ),
      '',
      '=== DANH SÁCH CẦN NHẮC NHỞ / CỐ GẮNG ===',
      'Hạng,Mã HS,Họ và Tên,Tổ,Điểm Số',
      ...bottom3Students.map(
        (s, idx) => `${idx + 1},${s.code},"${s.name}",Tổ ${s.team},${s.points}`
      ),
    ];

    const content = '\uFEFF' + lines.join('\n');
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Bao_Cao_Thi_Dua_Tuan_${config.currentWeek}_${config.className.replace(/\s+/g, '_')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleConfirmLockWeek = () => {
    resetWeeklyScores(!resetPointsOption);
    setIsLockModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-3xl bg-linear-to-r from-indigo-700 via-purple-700 to-pink-700 p-6 text-white shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
            <FileBarChart className="h-3.5 w-3.5" />
            <span>Sinh Hoạt Lớp Thứ Sáu</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black mt-2 tracking-tight">
            Báo Cáo Thi Đua Tuần {config.currentWeek}
          </h2>
          <p className="text-xs sm:text-sm text-indigo-100 mt-1">
            Tổng kết khen thưởng, phê bình và xếp hạng thi đua phục vụ giờ sinh hoạt lớp
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 px-3.5 py-2 text-xs font-bold text-white active:scale-95 transition-all cursor-pointer"
          >
            <Printer className="h-4 w-4" />
            <span>In Báo Cáo</span>
          </button>
          <button
            onClick={handleExportReportCSV}
            className="flex items-center gap-1.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 px-3.5 py-2 text-xs font-bold text-white active:scale-95 transition-all cursor-pointer"
          >
            <Download className="h-4 w-4" />
            <span>Xuất Excel/CSV</span>
          </button>

          {isTeacher && (
            <button
              onClick={() => setIsLockModalOpen(true)}
              className="flex items-center gap-1.5 rounded-2xl bg-white px-4 py-2 text-xs font-black text-indigo-900 shadow-md hover:bg-indigo-50 active:scale-95 transition-all cursor-pointer"
            >
              <Lock className="h-4 w-4" />
              <span>CHỐT ĐIỂM TUẦN</span>
            </button>
          )}
        </div>
      </div>

      {/* PRINT-FRIENDLY REPORT CONTAINER */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-8">
        {/* Header Document */}
        <div className="border-b border-slate-200 pb-6 text-center">
          <p className="text-xs font-bold tracking-widest text-slate-400 uppercase">
            TRƯỜNG THCS NGUYỄN VĂN TRỖI • {config.className.toUpperCase()}
          </p>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 tracking-tight">
            BIÊN BẢN TỔNG KẾT THI ĐUA SINH HOẠT LỚP
          </h1>
          <p className="text-sm font-semibold text-slate-600 mt-1">
            Tuần {config.currentWeek} • {config.semester} • Năm học {config.schoolYear}
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500">
            <span>GVCN: Cô Cao Thị Tình</span>
            <span>•</span>
            <span>Tổng số việc tốt ghi nhận: <strong className="text-emerald-600">+{weekPlusLogs.length}</strong></span>
            <span>•</span>
            <span>Tổng số vi phạm: <strong className="text-rose-600">-{weekMinusLogs.length}</strong></span>
          </div>
        </div>

        {/* 1. KẾT QUẢ THI ĐUA 4 TỔ */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="h-5 w-5 text-amber-500" />
            <h3 className="text-base font-black text-slate-900 uppercase tracking-wide">
              I. Xếp Hạng Thi Đua Các Tổ
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            {sortedTeams.map((team, idx) => (
              <div
                key={team.teamNumber}
                className={`rounded-2xl p-4 border-2 ${
                  idx === 0
                    ? 'border-amber-400 bg-amber-50/50'
                    : idx === 3
                    ? 'border-rose-200 bg-rose-50/30'
                    : 'border-slate-200 bg-slate-50/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-slate-500">
                    HẠNG #{idx + 1}
                  </span>
                  {idx === 0 && <Crown className="h-4 w-4 text-amber-500 fill-amber-400" />}
                </div>
                <h4 className="text-lg font-black text-slate-900 mt-1">{team.teamName}</h4>
                <div className="mt-2 text-xs space-y-0.5">
                  <p className="text-slate-600">
                    Tổng điểm: <strong className="text-slate-900">{team.totalPoints} đ</strong>
                  </p>
                  <p className="text-slate-600">
                    Điểm TB: <strong className="text-blue-600">{team.avgPoints} đ</strong>
                  </p>
                  <p className="text-[11px] font-semibold mt-1">
                    {idx === 0 ? (
                      <span className="text-emerald-700">🏆 Tuyên dương toàn tổ!</span>
                    ) : idx === 3 ? (
                      <span className="text-rose-700">⚠️ Trực nhật & cải thiện nề nếp</span>
                    ) : (
                      <span className="text-slate-600">Duy trì nề nếp tốt</span>
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. TOP 5 TUYÊN DƯƠNG XUẤT SẮC */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-emerald-500" />
              <h3 className="text-base font-black text-slate-900 uppercase tracking-wide">
                II. Tuyên Dương Top 5 Học Sinh Xuất Sắc Nhất
              </h3>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
              Khen ngợi & Thưởng Sao
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-emerald-50/80 border-b border-emerald-100 text-emerald-950 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-4">Hạng</th>
                  <th className="py-2.5 px-4">Họ và Tên</th>
                  <th className="py-2.5 px-4">Tổ</th>
                  <th className="py-2.5 px-4">Chức vụ</th>
                  <th className="py-2.5 px-4 text-right">Tổng Điểm</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {top5Students.map((s, idx) => (
                  <tr
                    key={s.id}
                    onClick={() => onSelectStudent(s)}
                    className="hover:bg-emerald-50/30 cursor-pointer transition-colors"
                  >
                    <td className="py-2.5 px-4 font-black text-emerald-700">#{idx + 1}</td>
                    <td className="py-2.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-600 text-white font-black text-[10px]">
                        ★
                      </span>
                      <span>{s.name}</span>
                    </td>
                    <td className="py-2.5 px-4 text-slate-600">Tổ {s.team}</td>
                    <td className="py-2.5 px-4 text-slate-600">{s.role || 'Thành viên'}</td>
                    <td className="py-2.5 px-4 text-right font-black text-emerald-600 text-sm">
                      {s.points} đ
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 3. PHÊ BÌNH & NHẮC NHỞ */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-rose-500" />
              <h3 className="text-base font-black text-slate-900 uppercase tracking-wide">
                III. Học Sinh Cần Nghiêm Túc Rút Kinh Nghiệm
              </h3>
            </div>
            <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full">
              Nhắc nhở nề nếp
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-rose-50/80 border-b border-rose-100 text-rose-950 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-4">STT</th>
                  <th className="py-2.5 px-4">Họ và Tên</th>
                  <th className="py-2.5 px-4">Tổ</th>
                  <th className="py-2.5 px-4 text-center">Điểm Hiện Tại</th>
                  <th className="py-2.5 px-4">Biện Pháp Phối Hợp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {bottom3Students.map((s, idx) => (
                  <tr
                    key={s.id}
                    onClick={() => onSelectStudent(s)}
                    className="hover:bg-rose-50/30 cursor-pointer transition-colors"
                  >
                    <td className="py-2.5 px-4 font-bold text-rose-600">0{idx + 1}</td>
                    <td className="py-2.5 px-4 font-bold text-slate-900">{s.name}</td>
                    <td className="py-2.5 px-4 text-slate-600">Tổ {s.team}</td>
                    <td className="py-2.5 px-4 text-center font-black text-rose-600">
                      {s.points} đ
                    </td>
                    <td className="py-2.5 px-4 text-slate-600 text-[11px]">
                      Tổ trưởng đôn đốc kiểm tra bài cũ & đồng phục đầu giờ.
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 4. KÝ TÊN BIÊN BẢN */}
        <div className="pt-6 grid grid-cols-3 text-center text-xs font-semibold text-slate-700">
          <div>
            <p className="uppercase font-bold text-slate-500 text-[10px]">ĐẠI DIỆN ĐỘI CỜ ĐỎ</p>
            <p className="mt-14 italic text-slate-500">(Ký và ghi rõ họ tên)</p>
          </div>
          <div>
            <p className="uppercase font-bold text-slate-500 text-[10px]">LỚP TRƯỞNG</p>
            <p className="mt-14 italic text-slate-500">Nguyễn Văn An</p>
          </div>
          <div>
            <p className="uppercase font-bold text-slate-500 text-[10px]">GIÁO VIÊN CHỦ NHIỆM</p>
            <p className="mt-14 font-bold text-slate-900">Cô Cao Thị Tình</p>
          </div>
        </div>
      </div>

      {/* MODAL: CHỐT ĐIỂM TUẦN */}
      {isLockModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="w-full max-w-md rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-linear-to-r from-indigo-700 to-purple-800 p-6 text-white text-center">
              <Lock className="h-10 w-10 mx-auto text-amber-300 mb-2" />
              <h3 className="text-xl font-black">Xác Nhận Chốt Điểm Tuần {config.currentWeek}</h3>
              <p className="text-xs text-indigo-100 mt-1">
                Lưu trữ biên bản thi đua và chuyển giao sang Tuần {config.currentWeek + 1}
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200 space-y-2 text-xs">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                  <input
                    type="radio"
                    name="resetOption"
                    checked={resetPointsOption}
                    onChange={() => setResetPointsOption(true)}
                    className="accent-indigo-600"
                  />
                  <span>Làm mới điểm tất cả học sinh về {config.startingPoints || 100} điểm</span>
                </label>
                <p className="text-[11px] text-slate-500 pl-5">
                  Thích hợp cho hình thức thi đua độc lập theo từng tuần mới.
                </p>

                <div className="border-t border-slate-200 my-2" />

                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                  <input
                    type="radio"
                    name="resetOption"
                    checked={!resetPointsOption}
                    onChange={() => setResetPointsOption(false)}
                    className="accent-indigo-600"
                  />
                  <span>Giữ nguyên điểm số (Tiếp tục cộng dồn sang tuần sau)</span>
                </label>
                <p className="text-[11px] text-slate-500 pl-5">
                  Thích hợp cho hình thức tính điểm tích lũy học kỳ.
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsLockModalOpen(false)}
                  className="flex-1 rounded-2xl border border-slate-200 py-3 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={handleConfirmLockWeek}
                  className="flex-1 rounded-2xl bg-indigo-600 py-3 text-xs font-bold text-white shadow-md hover:bg-indigo-700 cursor-pointer"
                >
                  Đồng ý Chốt Điểm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
