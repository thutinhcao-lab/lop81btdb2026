import React, { useState } from 'react';
import {
  Volume2,
  VolumeX,
  Upload,
  Music,
  Trash2,
  Loader2,
  CheckCircle,
  AlertCircle,
  Youtube,
} from 'lucide-react';
import { useBackgroundMusic } from '../context/BackgroundMusicContext';

interface LoginBackgroundMusicProps {
  /** Optional custom CSS classes for positioning */
  className?: string;
  /** Whether to show a compact corner pill or full badge */
  compact?: boolean;
  /** Optional callback to open the YouTube modal */
  onOpenYouTube?: () => void;
}

export const LoginBackgroundMusic: React.FC<LoginBackgroundMusicProps> = ({
  className = 'fixed bottom-5 right-5 z-[70]',
  compact = false,
  onOpenYouTube,
}) => {
  const {
    musicInfo,
    isPlaying,
    isUploading,
    errorMessage,
    successMessage,
    volume,
    setVolume,
    togglePlay,
    openUploadDialog,
    deleteMusic,
  } = useBackgroundMusic();

  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  const hasMusic = !!musicInfo.musicUrl;

  const handleDeleteMusic = async () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bài nhạc nền hiện tại?')) {
      await deleteMusic();
    }
  };

  return (
    <div className={`transition-all select-none ${className}`}>
      {/* Toast notifications */}
      {errorMessage && (
        <div className="mb-2 flex items-center gap-2 rounded-xl bg-rose-600 px-3 py-2 text-xs font-semibold text-white shadow-xl animate-in slide-in-from-bottom-2 duration-200">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="mb-2 flex items-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white shadow-xl animate-in slide-in-from-bottom-2 duration-200">
          <CheckCircle className="h-4 w-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Main Control Cluster */}
      <div className="flex items-center gap-2 rounded-2xl bg-white/95 backdrop-blur-md p-1.5 sm:p-2 shadow-2xl border border-slate-200/80 ring-1 ring-black/5 hover:border-slate-300 transition-all">
        {/* Play / Pause Speaker Button */}
        {hasMusic ? (
          <div className="relative group">
            <button
              onClick={togglePlay}
              className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all cursor-pointer ${
                isPlaying
                  ? 'bg-gradient-to-tr from-rose-500 to-red-600 text-white shadow-md shadow-red-500/30 scale-105 ring-2 ring-red-400/40'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
              title={isPlaying ? 'Tạm dừng nhạc nền (Pause)' : 'Phát nhạc nền (Play)'}
              aria-label={isPlaying ? 'Tạm dừng nhạc nền' : 'Phát nhạc nền'}
            >
              {isPlaying ? (
                <div className="relative flex items-center justify-center">
                  <Volume2 className="h-5 w-5 animate-pulse" />
                  <span className="absolute -top-1 -right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                  </span>
                </div>
              ) : (
                <VolumeX className="h-5 w-5 text-slate-500" />
              )}
            </button>

            {/* Quick volume popup on hover */}
            <div
              className="absolute bottom-full mb-2 left-0 hidden group-hover:flex flex-col items-center bg-slate-900/90 text-white rounded-xl p-2 shadow-xl backdrop-blur-xs text-[10px]"
              onMouseEnter={() => setShowVolumeSlider(true)}
              onMouseLeave={() => setShowVolumeSlider(false)}
            >
              <span className="whitespace-nowrap font-medium mb-1">
                Âm lượng: {Math.round(volume * 100)}%
              </span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-20 h-1 accent-red-500 cursor-pointer"
              />
            </div>
          </div>
        ) : (
          /* Empty Database State: Disabled Play button until upload */
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-400 cursor-not-allowed"
            title="Chưa có nhạc nền. Hãy tải lên file .mp3 hoặc .wav (< 5MB)"
          >
            <Music className="h-5 w-5 opacity-40" />
          </div>
        )}

        {/* Music Info Label (if available) */}
        {hasMusic && !compact && (
          <div className="hidden sm:flex flex-col min-w-0 max-w-[130px] pr-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
              {isPlaying ? 'Đang phát' : 'Nhạc nền'}
            </span>
            <span
              className="text-xs font-semibold text-slate-800 truncate"
              title={musicInfo.title || 'Nhạc nền'}
            >
              {musicInfo.title || 'Nhạc nền'}
            </span>
          </div>
        )}

        {/* Upload Button */}
        <button
          onClick={openUploadDialog}
          disabled={isUploading}
          className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-all cursor-pointer ${
            hasMusic
              ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900'
              : 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md shadow-red-500/25 hover:brightness-105 active:scale-95'
          }`}
          title="Tải nhạc nền từ máy tính (chỉ nhận .mp3, .wav tối đa 5MB)"
        >
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-inherit" />
              <span>Đang tải...</span>
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 shrink-0" />
              <span>{hasMusic ? 'Đổi nhạc' : 'Tải nhạc nền'}</span>
            </>
          )}
        </button>

        {/* Delete current music button (if uploaded) */}
        {hasMusic && (
          <button
            onClick={handleDeleteMusic}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
            title="Xóa bài nhạc này"
            aria-label="Xóa nhạc nền"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}

        {/* Optional YouTube Button on the floating bar */}
        {onOpenYouTube && (
          <button
            onClick={onOpenYouTube}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 transition-colors cursor-pointer border border-red-200/60 shadow-2xs"
            title="Mở Video YouTube"
            aria-label="Mở Video YouTube"
          >
            <Youtube className="h-4 w-4 fill-current" />
          </button>
        )}
      </div>
    </div>
  );
};
