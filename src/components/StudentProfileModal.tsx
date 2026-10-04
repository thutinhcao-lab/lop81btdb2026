import React, { useState } from 'react';
import {
  X,
  Award,
  TrendingUp,
  TrendingDown,
  Clock,
  UserCheck,
  Zap,
  Shield,
  Calendar,
  AlertCircle,
  Pencil,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Student } from '../types';
import { StudentAvatar } from './StudentAvatar';
import { AvatarUploadModal } from './AvatarUploadModal';

interface StudentProfileModalProps {
  onQuickScore: (student: Student) => void;
}

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
  onQuickScore,
}) => {
  const {
    selectedStudent,
    setSelectedStudent,
    students,
    updateStudent,
    logs,
    config,
    user,
    addToast,
    canScoreStudent,
    userTeam,
  } = useApp();
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

  if (!selectedStudent) return null;

  // Recalculate rank dynamically
  const sortedStudents = [...students].sort((a, b) => b.points - a.points);
  const currentRank = sortedStudents.findIndex((s) => s.id === selectedStudent.id) + 1;

  // Filter logs for this specific student
  const studentLogs = logs.filter(
    (l) => l.studentId === selectedStudent.code || l.studentId === selectedStudent.id
  );

  const plusPointsCount = studentLogs
    .filter((l) => l.type === 'plus')
    .reduce((sum, l) => sum + Math.abs(l.pointChange), 0);
  const minusPointsCount = studentLogs
    .filter((l) => l.type === 'minus')
    .reduce((sum, l) => sum + Math.abs(l.pointChange), 0);

  // Progress towards 150 points goal
  const progressPercent = Math.min(Math.max((selectedStudent.points / 150) * 100, 5), 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-lg rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Cover */}
        <div className="relative bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 p-6 text-white">
          <button
            onClick={() => setSelectedStudent(null)}
            className="absolute top-4 right-4 rounded-full bg-black/20 hover:bg-black/30 p-1.5 text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-4">
            <StudentAvatar
              student={selectedStudent}
              size="lg"
              showEditButton={true}
              onEditClick={() => setIsAvatarModalOpen(true)}
              className="ring-4 ring-white/30 shadow-lg"
              title={`Ảnh đại diện của ${selectedStudent.name} • Bấm nút bút để đổi`}
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-extrabold tracking-tight">
                  {selectedStudent.name}
                </h3>
                <span className="rounded-md bg-white/20 px-2 py-0.5 text-xs font-mono font-bold">
                  {selectedStudent.code}
                </span>
              </div>
              <p className="text-xs text-rose-100 mt-0.5">
                Tổ {selectedStudent.team} • {selectedStudent.role || 'Thành viên'} • {config.className}
              </p>
            </div>
          </div>

          {/* Quick stats row */}
          <div className="mt-5 grid grid-cols-3 gap-2 rounded-2xl bg-white/10 p-3 text-center backdrop-blur-sm">
            <div>
              <p className="text-[10px] uppercase font-bold text-rose-100 tracking-wider">
                Điểm số
              </p>
              <p className="text-xl font-black text-amber-300">
                {selectedStudent.points} <span className="text-xs font-normal">đ</span>
              </p>
            </div>
            <div className="border-x border-white/20">
              <p className="text-[10px] uppercase font-bold text-rose-100 tracking-wider">
                Xếp hạng
              </p>
              <p className="text-xl font-black text-white">
                #{currentRank} <span className="text-xs font-normal">/{students.length}</span>
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-rose-100 tracking-wider">
                Khen/Phạt
              </p>
              <p className="text-xs font-bold text-white mt-1">
                <span className="text-emerald-300">+{plusPointsCount}</span> /{' '}
                <span className="text-rose-200">-{minusPointsCount}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Action Button & Target Goal Bar */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-semibold text-slate-700">Mục tiêu thi đua: 150 điểm</span>
            <span className="font-bold text-red-600">{Math.round(progressPercent)}%</span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-slate-200 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 via-rose-500 to-red-600 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="mt-4 flex gap-3">
            <button
              onClick={() => {
                if (canScoreStudent(selectedStudent)) {
                  const s = selectedStudent;
                  setSelectedStudent(null);
                  onQuickScore(s);
                } else {
                  addToast(
                    'warning',
                    `Bạn là Tổ trưởng Tổ ${userTeam}, chỉ được chấm điểm cho thành viên Tổ ${userTeam}. Học sinh ${selectedStudent.name} thuộc Tổ ${selectedStudent.team}!`,
                    'Quyền bị giới hạn'
                  );
                }
              }}
              className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 px-4 text-xs font-bold transition-all ${
                canScoreStudent(selectedStudent)
                  ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md shadow-red-500/20 hover:brightness-105 active:scale-95 cursor-pointer'
                  : 'bg-slate-200 text-slate-500 cursor-not-allowed opacity-80'
              }`}
            >
              <Zap className="h-4 w-4 fill-current" />
              <span>
                {canScoreStudent(selectedStudent)
                  ? 'Chấm Điểm Cho Học Sinh Này'
                  : `Chỉ Tổ Trưởng Tổ ${selectedStudent.team} / Lớp Trưởng / GVCN Mới Được Chấm`}
              </span>
            </button>
          </div>
        </div>

        {/* Score History Timeline */}
        <div className="flex-1 overflow-y-auto p-5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-slate-400" />
            Lịch sử khen thưởng & vi phạm cá nhân
          </h4>

          {studentLogs.length > 0 ? (
            <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {studentLogs.map((log) => (
                <div key={log.id} className="relative group">
                  <div
                    className={`absolute -left-6 top-1.5 flex h-4 w-4 items-center justify-center rounded-full ring-4 ring-white ${
                      log.type === 'plus'
                        ? 'bg-emerald-500 text-white'
                        : 'bg-rose-500 text-white'
                    }`}
                  >
                    <span className="text-[9px] font-black">{log.type === 'plus' ? '+' : '-'}</span>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs hover:border-slate-300 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-bold text-slate-900 leading-tight">
                        {log.criteriaName}
                      </p>
                      <span
                        className={`text-xs font-extrabold whitespace-nowrap px-2 py-0.5 rounded-md ${
                          log.type === 'plus'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {log.pointChange > 0 ? `+${log.pointChange}` : log.pointChange} đ
                      </span>
                    </div>

                    {log.note && (
                      <p className="mt-1 text-xs text-slate-600 bg-slate-50 rounded-lg p-1.5 italic">
                        "{log.note}"
                      </p>
                    )}

                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <UserCheck className="h-3 w-3" />
                        {log.operator} ({log.operatorRole})
                      </span>
                      <span>{log.formattedDate}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-slate-400 text-xs">
              Chưa có ghi nhận khen thưởng hoặc vi phạm nào trong tuần này.
            </div>
          )}
        </div>
      </div>

      {/* Avatar Upload Modal */}
      <AvatarUploadModal
        student={selectedStudent}
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        onSaveAvatar={(newAvatarUrl) => {
          if (!selectedStudent) return;
          const updated = {
            ...selectedStudent,
            avatar: newAvatarUrl,
          };
          updateStudent(updated);
          setSelectedStudent(updated);
          if (newAvatarUrl) {
            addToast('success', `Đã cập nhật ảnh đại diện mới cho học sinh ${selectedStudent.name}!`);
          } else {
            addToast('info', `Đã đặt lại ảnh đại diện mặc định cho học sinh ${selectedStudent.name}.`);
          }
        }}
      />
    </div>
  );
};
