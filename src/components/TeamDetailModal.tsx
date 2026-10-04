import React from 'react';
import { X, Trophy, Users, Award, Shield, ChevronRight, Zap } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Student } from '../types';
import { StudentAvatar } from './StudentAvatar';

interface TeamDetailModalProps {
  onQuickScore: (student: Student) => void;
}

export const TeamDetailModal: React.FC<TeamDetailModalProps> = ({ onQuickScore }) => {
  const {
    selectedTeam,
    setSelectedTeam,
    students,
    teamStats,
    setSelectedStudent,
    canScoreStudent,
    userTeam,
    addToast,
  } = useApp();

  if (selectedTeam === null) return null;

  const currentTeamStat = teamStats.find((t) => t.teamNumber === selectedTeam);
  const teamMembers = students
    .filter((s) => s.team === selectedTeam)
    .sort((a, b) => b.points - a.points);

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 2:
        return 'bg-slate-200 text-slate-800 border-slate-300';
      case 3:
        return 'bg-orange-100 text-orange-800 border-orange-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-lg rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 p-6 text-white">
          <button
            onClick={() => setSelectedTeam(null)}
            className="absolute top-4 right-4 rounded-full bg-black/20 hover:bg-black/30 p-1.5 text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex items-center justify-between">
            <div>
              <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-blue-100">
                Chi Tiết Đơn Vị Thi Đua
              </span>
              <h3 className="text-2xl font-black mt-1">
                Tổ {selectedTeam}
              </h3>
            </div>
            {currentTeamStat && (
              <div className="flex flex-col items-end">
                <span className="text-[11px] uppercase tracking-wider text-blue-200">
                  Thứ hạng lớp
                </span>
                <span className="text-2xl font-black text-amber-300">
                  Hạng #{currentTeamStat.rank}
                </span>
              </div>
            )}
          </div>

          {/* Quick stats pills */}
          <div className="mt-4 grid grid-cols-3 gap-2 rounded-2xl bg-white/10 p-3 text-center backdrop-blur-xs">
            <div>
              <p className="text-[10px] uppercase font-bold text-blue-200">Tổng điểm</p>
              <p className="text-lg font-black text-amber-300">
                {currentTeamStat?.totalPoints || 0} đ
              </p>
            </div>
            <div className="border-x border-white/20">
              <p className="text-[10px] uppercase font-bold text-blue-200">Điểm TB / Bạn</p>
              <p className="text-lg font-black text-white">
                {currentTeamStat?.avgPoints || 0} đ
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-blue-200">Sĩ số</p>
              <p className="text-lg font-black text-white">
                {teamMembers.length} HS
              </p>
            </div>
          </div>
        </div>

        {/* Member Roster List */}
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Danh sách thành viên ({teamMembers.length})
          </span>
          <span className="text-[11px] text-slate-500">Xếp theo điểm từ cao đến thấp</span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {teamMembers.map((student, idx) => (
            <div
              key={student.id}
              className="flex items-center justify-between p-3 rounded-2xl border border-slate-200 hover:border-blue-300 bg-white hover:bg-blue-50/30 transition-all shadow-2xs"
            >
              <div
                className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                onClick={() => {
                  setSelectedTeam(null);
                  setSelectedStudent(student);
                }}
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-xl text-xs font-black border ${getRankBadge(
                    idx + 1
                  )}`}
                >
                  #{idx + 1}
                </div>
                <StudentAvatar student={student} size="sm" />
                <div className="truncate">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-slate-900 truncate">
                      {student.name}
                    </p>
                    {student.role && student.role !== 'Thành viên' && (
                      <span className="rounded-md bg-amber-100 px-1.5 py-0.2 text-[10px] font-semibold text-amber-800">
                        {student.role}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    {student.code}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 pl-3">
                <span className="text-sm font-extrabold text-slate-900">
                  {student.points} đ
                </span>
                <button
                  onClick={() => {
                    if (canScoreStudent(student)) {
                      setSelectedTeam(null);
                      onQuickScore(student);
                    } else {
                      addToast(
                        'warning',
                        `Bạn là Tổ trưởng Tổ ${userTeam}, chỉ được chấm điểm cho thành viên Tổ ${userTeam}. Học sinh ${student.name} thuộc Tổ ${student.team}!`,
                        'Quyền bị giới hạn'
                      );
                    }
                  }}
                  className={`p-1.5 rounded-lg active:scale-90 transition-transform ${
                    canScoreStudent(student)
                      ? 'bg-red-50 text-red-600 hover:bg-red-100 cursor-pointer'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-40'
                  }`}
                  title={
                    canScoreStudent(student)
                      ? 'Chấm điểm nhanh'
                      : `Chỉ Tổ trưởng Tổ ${student.team} / GVCN mới được chấm`
                  }
                >
                  <Zap className="h-4 w-4 fill-current" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
