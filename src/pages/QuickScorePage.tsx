import React, { useState, useEffect } from 'react';
import {
  Zap,
  Search,
  CheckCircle2,
  AlertTriangle,
  Users,
  Award,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Check,
  Filter,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Student, Criteria, CriteriaType } from '../types';
import { StudentAvatar } from '../components/StudentAvatar';

interface QuickScorePageProps {
  preselectedStudent?: Student | null;
  onClearPreselected?: () => void;
}

export const QuickScorePage: React.FC<QuickScorePageProps> = ({
  preselectedStudent,
  onClearPreselected,
}) => {
  const {
    students,
    criteria,
    quickScore,
    user,
    config,
    canScoreStudent,
    isTeacher,
    isMonitor,
    isTeamLeader,
    userTeam,
    addToast,
  } = useApp();

  // Step 1: Selected Student
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedTeamFilter, setSelectedTeamFilter] = useState<number | 'ALL'>(
    isTeamLeader && userTeam ? userTeam : 'ALL'
  );

  // Sync team filter if user changes/logs in as Team Leader
  useEffect(() => {
    if (isTeamLeader && userTeam) {
      setSelectedTeamFilter(userTeam);
      if (selectedStudent && selectedStudent.team !== userTeam) {
        setSelectedStudent(null);
      }
    }
  }, [isTeamLeader, userTeam]);

  // Step 2: Behavior Type ('plus' | 'minus')
  const [behaviorType, setBehaviorType] = useState<CriteriaType>('plus');

  // Step 3: Selected Criteria & Custom Note
  const [selectedCriteria, setSelectedCriteria] = useState<Criteria | null>(null);
  const [customNote, setCustomNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastScoredSuccess, setLastScoredSuccess] = useState<string | null>(null);

  // Apply preselected student if passed from other views
  useEffect(() => {
    if (preselectedStudent) {
      if (canScoreStudent(preselectedStudent)) {
        setSelectedStudent(preselectedStudent);
      } else {
        addToast(
          'warning',
          `Bạn đang ở chế độ Tổ trưởng Tổ ${userTeam}, chỉ được chấm điểm cho thành viên Tổ ${userTeam}. Học sinh ${preselectedStudent.name} thuộc Tổ ${preselectedStudent.team}!`,
          'Giới hạn phân quyền'
        );
      }
      if (onClearPreselected) onClearPreselected();
    }
  }, [preselectedStudent, onClearPreselected, canScoreStudent, userTeam, addToast]);

  // Filter students based on search and team
  const filteredStudents = students.filter((s) => {
    // If team leader, strictly limit to their team
    if (isTeamLeader && userTeam && s.team !== userTeam) {
      return false;
    }
    const matchesTeam = selectedTeamFilter === 'ALL' || s.team === selectedTeamFilter;
    const q = studentSearch.toLowerCase().trim();
    const matchesSearch =
      !q ||
      s.name.toLowerCase().includes(q) ||
      s.code.toLowerCase().includes(q) ||
      `tổ ${s.team}`.includes(q);
    return matchesTeam && matchesSearch;
  });

  // Filter criteria based on behaviorType
  const filteredCriteria = criteria.filter((c) => c.type === behaviorType);

  const handleSaveScore = async () => {
    if (!selectedStudent || !selectedCriteria) return;

    setIsSubmitting(true);
    const success = await quickScore(
      selectedStudent.id,
      selectedCriteria.id,
      customNote.trim() || undefined
    );

    setIsSubmitting(false);

    if (success) {
      setLastScoredSuccess(
        `${behaviorType === 'plus' ? 'Cộng' : 'Trừ'} ${selectedCriteria.points} điểm cho ${selectedStudent.name}`
      );
      // Reset criteria selection and note for next entry, keep or clear student
      setSelectedCriteria(null);
      setCustomNote('');

      // Auto-hide success pill after 4 seconds
      setTimeout(() => {
        setLastScoredSuccess(null);
      }, 4000);
    }
  };

  const handleResetForm = () => {
    setSelectedStudent(null);
    setSelectedCriteria(null);
    setCustomNote('');
    setStudentSearch('');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-red-600 via-rose-600 to-amber-600 p-6 text-white shadow-xl">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
              <Zap className="h-3.5 w-3.5 fill-amber-300 text-amber-300" />
              <span>
                {isTeacher
                  ? '👑 Chế độ Giáo viên (Toàn quyền cả lớp)'
                  : isMonitor
                  ? '🎖️ Chế độ Lớp trưởng (Chấm điểm cả lớp)'
                  : `🚩 Chế độ Tổ trưởng Tổ ${userTeam} (Chỉ chấm điểm Tổ ${userTeam})`}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black mt-2 tracking-tight">
              {isTeamLeader
                ? `Chấm Điểm Thi Đua Tổ ${userTeam}`
                : 'Chấm Điểm Cờ Đỏ & Nề Nếp Cả Lớp'}
            </h2>
            <p className="text-xs sm:text-sm text-rose-100 mt-1 max-w-xl">
              {isTeacher
                ? 'Giáo viên có toàn quyền cộng điểm việc tốt hoặc trừ điểm vi phạm cho mọi học sinh.'
                : isMonitor
                ? 'Lớp trưởng được quyền nhập và sửa phần chấm điểm thi đua cho tất cả các tổ.'
                : `Tổ trưởng chỉ nhập và sửa phần chấm điểm thi đua của các thành viên trong Tổ ${userTeam}.`}
            </p>
          </div>

          <div className="flex items-center gap-2 bg-black/20 rounded-2xl p-3 backdrop-blur-md border border-white/10 self-start sm:self-auto">
            <div className="text-right">
              <p className="text-[10px] uppercase font-bold text-rose-200">
                {isTeacher ? 'GVCN' : isMonitor ? 'Lớp trưởng' : `Tổ trưởng T${userTeam}`}
              </p>
              <p className="text-xs font-bold text-white truncate max-w-[150px]">
                {user ? user.name : 'Giáo viên'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Success banner if just scored */}
      {lastScoredSuccess && (
        <div className="flex items-center justify-between rounded-2xl bg-emerald-50 border-2 border-emerald-300 p-4 text-emerald-900 shadow-sm animate-in zoom-in-95 duration-150">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600 text-white">
              <Check className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                Thành công
              </p>
              <p className="text-sm font-bold text-emerald-950">{lastScoredSuccess}</p>
            </div>
          </div>
          <button
            onClick={handleResetForm}
            className="flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-900 bg-white px-3 py-1.5 rounded-xl border border-emerald-200 shadow-2xs"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Chấm bạn khác</span>
          </button>
        </div>
      )}

      {/* 3-STEP QUICK SCORING WORKFLOW */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* LEFT COLUMN: STEP 1 - CHỌN HỌC SINH (5 cols) */}
        <div className="md:col-span-5 flex flex-col rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                1
              </span>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Chọn Học Sinh
              </h3>
            </div>
            {selectedStudent && (
              <button
                onClick={() => setSelectedStudent(null)}
                className="text-xs text-rose-600 hover:underline font-semibold"
              >
                Đổi bạn khác
              </button>
            )}
          </div>

          {/* If Student Selected, show Selected Student Card */}
          {selectedStudent ? (
            <div className="mt-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-4 text-white shadow-md">
              <div className="flex items-center gap-3">
                <StudentAvatar
                  student={selectedStudent}
                  size="md"
                  className="shadow-sm ring-2 ring-white/20"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-black truncate">{selectedStudent.name}</h4>
                    <span className="rounded-md bg-white/20 px-1.5 py-0.5 text-[10px] font-mono">
                      {selectedStudent.code}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Tổ {selectedStudent.team} • {selectedStudent.role || 'Thành viên'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Điểm hiện tại</p>
                  <p className="text-lg font-black text-amber-300">{selectedStudent.points} đ</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-3 flex flex-col flex-1">
              {/* Search input */}
              <div className="relative mb-3">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Gõ tên hoặc mã HS..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-red-500 focus:bg-white focus:outline-hidden"
                />
              </div>

              {/* Team Filter Pills */}
              <div className="mb-3">
                {isTeamLeader && userTeam ? (
                  <div className="flex items-center justify-between rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-xs text-emerald-900 font-bold">
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Chế độ Tổ trưởng: Cố định Tổ {userTeam}</span>
                    </span>
                    <span className="text-[10px] uppercase bg-white border border-emerald-300 px-1.5 py-0.5 rounded-md">
                      Tổ {userTeam}
                    </span>
                  </div>
                ) : (
                  <div className="flex gap-1.5 overflow-x-auto pb-1">
                    {(['ALL', 1, 2, 3, 4] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setSelectedTeamFilter(t)}
                        className={`rounded-xl px-2.5 py-1 text-xs font-bold shrink-0 transition-all ${
                          selectedTeamFilter === t
                            ? 'bg-red-600 text-white shadow-2xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {t === 'ALL' ? 'Tất cả 4 Tổ' : `Tổ ${t}`}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Student Scrollable List */}
              <div className="flex-1 max-h-72 overflow-y-auto space-y-1.5 pr-1">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((s) => (
                    <div
                      key={s.id}
                      onClick={() => setSelectedStudent(s)}
                      className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 hover:border-red-400 hover:bg-red-50/40 cursor-pointer transition-all active:scale-[0.98]"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <StudentAvatar student={s} size="xs" />
                        <div className="truncate">
                          <p className="text-xs font-bold text-slate-900 truncate">{s.name}</p>
                          <span className="text-[10px] text-slate-500">
                            Tổ {s.team} • {s.code}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-extrabold text-slate-700 shrink-0 pl-2">
                        {s.points} đ
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="py-6 text-center text-xs text-slate-400">
                    Không tìm thấy học sinh nào.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: STEP 2 & 3 - CHỌN HÀNH VI & TIÊU CHÍ (7 cols) */}
        <div className="md:col-span-7 flex flex-col rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-5">
          {/* STEP 2: BEHAVIOR TYPE */}
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                2
              </span>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Chọn Loại Hành Vi
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-3">
              {/* Green Button */}
              <button
                type="button"
                onClick={() => {
                  setBehaviorType('plus');
                  setSelectedCriteria(null);
                }}
                className={`flex flex-col items-center justify-center gap-1.5 p-4 rounded-2xl border-2 font-bold transition-all active:scale-95 cursor-pointer ${
                  behaviorType === 'plus'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-950 shadow-md ring-2 ring-emerald-400/30'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-emerald-300 hover:bg-emerald-50/40'
                }`}
              >
                <div className="flex items-center gap-1.5 text-base sm:text-lg text-emerald-600">
                  <CheckCircle2 className="h-5 w-5" />
                  <span>VIỆC TỐT</span>
                </div>
                <span className="text-xs text-emerald-700 font-semibold">(Cộng điểm +)</span>
              </button>

              {/* Red Button */}
              <button
                type="button"
                onClick={() => {
                  setBehaviorType('minus');
                  setSelectedCriteria(null);
                }}
                className={`flex flex-col items-center justify-center gap-1.5 p-4 rounded-2xl border-2 font-bold transition-all active:scale-95 cursor-pointer ${
                  behaviorType === 'minus'
                    ? 'border-rose-500 bg-rose-50 text-rose-950 shadow-md ring-2 ring-rose-400/30'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-rose-300 hover:bg-rose-50/40'
                }`}
              >
                <div className="flex items-center gap-1.5 text-base sm:text-lg text-rose-600">
                  <AlertTriangle className="h-5 w-5" />
                  <span>VI PHẠM</span>
                </div>
                <span className="text-xs text-rose-700 font-semibold">(Trừ điểm -)</span>
              </button>
            </div>
          </div>

          {/* STEP 3: SELECT CRITERIA */}
          <div className="flex-1 flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                  3
                </span>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Chọn Tiêu Chí ({behaviorType === 'plus' ? 'Việc Tốt' : 'Lỗi Vi Phạm'})
                </h3>
              </div>
              <span className="text-xs font-medium text-slate-400">
                {filteredCriteria.length} tiêu chí
              </span>
            </div>

            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
              {filteredCriteria.map((c) => {
                const isSelected = selectedCriteria?.id === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCriteria(c)}
                    className={`flex items-start justify-between p-3 rounded-2xl border-2 cursor-pointer transition-all active:scale-[0.98] ${
                      isSelected
                        ? behaviorType === 'plus'
                          ? 'border-emerald-600 bg-emerald-100/60 shadow-sm'
                          : 'border-rose-600 bg-rose-100/60 shadow-sm'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex-1 min-w-0 pr-2">
                      <p className="text-xs font-bold text-slate-900 leading-tight">
                        {c.name}
                      </p>
                      <span className="text-[10px] text-slate-500 mt-1 block">
                        {c.category}
                      </span>
                    </div>
                    <span
                      className={`text-xs font-black px-2 py-0.5 rounded-lg shrink-0 ${
                        c.type === 'plus'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-rose-600 text-white'
                      }`}
                    >
                      {c.type === 'plus' ? `+${c.points}` : `-${c.points}`}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Custom Note Optional */}
            <div className="mt-4">
              <input
                type="text"
                placeholder="Ghi chú chi tiết thêm (Ví dụ: tiết 2 môn Toán, 07:15 sáng...)"
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-red-500 focus:bg-white focus:outline-hidden"
              />
            </div>

            {/* BIG SAVE BUTTON */}
            <div className="pt-4">
              <button
                type="button"
                onClick={handleSaveScore}
                disabled={!selectedStudent || !selectedCriteria || isSubmitting}
                className={`w-full flex items-center justify-center gap-2 rounded-2xl py-3.5 px-6 font-black text-sm tracking-wide shadow-lg transition-all active:scale-95 cursor-pointer ${
                  !selectedStudent || !selectedCriteria
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                    : behaviorType === 'plus'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-emerald-500/25 hover:brightness-105'
                    : 'bg-gradient-to-r from-red-600 to-rose-700 text-white shadow-red-500/25 hover:brightness-105'
                }`}
              >
                <Zap className="h-5 w-5 fill-current" />
                <span>
                  {!selectedStudent
                    ? 'VUI LÒNG CHỌN HỌC SINH (BƯỚC 1)'
                    : !selectedCriteria
                    ? 'VUI LÒNG CHỌN TIÊU CHÍ (BƯỚC 3)'
                    : isSubmitting
                    ? 'ĐANG LƯU VÀO HỆ THỐNG...'
                    : `XÁC NHẬN: ${behaviorType === 'plus' ? 'CỘNG' : 'TRỪ'} ${
                        selectedCriteria.points
                      } ĐIỂM CHO ${selectedStudent.name.toUpperCase()}`}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
