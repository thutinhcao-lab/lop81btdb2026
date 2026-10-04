import React, { useState } from 'react';
import {
  X,
  Volume2,
  VolumeX,
  Upload,
  Lock,
  KeyRound,
  Music,
  Youtube,
  User,
  Eye,
  EyeOff,
  Crown,
  Award,
  Users,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { LoginModeId } from '../types';
import { ClassLogo } from './ClassLogo';
import { LoginBackgroundMusic } from './LoginBackgroundMusic';
import { YouTubeModal } from './YouTubeModal';
import { useBackgroundMusic } from '../context/BackgroundMusicContext';
import { AUTH_ACCOUNTS, findAccountByMode } from '../data/authAccounts';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { login, config, user } = useApp();
  const [selectedMode, setSelectedMode] = useState<LoginModeId>(
    user?.modeId || 'TEACHER'
  );
  const [username, setUsername] = useState('giaovien');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isYouTubeModalOpen, setIsYouTubeModalOpen] = useState(false);

  // Background music context
  const {
    musicInfo,
    isPlaying,
    togglePlay,
    openUploadDialog,
    isUploading,
  } = useBackgroundMusic();

  if (!isOpen) return null;

  const currentAccount = findAccountByMode(selectedMode) || AUTH_ACCOUNTS[0];

  const handleSelectMode = (mode: LoginModeId) => {
    setSelectedMode(mode);
    const acc = findAccountByMode(mode);
    if (acc) {
      setUsername(acc.defaultUsername);
    }
    setErrorMsg('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!password) {
      setErrorMsg('Vui lòng nhập mật khẩu để đăng nhập.');
      return;
    }

    const res = login(selectedMode, password, username);
    if (res.success) {
      setPassword('');
      setErrorMsg('');
      onClose();
    } else {
      setErrorMsg(res.message);
    }
  };

  const hasMusic = !!musicInfo.musicUrl;

  const getModeIcon = (iconType: string) => {
    switch (iconType) {
      case 'crown':
        return <Crown className="h-4 w-4 text-amber-500 fill-amber-400" />;
      case 'monitor':
        return <Award className="h-4 w-4 text-blue-500 fill-blue-400" />;
      default:
        return <Users className="h-4 w-4 text-emerald-500" />;
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/65 backdrop-blur-xs animate-in fade-in duration-150">
        <div
          className="w-full max-w-lg rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col relative max-h-[92vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header - Form đăng nhập màu đỏ */}
          <div
            className="p-5 sm:p-6 text-white text-center relative bg-cover bg-center overflow-hidden shrink-0"
            style={{
              backgroundImage: `linear-gradient(rgba(220, 38, 38, 0.93), rgba(190, 18, 60, 0.95)), url('https://i.postimg.cc/13L3CcKG/anh-nen-lop-8-1.png')`,
            }}
          >
            {/* Top Right Controls: Speaker / Sound + Upload Music + YouTube Icon + Close Button */}
            <div className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 flex items-center gap-1.5 z-20">
              {/* Speaker / Loa Button (Play/Pause) */}
              <button
                type="button"
                onClick={togglePlay}
                disabled={!hasMusic}
                className={`relative flex h-8 w-8 items-center justify-center rounded-full transition-all cursor-pointer ${
                  hasMusic
                    ? isPlaying
                      ? 'bg-white text-red-600 shadow-md scale-105 ring-2 ring-white/60'
                      : 'bg-black/25 hover:bg-black/35 text-white'
                    : 'bg-black/15 text-white/40 cursor-not-allowed'
                }`}
                title={
                  hasMusic
                    ? isPlaying
                      ? 'Tạm dừng nhạc nền'
                      : 'Phát nhạc nền'
                    : 'Chưa có nhạc nền (Bấm nút Tải nhạc bên cạnh)'
                }
                aria-label="Điều khiển loa nhạc nền"
              >
                {isPlaying ? (
                  <Volume2 className="h-4 w-4 animate-pulse" />
                ) : (
                  <VolumeX className="h-4 w-4" />
                )}
                {isPlaying && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                  </span>
                )}
              </button>

              {/* Upload Music Button */}
              <button
                type="button"
                onClick={openUploadDialog}
                disabled={isUploading}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-black/25 hover:bg-black/35 text-white transition-all cursor-pointer"
                title="Tải nhạc nền từ máy tính (.mp3, .wav tối đa 5MB)"
                aria-label="Tải nhạc nền"
              >
                <Upload className="h-3.5 w-3.5" />
              </button>

              {/* YouTube Icon Button */}
              <button
                type="button"
                onClick={() => setIsYouTubeModalOpen(true)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500 hover:bg-red-400 text-white shadow-md shadow-red-950/20 ring-1 ring-white/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                title="Cài đặt & Xem Video YouTube"
                aria-label="Cài đặt Video YouTube"
              >
                <Youtube className="h-4.5 w-4.5 fill-white text-white" />
              </button>

              {/* Close Button 'X' */}
              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-black/20 hover:bg-black/35 text-white transition-colors cursor-pointer"
                title="Đóng hộp thoại đăng nhập"
                aria-label="Đóng"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mb-2">
              <ClassLogo size="lg" />
            </div>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight uppercase">
              SỔ TAY THI ĐUA {config.className}
            </h3>
            <p className="text-xs text-rose-100 mt-0.5 font-medium">
              Chọn chế độ đăng nhập để kích hoạt phân quyền tương ứng
            </p>
          </div>

          {/* Form Body - Scrollable content */}
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
            {/* 1. Màn hình chọn chế độ cụ thể gồm 6 chế độ */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                1. Chọn chế độ làm việc (6 Chế độ phân quyền)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {AUTH_ACCOUNTS.map((acc) => {
                  const isSelected = selectedMode === acc.modeId;
                  return (
                    <div
                      key={acc.modeId}
                      onClick={() => handleSelectMode(acc.modeId)}
                      className={`flex flex-col justify-between p-2.5 rounded-2xl border-2 cursor-pointer transition-all active:scale-[0.98] ${
                        isSelected
                          ? `${acc.activeColor} shadow-xs font-bold scale-[1.02]`
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 text-slate-700 hover:bg-slate-100/60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="p-1 rounded-lg bg-white shadow-2xs">
                          {getModeIcon(acc.iconType)}
                        </span>
                        <span
                          className={`h-3.5 w-3.5 rounded-full border-2 flex items-center justify-center ${
                            isSelected
                              ? 'border-red-600 bg-red-600'
                              : 'border-slate-300'
                          }`}
                        >
                          {isSelected && <div className="h-1 w-1 rounded-full bg-white" />}
                        </span>
                      </div>

                      <div>
                        <p className="text-xs font-bold leading-tight">{acc.title}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5 truncate">
                          {acc.badge}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Scope Information Badge */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3 flex items-start gap-2.5">
              <span className="p-1 rounded-lg bg-red-100 text-red-700 shrink-0 mt-0.5">
                <Sparkles className="h-3.5 w-3.5" />
              </span>
              <div className="text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{currentAccount.title}</span>
                  <span className="rounded-md bg-white border border-slate-200 px-1.5 py-0.2 text-[10px] font-bold text-slate-600 shadow-2xs">
                    {currentAccount.badge}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 mt-0.5 font-medium leading-relaxed">
                  <strong className="text-slate-800">Quyền hạn: </strong>
                  {currentAccount.scopeDesc}
                </p>
              </div>
            </div>

            {/* 2. Username Input */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Tên đăng nhập
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Nhập tên tài khoản..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/60 py-2.5 pl-10 pr-4 text-xs font-bold text-slate-900 focus:border-red-500 focus:bg-white focus:outline-hidden"
                />
              </div>
            </div>

            {/* 3. Password Input */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Mật khẩu
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={`Nhập mật khẩu...`}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/60 py-2.5 pl-10 pr-10 text-xs font-medium text-slate-900 focus:border-red-500 focus:bg-white focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                  title={showPassword ? 'Ẩn mật khẩu' : 'Xem mật khẩu'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 font-medium flex items-start gap-2">
                <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-1">
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 py-3 text-xs font-black uppercase tracking-wider text-white shadow-md shadow-red-500/25 hover:brightness-105 active:scale-95 transition-all cursor-pointer"
              >
                <KeyRound className="h-4 w-4" />
                <span>VÀO HỆ THỐNG VỚI CHẾ ĐỘ {currentAccount.title.toUpperCase()}</span>
              </button>
            </div>
          </form>

          {/* Modal footer info with quick YouTube link */}
          <div className="bg-slate-50/90 px-5 sm:px-6 py-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 shrink-0">
            <span className="flex items-center gap-1.5 font-medium text-slate-600">
              <Music className="h-3.5 w-3.5 text-rose-500" />
              {hasMusic ? (isPlaying ? 'Nhạc nền đang phát' : 'Nhạc nền sẵn sàng') : 'Chưa có nhạc nền'}
            </span>
            <button
              type="button"
              onClick={() => setIsYouTubeModalOpen(true)}
              className="flex items-center gap-1 text-red-600 hover:text-red-700 font-bold hover:underline cursor-pointer"
            >
              <Youtube className="h-3.5 w-3.5 fill-current" />
              <span>Xem Video YouTube</span>
            </button>
          </div>
        </div>

        {/* Floating Background Music Control Cluster */}
        <LoginBackgroundMusic
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[70]"
          onOpenYouTube={() => setIsYouTubeModalOpen(true)}
        />
      </div>

      {/* YouTube Modal Popup */}
      <YouTubeModal
        isOpen={isYouTubeModalOpen}
        onClose={() => setIsYouTubeModalOpen(false)}
      />
    </>
  );
};
