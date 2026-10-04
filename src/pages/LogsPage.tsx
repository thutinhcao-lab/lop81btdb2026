import React, { useState } from 'react';
import {
  History,
  RotateCcw,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  User,
  Trash2,
  Calendar,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ScoreLog } from '../types';

export const LogsPage: React.FC = () => {
  const { logs, revertLog, user, isTeacher, isMonitor, isTeamLeader, userTeam, canRevertLog } =
    useApp();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'plus' | 'minus'>('ALL');
  const [teamFilter, setTeamFilter] = useState<number | 'ALL'>(
    isTeamLeader && userTeam ? userTeam : 'ALL'
  );
  const [revertingLogId, setRevertingLogId] = useState<string | null>(null);

  const filteredLogs = logs.filter((log) => {
    const matchesType = typeFilter === 'ALL' || log.type === typeFilter;
    const matchesTeam = teamFilter === 'ALL' || log.team === teamFilter;
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      log.studentName.toLowerCase().includes(q) ||
      log.studentId.toLowerCase().includes(q) ||
      log.criteriaName.toLowerCase().includes(q) ||
      log.operator.toLowerCase().includes(q);
    return matchesType && matchesTeam && matchesSearch;
  });

  const handleRevert = async (log: ScoreLog) => {
    if (!canRevertLog(log)) {
      alert(`Bạn không có quyền sửa/hủy bản ghi của Tổ ${log.team}!`);
      return;
    }
    const confirmMsg = `Bạn có chắc chắn muốn HỦY THAO TÁC NÀY?\n\n- Học sinh: ${log.studentName} (${log.studentId})\n- Tổ: ${log.team}\n- Tiêu chí: ${log.criteriaName}\n- Thay đổi: ${log.pointChange > 0 ? '+' : ''}${log.pointChange} đ\n\nĐiểm của học sinh và tổ sẽ được hoàn lại ngay lập tức.`;
    if (confirm(confirmMsg)) {
      setRevertingLogId(log.id);
      await revertLog(log.id);
      setRevertingLogId(null);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-3xl bg-linear-to-r from-slate-800 to-slate-900 p-6 text-white shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
            <History className="h-3.5 w-3.5 text-slate-300" />
            <span>
              {isTeacher
                ? '👑 Chế độ Giáo viên (Toàn quyền)'
                : isMonitor
                ? '🎖️ Chế độ Lớp trưởng (Sửa điểm cả lớp)'
                : `🚩 Chế độ Tổ trưởng Tổ ${userTeam} (Sửa điểm Tổ ${userTeam})`}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black mt-2 tracking-tight">
            Lịch Sử Chấm Điểm & Sửa Điểm (Hoàn Tác)
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            {isTeacher
              ? 'Giáo viên có toàn quyền kiểm tra và sửa/hủy bất kỳ lượt chấm điểm nào trong lớp.'
              : isMonitor
              ? 'Lớp trưởng có quyền nhập và sửa/hủy phần chấm điểm thi đua của cả lớp.'
              : `Tổ trưởng chỉ có quyền nhập và sửa/hủy phần chấm điểm thi đua của học sinh Tổ ${userTeam}.`}
          </p>
        </div>

        <div className="text-right bg-white/10 p-3 rounded-2xl border border-white/10 self-start sm:self-auto">
          <p className="text-[10px] uppercase font-bold text-slate-400">Tổng số thao tác</p>
          <p className="text-xl font-black text-amber-300">{logs.length} bản ghi</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xs">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {/* Type Filter */}
          <div className="flex rounded-xl bg-slate-100 p-1">
            {(
              [
                { id: 'ALL', label: 'Tất cả' },
                { id: 'plus', label: '🟢 Việc tốt (+)' },
                { id: 'minus', label: '🔴 Vi phạm (-)' },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                onClick={() => setTypeFilter(t.id)}
                className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all shrink-0 ${
                  typeFilter === t.id
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Team Filter */}
          <select
            value={teamFilter}
            onChange={(e) =>
              setTeamFilter(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))
            }
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700"
          >
            <option value="ALL">Tất cả các Tổ</option>
            <option value={1}>Tổ 1</option>
            <option value={2}>Tổ 2</option>
            <option value={3}>Tổ 3</option>
            <option value={4}>Tổ 4</option>
          </select>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm tên học sinh, người chấm, tiêu chí..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:bg-white focus:outline-hidden"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="rounded-3xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4 sm:px-6">Thời gian</th>
                <th className="py-3 px-4">Học sinh</th>
                <th className="py-3 px-4">Tổ</th>
                <th className="py-3 px-4">Hành vi & Tiêu chí</th>
                <th className="py-3 px-4 text-center">Biến động điểm</th>
                <th className="py-3 px-4">Người thực hiện</th>
                <th className="py-3 px-4 sm:px-6 text-right">Hoàn tác (Revert)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 sm:px-6 text-slate-500 whitespace-nowrap">
                      {log.formattedDate}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                      <div>
                        <span>{log.studentName}</span>
                        <span className="ml-1.5 font-mono text-[10px] text-slate-400">
                          ({log.studentId})
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 font-bold text-slate-700">
                        Tổ {log.team}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-900">{log.criteriaName}</p>
                      {log.note && (
                        <p className="text-[11px] text-slate-500 italic mt-0.5 max-w-xs truncate">
                          "{log.note}"
                        </p>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span
                        className={`inline-block font-black text-xs px-2.5 py-1 rounded-xl ${
                          log.type === 'plus'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {log.pointChange > 0 ? `+${log.pointChange}` : log.pointChange} đ
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                      <span className="font-medium text-slate-800">{log.operator}</span>
                      <span className="text-[10px] text-slate-400 block">
                        {log.operatorRole}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap">
                      {canRevertLog(log) ? (
                        <button
                          onClick={() => handleRevert(log)}
                          disabled={revertingLogId === log.id}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 px-2.5 py-1.5 text-xs font-bold text-rose-700 transition-colors active:scale-95 cursor-pointer shadow-2xs"
                          title="Hủy thao tác và hoàn trả điểm"
                        >
                          <RotateCcw
                            className={`h-3.5 w-3.5 ${
                              revertingLogId === log.id ? 'animate-spin' : ''
                            }`}
                          />
                          <span>Hủy (Revert)</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">
                          Chỉ Tổ {log.team} / GVCN được sửa
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                    Không có nhật ký nào phù hợp với bộ lọc hiện tại.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
