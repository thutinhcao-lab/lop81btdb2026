import React from 'react';
import {
  Menu,
  Search,
  Volume2,
  VolumeX,
  RefreshCw,
  Sparkles,
  User as UserIcon,
  LogOut,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Database,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ClassLogo } from './ClassLogo';

interface NavbarProps {
  onToggleSidebar: () => void;
  onOpenLoginModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, onOpenLoginModal }) => {
  const {
    config,
    updateConfig,
    user,
    logout,
    syncStatus,
    isSyncing,
    syncFromSheets,
    setIsQuickSearchOpen,
    triggerConfetti,
    lastSyncTime,
  } = useApp();

  const getRoleLabel = () => {
    if (!user) return 'Chưa đăng nhập';
    switch (user.role) {
      case 'TEACHER':
        return 'Giáo viên CN (Toàn quyền)';
      case 'MONITOR':
        return 'Lớp trưởng (Cả lớp)';
      case 'TEAM_LEADER':
        return `Tổ trưởng Tổ ${user.team || 1}`;
      case 'RED_FLAG':
        return 'Đội cờ đỏ';
      default:
        return 'Thành viên';
    }
  };

  const getRoleBadgeColor = () => {
    if (!user) return 'bg-slate-100 text-slate-600 border-slate-200';
    switch (user.role) {
      case 'TEACHER':
        return 'bg-red-50 text-red-700 border-red-300';
      case 'MONITOR':
        return 'bg-blue-50 text-blue-700 border-blue-300';
      case 'TEAM_LEADER':
        if (user.team === 1) return 'bg-emerald-50 text-emerald-800 border-emerald-300';
        if (user.team === 2) return 'bg-teal-50 text-teal-800 border-teal-300';
        if (user.team === 3) return 'bg-amber-50 text-amber-800 border-amber-300';
        return 'bg-purple-50 text-purple-800 border-purple-300';
      case 'RED_FLAG':
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-md transition-all sm:px-6 shadow-xs">
      {/* Left: Mobile hamburger & Class Branding */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 focus:outline-hidden lg:hidden active:scale-95 transition-transform"
          aria-label="Mở menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <ClassLogo size="md" showBadge={false} />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold tracking-tight text-slate-900 sm:text-lg">
                {config.className}
              </h1>
              <span className="hidden rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-semibold text-red-700 sm:inline-block">
                Tuần {config.currentWeek}
              </span>
            </div>
            <p className="hidden text-[11px] text-slate-500 sm:block">
              Sổ tay thi đua & nề nếp thông minh
            </p>
          </div>
        </div>
      </div>

      {/* Middle: Global Quick Search Button */}
      <div className="hidden md:flex flex-1 max-w-md mx-6">
        <button
          onClick={() => setIsQuickSearchOpen(true)}
          className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-1.5 text-xs text-slate-500 hover:border-slate-300 hover:bg-slate-100/80 transition-all cursor-pointer shadow-2xs"
        >
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-slate-400" />
            <span>Tìm nhanh học sinh hoặc tiêu chí...</span>
          </div>
          <kbd className="rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-slate-400">
            Ctrl K
          </kbd>
        </button>
      </div>

      {/* Right Action Icons & User Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Mobile Search Icon */}
        <button
          onClick={() => setIsQuickSearchOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 active:scale-95 md:hidden"
          title="Tìm kiếm nhanh"
        >
          <Search className="h-4 w-4" />
        </button>

        {/* Confetti Celebration Button */}
        <button
          onClick={triggerConfetti}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-amber-500 hover:bg-amber-50 active:scale-90 transition-all"
          title="Bắn pháo hoa tuyên dương!"
        >
          <Sparkles className="h-4.5 w-4.5" />
        </button>

        {/* Sound Toggle */}
        <button
          onClick={() => updateConfig({ soundEnabled: !config.soundEnabled })}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 active:scale-95 transition-all"
          title={config.soundEnabled ? 'Tắt âm thanh hiệu ứng' : 'Bật âm thanh hiệu ứng'}
        >
          {config.soundEnabled ? (
            <Volume2 className="h-4.5 w-4.5 text-slate-700" />
          ) : (
            <VolumeX className="h-4.5 w-4.5 text-slate-400" />
          )}
        </button>

        {/* Google Sheets Sync Indicator & Button */}
        <button
          onClick={() => {
            if (config.googleSheetScriptUrl) {
              syncFromSheets();
            }
          }}
          disabled={isSyncing}
          className={`hidden sm:flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all ${
            syncStatus === 'synced'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              : syncStatus === 'error'
              ? 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
              : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
          }`}
          title={
            config.googleSheetScriptUrl
              ? `Google Sheets: ${syncStatus}. Bấm để đồng bộ dữ liệu. Lần cuối: ${lastSyncTime || 'chưa'}`
              : 'Chưa liên kết Google Sheets (Vào Cài đặt)'
          }
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin text-blue-600' : ''}`}
          />
          <span className="hidden lg:inline">
            {config.googleSheetScriptUrl
              ? isSyncing
                ? 'Đang đồng bộ...'
                : 'Đã nối Sheets'
              : 'Nội bộ (Offline)'}
          </span>
        </button>

        {/* User Role Badge / Switch */}
        {user ? (
          <div className="flex items-center gap-1.5 pl-1 border-l border-slate-200">
            <div
              onClick={onOpenLoginModal}
              className={`flex cursor-pointer items-center gap-2 rounded-xl border px-2.5 py-1 text-xs font-medium transition-all hover:shadow-2xs ${getRoleBadgeColor()}`}
              title="Nhấn để đổi vai trò đăng nhập"
            >
              <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
              <div className="hidden sm:block text-left">
                <p className="font-semibold leading-tight">{user.name}</p>
                <p className="text-[10px] opacity-80">{getRoleLabel()}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-rose-600 transition-colors"
              title="Đăng xuất"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenLoginModal}
            className="flex items-center gap-1.5 rounded-xl bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 active:scale-95 shadow-xs"
          >
            <UserIcon className="h-3.5 w-3.5" />
            <span>Đăng nhập</span>
          </button>
        )}
      </div>
    </header>
  );
};
