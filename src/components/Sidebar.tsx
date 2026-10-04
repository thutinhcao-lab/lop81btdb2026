import React from 'react';
import {
  LayoutDashboard,
  Trophy,
  Zap,
  Users,
  ClipboardList,
  FileBarChart,
  History,
  Settings,
  X,
  Flame,
  Award,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ClassLogo } from './ClassLogo';

export type TabType =
  | 'dashboard'
  | 'leaderboard'
  | 'quick-score'
  | 'students'
  | 'criteria'
  | 'report'
  | 'logs'
  | 'settings';

interface SidebarProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpen,
  onClose,
}) => {
  const { config, user, students, logs, isTeacher, isMonitor, isTeamLeader, userTeam } =
    useApp();

  const navItems: {
    id: TabType;
    label: string;
    icon: React.ReactNode;
    badge?: string | number;
    hot?: boolean;
  }[] = [
    {
      id: 'dashboard',
      label: 'Tổng quan',
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      id: 'leaderboard',
      label: 'Bảng Xếp Hạng',
      icon: <Trophy className="h-5 w-5 text-amber-500" />,
      hot: true,
    },
    {
      id: 'quick-score',
      label: isTeamLeader && userTeam ? `Chấm Điểm Tổ ${userTeam}` : 'Chấm Điểm Nhanh',
      icon: <Zap className="h-5 w-5 text-red-500" />,
      badge: 'HOT',
    },
    {
      id: 'students',
      label: isTeamLeader && userTeam ? `Học Sinh (Tổ ${userTeam})` : 'Danh sách Học sinh',
      icon: <Users className="h-5 w-5 text-blue-500" />,
      badge: isTeamLeader && userTeam
        ? students.filter((s) => s.team === userTeam).length
        : students.length,
    },
    {
      id: 'criteria',
      label: 'Tiêu chí Thi đua',
      icon: <ClipboardList className="h-5 w-5 text-emerald-500" />,
    },
    {
      id: 'report',
      label: 'Báo cáo Sinh hoạt',
      icon: <FileBarChart className="h-5 w-5 text-indigo-500" />,
    },
    {
      id: 'logs',
      label: isTeamLeader && userTeam ? `Lịch sử (Tổ ${userTeam})` : 'Lịch sử Chấm điểm',
      icon: <History className="h-5 w-5 text-slate-500" />,
      badge: logs.length > 0 ? logs.length : undefined,
    },
    {
      id: 'settings',
      label: 'Cài đặt & Dữ liệu',
      icon: <Settings className="h-5 w-5 text-slate-400" />,
    },
  ];

  const handleSelect = (tab: TabType) => {
    onSelectTab(tab);
    onClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs transition-opacity lg:hidden"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-68 flex-col justify-between border-r border-slate-200/80 bg-white/92 backdrop-blur-md transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Mobile Header in Drawer */}
          <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5 lg:hidden">
            <div className="flex items-center gap-2.5">
              <ClassLogo size="sm" showBadge={false} />
              <span className="font-bold text-slate-800">{config.className}</span>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Desktop Branding Banner */}
          <div className="hidden lg:flex flex-col border-b border-slate-100 p-5">
            <div className="flex items-center gap-3">
              <ClassLogo size="lg" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                  Nề Nếp Thi Đua
                </p>
                <h2 className="text-base font-extrabold text-slate-900">
                  {config.className}
                </h2>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-xs">
              <span className="text-slate-500">{config.schoolYear}</span>
              <span className="font-semibold text-slate-800">{config.semester}</span>
            </div>
          </div>

          {/* Quick Score Highlight Action Button */}
          <div className="px-3 pt-4 pb-2">
            <button
              onClick={() => handleSelect('quick-score')}
              className={`flex w-full items-center justify-center gap-2 rounded-xl py-2.5 px-4 font-bold text-sm shadow-md transition-all active:scale-95 cursor-pointer ${
                currentTab === 'quick-score'
                  ? 'bg-linear-to-r from-red-600 to-rose-600 text-white shadow-red-500/30'
                  : 'bg-linear-to-r from-red-500 to-rose-600 text-white hover:brightness-105 shadow-red-500/20'
              }`}
            >
              <Zap className="h-4 w-4 fill-white" />
              <span>
                {isTeamLeader && userTeam
                  ? `CHẤM ĐIỂM TỔ ${userTeam}`
                  : 'CHẤM ĐIỂM NHANH'}
              </span>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 px-3 py-2">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-red-50 text-red-700 shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={isActive ? 'text-red-600' : 'text-slate-500'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        item.badge === 'HOT'
                          ? 'bg-red-600 text-white'
                          : isActive
                          ? 'bg-red-200 text-red-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer info in Sidebar */}
        <div className="border-t border-slate-100 p-4">
          <div className="rounded-xl bg-linear-to-br from-slate-900 to-slate-800 p-3.5 text-white shadow-xs">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-400">
                <Flame className="h-3.5 w-3.5 fill-amber-400" /> Tuần thi đua {config.currentWeek}
              </span>
              <span className="rounded-sm bg-white/20 px-1.5 py-0.5 text-[10px]">
                {config.semester}
              </span>
            </div>
            <p className="mt-1.5 text-[11px] text-slate-300">
              {user ? `Người trực: ${user.name}` : 'Chưa đăng nhập'}
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
