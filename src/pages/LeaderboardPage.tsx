import React, { useState } from 'react';
import {
  Trophy,
  Crown,
  Medal,
  Award,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  Search,
  Filter,
  Zap,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Student } from '../types';
import { StudentAvatar } from '../components/StudentAvatar';

interface LeaderboardPageProps {
  onSelectStudent: (student: Student) => void;
  onQuickScore: (student: Student) => void;
}

export const LeaderboardPage: React.FC<LeaderboardPageProps> = ({
  onSelectStudent,
  onQuickScore,
}) => {
  const { students, config, triggerConfetti } = useApp();

  const [timeFilter, setTimeFilter] = useState<'week' | 'month' | 'semester'>('week');
  const [teamFilter, setTeamFilter] = useState<number | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Sort students by points descending
  const sortedStudents = [...students].sort((a, b) => b.points - a.points);

  // Filter based on team and search
  const filteredRanked = sortedStudents.filter((s) => {
    const matchesTeam = teamFilter === 'ALL' || s.team === teamFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q);
    return matchesTeam && matchesSearch;
  });

  // Top 3 Podium
  const top1 = sortedStudents[0];
  const top2 = sortedStudents[1];
  const top3 = sortedStudents[2];

  // Helper for rank change indicator
  const getRankTrend = (currentRank: number, prevRank?: number) => {
    if (!prevRank) return <Minus className="h-3 w-3 text-slate-400" />;
    if (prevRank > currentRank) {
      // Improved rank!
      const diff = prevRank - currentRank;
      return (
        <span className="flex items-center text-[11px] font-bold text-emerald-600 gap-0.5">
          <ArrowUp className="h-3 w-3" />
          <span>{diff}</span>
        </span>
      );
    }
    if (prevRank < currentRank) {
      // Dropped rank
      const diff = currentRank - prevRank;
      return (
        <span className="flex items-center text-[11px] font-bold text-rose-500 gap-0.5">
          <ArrowDown className="h-3 w-3" />
          <span>{diff}</span>
        </span>
      );
    }
    return <Minus className="h-3 w-3 text-slate-300" />;
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-amber-500 via-orange-500 to-red-600 p-6 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
              <Trophy className="h-3.5 w-3.5 fill-amber-200 text-amber-200" />
              <span>Đấu Trường Thi Đua</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black mt-2 tracking-tight">
              Bảng Xếp Hạng Cá Nhân
            </h2>
            <p className="text-xs sm:text-sm text-amber-100 mt-1">
              Vinh danh các cá nhân xuất sắc nỗ lực vì nề nếp và học tập của tập thể {config.className}
            </p>
          </div>

          <button
            onClick={triggerConfetti}
            className="flex items-center gap-2 rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur-md px-4 py-2 text-xs font-black text-white border border-white/30 shadow-md active:scale-95 transition-all self-start sm:self-auto cursor-pointer"
          >
            <Sparkles className="h-4 w-4 text-amber-300" />
            <span>VINH DANH TOP 1</span>
          </button>
        </div>
      </div>

      {/* GAMIFIED TOP 3 PODIUM */}
      {top1 && top2 && top3 && (
        <div className="rounded-3xl border border-slate-200 bg-linear-to-b from-slate-50 to-white p-6 shadow-sm">
          <h3 className="text-center text-xs font-bold uppercase tracking-wider text-slate-400 mb-6">
            BỤC VINH DANH TOP 3 XUẤT SẮC NHẤT
          </h3>

          <div className="grid grid-cols-3 gap-2 sm:gap-6 items-end max-w-2xl mx-auto pt-6 pb-2">
            {/* TOP 2 - BẠC (SILVER) */}
            <div
              onClick={() => onSelectStudent(top2)}
              className="flex flex-col items-center cursor-pointer group"
            >
              <div className="relative mb-2">
                <StudentAvatar
                  student={top2}
                  size="lg"
                  className="!h-16 !w-16 sm:!h-20 sm:!w-20 ring-4 ring-slate-300 shadow-lg group-hover:scale-105 transition-transform"
                />
                <div className="absolute -top-3 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-slate-300 text-slate-800 font-black text-xs shadow-md border-2 border-white">
                  2
                </div>
              </div>
              <p className="text-xs sm:text-sm font-bold text-slate-900 text-center truncate max-w-[100px] sm:max-w-[130px]">
                {top2.name}
              </p>
              <span className="text-[11px] text-slate-500 font-medium">Tổ {top2.team}</span>
              <div className="mt-1 rounded-full bg-slate-200 px-3 py-0.5 text-xs font-black text-slate-800">
                {top2.points} đ
              </div>
              {/* Podium block */}
              <div className="mt-3 w-full h-20 rounded-t-2xl bg-linear-to-b from-slate-300 to-slate-400 flex items-center justify-center text-white font-black text-lg shadow-inner">
                🥈 TOP 2
              </div>
            </div>

            {/* TOP 1 - VÀNG (GOLD) */}
            <div
              onClick={() => onSelectStudent(top1)}
              className="flex flex-col items-center cursor-pointer group -translate-y-2"
            >
              <div className="relative mb-2">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex items-center justify-center text-amber-500 animate-bounce">
                  <Crown className="h-8 w-8 fill-amber-400" />
                </div>
                <StudentAvatar
                  student={top1}
                  size="xl"
                  className="!h-20 !w-20 sm:!h-24 sm:!w-24 ring-4 ring-amber-300 shadow-xl group-hover:scale-105 transition-transform"
                />
                <div className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-br from-amber-400 to-yellow-500 text-slate-950 font-black text-sm shadow-md border-2 border-white">
                  1
                </div>
              </div>
              <p className="text-xs sm:text-base font-black text-slate-900 text-center truncate max-w-[120px] sm:max-w-[150px]">
                {top1.name}
              </p>
              <span className="text-[11px] text-amber-600 font-bold">Tổ {top1.team} • {top1.role || 'Thành viên'}</span>
              <div className="mt-1 rounded-full bg-amber-400 px-3.5 py-0.5 text-xs sm:text-sm font-black text-slate-950 shadow-xs">
                {top1.points} đ
              </div>
              {/* Podium block */}
              <div className="mt-3 w-full h-28 rounded-t-2xl bg-linear-to-b from-amber-400 to-amber-500 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg">
                🥇 TOP 1
              </div>
            </div>

            {/* TOP 3 - ĐỒNG (BRONZE) */}
            <div
              onClick={() => onSelectStudent(top3)}
              className="flex flex-col items-center cursor-pointer group"
            >
              <div className="relative mb-2">
                <StudentAvatar
                  student={top3}
                  size="lg"
                  className="!h-16 !w-16 sm:!h-20 sm:!w-20 ring-4 ring-amber-600 shadow-lg group-hover:scale-105 transition-transform"
                />
                <div className="absolute -top-3 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-amber-700 text-white font-black text-xs shadow-md border-2 border-white">
                  3
                </div>
              </div>
              <p className="text-xs sm:text-sm font-bold text-slate-900 text-center truncate max-w-[100px] sm:max-w-[130px]">
                {top3.name}
              </p>
              <span className="text-[11px] text-slate-500 font-medium">Tổ {top3.team}</span>
              <div className="mt-1 rounded-full bg-orange-100 px-3 py-0.5 text-xs font-black text-orange-900">
                {top3.points} đ
              </div>
              {/* Podium block */}
              <div className="mt-3 w-full h-16 rounded-t-2xl bg-linear-to-b from-amber-600 to-orange-700 flex items-center justify-center text-white font-black text-lg shadow-inner">
                🥉 TOP 3
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FILTERS & SEARCH ROW */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xs">
        {/* Time Tabs */}
        <div className="flex rounded-xl bg-slate-100 p-1 w-full sm:w-auto">
          {(
            [
              { id: 'week', label: 'Theo Tuần' },
              { id: 'month', label: 'Theo Tháng' },
              { id: 'semester', label: 'Cả Học Kỳ' },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setTimeFilter(t.id)}
              className={`flex-1 sm:flex-none rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                timeFilter === t.id
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Team Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {(['ALL', 1, 2, 3, 4] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTeamFilter(t)}
              className={`rounded-xl px-3 py-1 text-xs font-bold transition-all shrink-0 ${
                teamFilter === t
                  ? 'bg-red-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t === 'ALL' ? 'Tất cả 4 Tổ' : `Tổ ${t}`}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-56">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm tên trong bảng..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-red-500 focus:bg-white focus:outline-hidden"
          />
        </div>
      </div>

      {/* FULL LEADERBOARD TABLE / CARDS */}
      <div className="rounded-3xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="divide-y divide-slate-100">
          {filteredRanked.map((student) => {
            const overallRank = sortedStudents.findIndex((s) => s.id === student.id) + 1;
            const isTop3 = overallRank <= 3;

            return (
              <div
                key={student.id}
                className="flex items-center justify-between p-3.5 sm:px-6 hover:bg-slate-50/80 transition-colors group"
              >
                {/* Left: Rank & Avatar & Name */}
                <div
                  className="flex items-center gap-3 sm:gap-4 cursor-pointer flex-1 min-w-0"
                  onClick={() => onSelectStudent(student)}
                >
                  {/* Rank number & Trend */}
                  <div className="flex flex-col items-center justify-center w-8 shrink-0">
                    <span
                      className={`text-sm sm:text-base font-black ${
                        overallRank === 1
                          ? 'text-amber-500'
                          : overallRank === 2
                          ? 'text-slate-400'
                          : overallRank === 3
                          ? 'text-orange-500'
                          : 'text-slate-600'
                      }`}
                    >
                      #{overallRank}
                    </span>
                    {getRankTrend(overallRank, student.prevRank)}
                  </div>

                  {/* Avatar */}
                  <StudentAvatar student={student} size="md" />

                  {/* Name and details */}
                  <div className="truncate">
                    <div className="flex items-center gap-2">
                      <p className="text-xs sm:text-sm font-bold text-slate-900 truncate group-hover:text-red-600 transition-colors">
                        {student.name}
                      </p>
                      {student.role && student.role !== 'Thành viên' && (
                        <span className="hidden sm:inline-block rounded-md bg-amber-50 border border-amber-200 px-1.5 py-0.2 text-[10px] font-semibold text-amber-800">
                          {student.role}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                      <span>Tổ {student.team}</span>
                      <span>•</span>
                      <span className="font-mono">{student.code}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Points & Quick Score Action */}
                <div className="flex items-center gap-3 pl-3 shrink-0">
                  <div className="text-right">
                    <span
                      className={`text-sm sm:text-base font-black ${
                        student.points >= 115
                          ? 'text-emerald-600'
                          : student.points < 90
                          ? 'text-rose-600'
                          : 'text-slate-800'
                      }`}
                    >
                      {student.points} đ
                    </span>
                  </div>

                  <button
                    onClick={() => onQuickScore(student)}
                    className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-600 active:scale-90 transition-all cursor-pointer"
                    title="Chấm điểm nhanh"
                  >
                    <Zap className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
