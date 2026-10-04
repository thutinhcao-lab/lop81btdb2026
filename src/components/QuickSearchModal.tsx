import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Zap, Award, ChevronRight, User } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Student } from '../types';

interface QuickSearchModalProps {
  onOpenQuickScoreForStudent: (student: Student) => void;
}

export const QuickSearchModal: React.FC<QuickSearchModalProps> = ({
  onOpenQuickScoreForStudent,
}) => {
  const {
    isQuickSearchOpen,
    setIsQuickSearchOpen,
    students,
    setSelectedStudent,
    canScoreStudent,
    userTeam,
    addToast,
  } = useApp();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isQuickSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isQuickSearchOpen]);

  // Keyboard shortcut Ctrl+K or Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsQuickSearchOpen(!isQuickSearchOpen);
      }
      if (e.key === 'Escape' && isQuickSearchOpen) {
        setIsQuickSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isQuickSearchOpen, setIsQuickSearchOpen]);

  if (!isQuickSearchOpen) return null;

  const filteredStudents = students.filter((s) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      s.name.toLowerCase().includes(q) ||
      s.code.toLowerCase().includes(q) ||
      `tổ ${s.team}`.includes(q) ||
      `to ${s.team}`.includes(q) ||
      (s.role && s.role.toLowerCase().includes(q))
    );
  }).slice(0, 8); // Top 8 matches

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 sm:pt-24 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="relative flex items-center border-b border-slate-200 px-4 py-3 bg-slate-50/50">
          <Search className="h-5 w-5 text-slate-400 shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Tìm theo tên học sinh, mã HS (HS01), hoặc số Tổ..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-hidden"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 mr-1"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={() => setIsQuickSearchOpen(false)}
            className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-100"
          >
            Đóng [ESC]
          </button>
        </div>

        {/* Results list */}
        <div className="max-h-96 overflow-y-auto p-2 divide-y divide-slate-100">
          {filteredStudents.length > 0 ? (
            filteredStudents.map((student) => (
              <div
                key={student.id}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors group"
              >
                <div
                  className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                  onClick={() => {
                    setSelectedStudent(student);
                    setIsQuickSearchOpen(false);
                  }}
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold text-white text-xs ${
                      student.gender === 'nu'
                        ? 'bg-gradient-to-tr from-pink-500 to-rose-400'
                        : 'bg-gradient-to-tr from-blue-600 to-indigo-500'
                    }`}
                  >
                    {student.name.split(' ').slice(-1)[0].charAt(0)}
                  </div>
                  <div className="truncate">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-slate-900 truncate group-hover:text-red-600 transition-colors">
                        {student.name}
                      </p>
                      <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-mono text-slate-600">
                        {student.code}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                      <span>Tổ {student.team}</span>
                      <span>•</span>
                      <span className="text-slate-600 font-medium">{student.role || 'Thành viên'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 pl-3">
                  <div className="text-right">
                    <span
                      className={`inline-block font-extrabold text-sm ${
                        student.points >= 110
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
                    onClick={() => {
                      if (canScoreStudent(student)) {
                        setIsQuickSearchOpen(false);
                        onOpenQuickScoreForStudent(student);
                      } else {
                        addToast(
                          'warning',
                          `Bạn là Tổ trưởng Tổ ${userTeam}, chỉ được chấm điểm cho thành viên Tổ ${userTeam}. Học sinh ${student.name} thuộc Tổ ${student.team}!`,
                          'Quyền bị giới hạn'
                        );
                      }
                    }}
                    className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold shadow-xs active:scale-95 transition-all ${
                      canScoreStudent(student)
                        ? 'bg-red-600 hover:bg-red-700 text-white cursor-pointer'
                        : 'bg-slate-200 text-slate-500 cursor-not-allowed opacity-60'
                    }`}
                    title={
                      canScoreStudent(student)
                        ? 'Chấm điểm'
                        : `Chỉ Tổ trưởng Tổ ${student.team} / GVCN mới được chấm`
                    }
                  >
                    <Zap className="h-3.5 w-3.5 fill-current" />
                    <span>Chấm điểm</span>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-sm text-slate-400">
              Không tìm thấy học sinh nào khớp với "{query}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
