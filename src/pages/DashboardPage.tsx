import React from 'react';
import {
  Trophy,
  Crown,
  AlertTriangle,
  Award,
  Users,
  TrendingUp,
  Flame,
  ArrowUpRight,
  ChevronRight,
  ShieldAlert,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Student } from '../types';

interface DashboardPageProps {
  onNavigateToLeaderboard: () => void;
  onNavigateToQuickScore: () => void;
  onNavigateToReport: () => void;
  onSelectStudent: (student: Student) => void;
  onSelectTeam: (teamNum: number) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigateToLeaderboard,
  onNavigateToQuickScore,
  onNavigateToReport,
  onSelectStudent,
  onSelectTeam,
}) => {
  const { students, teamStats, logs, config, triggerConfetti } = useApp();

  // 1. Total class points
  const totalClassPoints = students.reduce((acc, s) => acc + s.points, 0);
  const avgClassPoints = students.length > 0 ? Math.round((totalClassPoints / students.length) * 10) / 10 : 0;

  // 2. Top leading team
  const leadingTeam = [...teamStats].sort((a, b) => b.totalPoints - a.totalPoints)[0];

  // 3. Top student
  const sortedStudents = [...students].sort((a, b) => b.points - a.points);
  const topStudent = sortedStudents[0];

  // 4. Student needing reminder (lowest points)
  const lowestStudent = sortedStudents[sortedStudents.length - 1];

  // 5. Violation breakdown
  const minusLogs = logs.filter((l) => l.type === 'minus');
  const violationCounts: { [name: string]: number } = {};
  minusLogs.forEach((l) => {
    violationCounts[l.criteriaName] = (violationCounts[l.criteriaName] || 0) + 1;
  });

  const sortedViolations = Object.entries(violationCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  // Maximum team points for bar chart scaling
  const maxTeamPoints = Math.max(...teamStats.map((t) => t.totalPoints), 100);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Hero Welcome & Quick Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-3xl bg-linear-to-r from-red-600 via-rose-600 to-amber-600 p-6 text-white shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
            <Flame className="h-3.5 w-3.5 fill-amber-300 text-amber-300" />
            <span>Nề Nếp Tuần {config.currentWeek}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black mt-2 tracking-tight">
            Cục Diện Thi Đua {config.className}
          </h2>
          <p className="text-xs sm:text-sm text-rose-100 mt-1">
            Tổng hợp dữ liệu thời gian thực • Gamification thi đua giữa 4 tổ
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onNavigateToQuickScore}
            className="flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-xs font-black text-red-600 shadow-md hover:bg-rose-50 active:scale-95 transition-all cursor-pointer"
          >
            <Zap className="h-4 w-4 fill-red-600" />
            <span>CHẤM ĐIỂM NGAY</span>
          </button>
          <button
            onClick={onNavigateToLeaderboard}
            className="flex items-center gap-2 rounded-2xl bg-black/25 px-4 py-2.5 text-xs font-bold text-white hover:bg-black/35 backdrop-blur-md border border-white/20 active:scale-95 transition-all cursor-pointer"
          >
            <Trophy className="h-4 w-4 text-amber-300" />
            <span>BẢNG XẾP HẠNG</span>
          </button>
        </div>
      </div>

      {/* 4 CORE STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Tổng điểm cả lớp */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Tổng điểm cả lớp
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{totalClassPoints}</span>
            <span className="text-xs text-slate-500 font-semibold">điểm</span>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Trung bình: <span className="font-bold text-slate-800">{avgClassPoints} đ</span> / học sinh ({students.length} HS)
          </p>
        </div>

        {/* Card 2: Tổ Dẫn Đầu */}
        <div
          onClick={() => leadingTeam && onSelectTeam(leadingTeam.teamNumber)}
          className="relative overflow-hidden rounded-3xl border border-amber-200 bg-linear-to-br from-amber-50/70 to-yellow-50/40 p-5 shadow-xs transition-all hover:shadow-md cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
              Tổ đang dẫn đầu
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-amber-400 text-slate-900 shadow-xs group-hover:scale-110 transition-transform">
              <Crown className="h-5 w-5 fill-slate-900" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-950">
              {leadingTeam ? leadingTeam.teamName : 'Tổ 1'}
            </span>
            <span className="text-xs font-extrabold text-amber-700">
              {leadingTeam ? leadingTeam.totalPoints : 0} đ
            </span>
          </div>
          <p className="mt-2 text-xs text-amber-800 flex items-center gap-1 font-medium">
            <span>Cách tổ nhì</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
            <span>Nhấn để xem chi tiết tổ</span>
          </p>
        </div>

        {/* Card 3: Học sinh xuất sắc nhất */}
        <div
          onClick={() => topStudent && onSelectStudent(topStudent)}
          className="relative overflow-hidden rounded-3xl border border-emerald-200 bg-linear-to-br from-emerald-50/70 to-teal-50/40 p-5 shadow-xs transition-all hover:shadow-md cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Xuất sắc nhất tuần
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-xs group-hover:scale-110 transition-transform">
              <Award className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2 truncate">
            <span className="text-xl sm:text-2xl font-black text-emerald-950 truncate">
              {topStudent ? topStudent.name : 'Chưa có'}
            </span>
          </div>
          <p className="mt-2 text-xs text-emerald-800 font-medium">
            {topStudent ? `Tổ ${topStudent.team} • ${topStudent.points} điểm` : ''} (Top 1)
          </p>
        </div>

        {/* Card 4: Học sinh cần nhắc nhở */}
        <div
          onClick={() => lowestStudent && onSelectStudent(lowestStudent)}
          className="relative overflow-hidden rounded-3xl border border-rose-200 bg-linear-to-br from-rose-50/70 to-red-50/40 p-5 shadow-xs transition-all hover:shadow-md cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-700">
              Cần nhắc nhở nề nếp
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-rose-500 text-white shadow-xs group-hover:scale-110 transition-transform">
              <ShieldAlert className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2 truncate">
            <span className="text-xl sm:text-2xl font-black text-rose-950 truncate">
              {lowestStudent ? lowestStudent.name : 'Không có'}
            </span>
          </div>
          <p className="mt-2 text-xs text-rose-800 font-medium">
            {lowestStudent ? `Tổ ${lowestStudent.team} • Hiện còn ${lowestStudent.points} đ` : ''}
          </p>
        </div>
      </div>

      {/* 4 TEAMS EMULATION CARDS & BAR CHART (SECTION VIII) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 4 Teams Overview Cards (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              <h3 className="text-base font-black text-slate-900 tracking-tight">
                Thi Đua 4 Tổ (Team Emulation)
              </h3>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              Tuần {config.currentWeek}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {teamStats.map((team) => {
              const isFirst = team.rank === 1;
              return (
                <div
                  key={team.teamNumber}
                  className={`relative flex flex-col justify-between rounded-3xl p-5 border-2 transition-all hover:shadow-lg ${
                    isFirst
                      ? 'border-amber-400 bg-linear-to-b from-amber-50/60 to-white shadow-md'
                      : 'border-slate-200 bg-white shadow-2xs hover:border-blue-300'
                  }`}
                >
                  {isFirst && (
                    <div className="absolute -top-3 right-4 flex items-center gap-1 rounded-full bg-linear-to-r from-amber-500 to-yellow-500 px-3 py-0.5 text-[11px] font-black text-slate-950 shadow-xs">
                      <Crown className="h-3 w-3 fill-slate-950" />
                      <span>DẪN ĐẦU</span>
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 font-black text-white text-xs">
                          T{team.teamNumber}
                        </span>
                        <div>
                          <h4 className="text-base font-black text-slate-900">
                            {team.teamName}
                          </h4>
                          <p className="text-[11px] text-slate-500">
                            {team.studentCount} thành viên
                          </p>
                        </div>
                      </div>
                      <span
                        className={`rounded-xl px-2.5 py-1 text-xs font-black ${
                          team.rank === 1
                            ? 'bg-amber-100 text-amber-800'
                            : team.rank === 2
                            ? 'bg-slate-200 text-slate-800'
                            : team.rank === 3
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        Hạng #{team.rank}
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2 rounded-2xl bg-slate-50 p-2.5 text-center">
                      <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400">
                          Tổng điểm
                        </p>
                        <p className="text-base font-black text-slate-900">
                          {team.totalPoints} đ
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400">
                          Điểm TB/HS
                        </p>
                        <p className="text-base font-black text-blue-600">
                          {team.avgPoints} đ
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-500 truncate max-w-[130px]">
                      Top:{' '}
                      <strong className="text-slate-800">
                        {team.topStudent ? team.topStudent.name : 'N/A'}
                      </strong>
                    </span>
                    <button
                      onClick={() => onSelectTeam(team.teamNumber)}
                      className="flex items-center gap-1 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-blue-700 px-3 py-1.5 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
                    >
                      <span>Xem chi tiết</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Bar Chart & Violation Breakdown (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Comparison Bar Chart */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4">
              So Sánh Điểm Thi Đua 4 Tổ
            </h3>
            <div className="space-y-3">
              {teamStats.map((team) => {
                const percent = Math.min(Math.round((team.totalPoints / maxTeamPoints) * 100), 100);
                return (
                  <div key={team.teamNumber} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-800">Tổ {team.teamNumber}</span>
                      <span className="text-slate-600">{team.totalPoints} đ</span>
                    </div>
                    <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          team.rank === 1
                            ? 'bg-linear-to-r from-amber-400 to-amber-500'
                            : team.rank === 2
                            ? 'bg-linear-to-r from-blue-500 to-indigo-500'
                            : team.rank === 3
                            ? 'bg-linear-to-r from-teal-400 to-emerald-500'
                            : 'bg-linear-to-r from-slate-400 to-slate-500'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Violations Pie / Breakdown (Section XVI) */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 text-rose-500" />
                Lỗi Vi Phạm Phổ Biến Tuần Này
              </h3>
              <span className="text-[11px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                {minusLogs.length} lần
              </span>
            </div>

            {sortedViolations.length > 0 ? (
              <div className="space-y-2.5">
                {sortedViolations.map(([name, count], index) => {
                  const percentage =
                    minusLogs.length > 0 ? Math.round((count / minusLogs.length) * 100) : 0;
                  return (
                    <div key={name} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-800 truncate pr-2">
                          {name}
                        </span>
                        <span className="font-bold text-rose-600 shrink-0">
                          {count} lần ({percentage}%)
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-rose-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-slate-400">
                Lớp chưa có vi phạm nào trong tuần! Rất đáng khen ngợi 🎉
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RECENT SCORING TIMELINE / STREAM */}
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-red-500" />
            <h3 className="text-base font-black text-slate-900">
              Nhật Ký Thi Đua Gần Đây
            </h3>
          </div>
          <button
            onClick={onNavigateToQuickScore}
            className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1"
          >
            <span>+ Chấm thêm</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
          {logs.slice(0, 6).map((log) => (
            <div
              key={log.id}
              className="py-3 flex items-center justify-between hover:bg-slate-50/60 rounded-xl px-2 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-black ${
                    log.type === 'plus'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {log.type === 'plus' ? '+' : '-'}
                </span>
                <div className="truncate">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {log.studentName}
                    </p>
                    <span className="rounded-sm bg-slate-100 px-1 text-[10px] text-slate-500">
                      Tổ {log.team}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 truncate mt-0.5">
                    {log.criteriaName}
                  </p>
                </div>
              </div>

              <div className="text-right pl-3 shrink-0">
                <span
                  className={`text-xs font-black ${
                    log.type === 'plus' ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {log.pointChange > 0 ? `+${log.pointChange}` : log.pointChange} đ
                </span>
                <p className="text-[10px] text-slate-400 mt-0.5">{log.formattedDate}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
