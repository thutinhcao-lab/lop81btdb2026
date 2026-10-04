import React, { useState, useEffect } from 'react';
import {
  X,
  Youtube,
  Play,
  Check,
  AlertCircle,
  Link as LinkIcon,
  Trash2,
  Sparkles,
  ExternalLink,
  Info,
} from 'lucide-react';
import { extractYouTubeId, getYouTubeEmbedUrl } from '../utils/youtube';
import { useBackgroundMusic } from '../context/BackgroundMusicContext';

interface YouTubeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LOCAL_STORAGE_KEY = 'lop8_1_youtube_video_config';

export const YouTubeModal: React.FC<YouTubeModalProps> = ({ isOpen, onClose }) => {
  const [inputUrl, setInputUrl] = useState('');
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);
  const [rawUrl, setRawUrl] = useState<string | null>(null);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Background music pause hook
  const { pause: pauseBackgroundMusic } = useBackgroundMusic();

  // Load saved video from backend and fallback to localStorage
  useEffect(() => {
    const loadSavedVideo = async () => {
      // 1. Try local storage first for instant response
      try {
        const localSaved = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (localSaved) {
          const parsed = JSON.parse(localSaved);
          if (parsed.embedUrl) {
            setEmbedUrl(parsed.embedUrl);
            setRawUrl(parsed.rawUrl || '');
            setInputUrl(parsed.rawUrl || '');
            setVideoId(parsed.videoId || null);
          }
        }
      } catch (e) {
        console.error('Lỗi đọc localStorage:', e);
      }

      // 2. Fetch from backend database
      try {
        const res = await fetch('/api/youtube-video');
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.embedUrl) {
            setEmbedUrl(data.embedUrl);
            setRawUrl(data.url || '');
            setInputUrl(data.url || '');
            setVideoId(data.videoId || null);

            // Sync to local storage
            localStorage.setItem(
              LOCAL_STORAGE_KEY,
              JSON.stringify({
                embedUrl: data.embedUrl,
                rawUrl: data.url,
                videoId: data.videoId,
              })
            );
          }
        }
      } catch (err) {
        console.error('Không thể tải cấu hình YouTube từ server:', err);
      }
    };

    if (isOpen) {
      loadSavedVideo();
      // UX improvement: Pause background music while watching video
      pauseBackgroundMusic();
    }
  }, [isOpen, pauseBackgroundMusic]);

  if (!isOpen) return null;

  // Process and save URL
  const handleSaveAndDisplay = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const trimmed = inputUrl.trim();
    if (!trimmed) {
      setErrorMsg('Vui lòng dán đường link YouTube vào ô nhập liệu!');
      return;
    }

    const extractedId = extractYouTubeId(trimmed);
    if (!extractedId) {
      setErrorMsg(
        'Đường link không hợp lệ! Vui lòng dán link dạng https://www.youtube.com/watch?v=... hoặc https://youtu.be/...'
      );
      return;
    }

    const generatedEmbedUrl = `https://www.youtube.com/embed/${extractedId}?autoplay=1&rel=0&modestbranding=1`;

    // Immediately display in UI
    setEmbedUrl(generatedEmbedUrl);
    setRawUrl(trimmed);
    setVideoId(extractedId);

    // Save to LocalStorage immediately
    try {
      localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify({
          embedUrl: generatedEmbedUrl,
          rawUrl: trimmed,
          videoId: extractedId,
        })
      );
    } catch {
      // LocalStorage fallback
    }

    // Save to Backend Server Database
    try {
      setIsSaving(true);
      const res = await fetch('/api/youtube-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: trimmed, title: 'Video Lớp Học' }),
      });

      if (res.ok) {
        setSuccessMsg('Đã lưu và cập nhật video YouTube thành công!');
        setTimeout(() => setSuccessMsg(null), 3500);
      } else {
        const errorData = await res.json();
        setErrorMsg(errorData.message || 'Lỗi khi lưu lên máy chủ, đã lưu vào bộ nhớ tạm.');
      }
    } catch (err: any) {
      console.warn('API call failed, cached locally:', err);
      setSuccessMsg('Đã cập nhật video trên trình duyệt này!');
      setTimeout(() => setSuccessMsg(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  // Remove current video
  const handleRemoveVideo = async () => {
    if (!window.confirm('Bạn có chắc muốn xóa video YouTube hiện tại không?')) return;

    setEmbedUrl(null);
    setRawUrl(null);
    setVideoId(null);
    setInputUrl('');
    localStorage.removeItem(LOCAL_STORAGE_KEY);

    try {
      await fetch('/api/youtube-video', { method: 'DELETE' });
      setSuccessMsg('Đã xóa video.');
      setTimeout(() => setSuccessMsg(null), 2500);
    } catch (e) {
      console.error('Error removing video:', e);
    }
  };

  // Preset sample videos for easy testing
  const sampleVideos = [
    {
      title: 'Hành khúc Đội TNTP Hồ Chí Minh',
      url: 'https://www.youtube.com/watch?v=J_jKj0gZlX8',
    },
    {
      title: 'Mùa thu ngày khai trường',
      url: 'https://www.youtube.com/watch?v=zJgQn9H_k7c',
    },
    {
      title: 'Bài ca người giáo viên nhân dân',
      url: 'https://www.youtube.com/watch?v=5Vj-yP04W0w',
    },
  ];

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-3xl bg-white shadow-2xl border border-slate-200/90 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-red-600 shadow-md shadow-black/10">
              <Youtube className="h-6 w-6 fill-current" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2">
                Cài đặt Video YouTube
                <span className="rounded-md bg-white/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                  Embed
                </span>
              </h3>
              <p className="text-xs text-rose-100 font-medium">
                Nhúng video YouTube phát trực tiếp trên màn hình đăng nhập
              </p>
            </div>
          </div>

          {/* Close button 'X' in top right */}
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-black/20 hover:bg-black/35 text-white transition-colors cursor-pointer"
            aria-label="Đóng hộp thoại"
            title="Đóng (Esc)"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
          {/* Notification Messages */}
          {errorMsg && (
            <div className="flex items-start gap-2.5 rounded-2xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 animate-in fade-in duration-150">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" />
              <div className="flex-1 font-medium">{errorMsg}</div>
            </div>
          )}

          {successMsg && (
            <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 animate-in fade-in duration-150 font-medium">
              <Check className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Input field and Save button */}
          <form onSubmit={handleSaveAndDisplay} className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Dán đường link YouTube
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <LinkIcon className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=... hoặc https://youtu.be/..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-3 pl-10 pr-10 text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-red-500 focus:bg-white focus:outline-hidden transition-all shadow-inner"
                />
                {inputUrl && (
                  <button
                    type="button"
                    onClick={() => setInputUrl('')}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 p-1"
                    title="Xóa nội dung"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Button Lưu / Hiển thị */}
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 px-5 py-3 text-xs sm:text-sm font-bold text-white shadow-md shadow-red-500/25 hover:brightness-105 active:scale-95 transition-all cursor-pointer whitespace-nowrap disabled:opacity-50"
              >
                <Play className="h-4 w-4 fill-current" />
                <span>{isSaving ? 'Đang lưu...' : 'Lưu & Hiển thị'}</span>
              </button>
            </div>
          </form>

          {/* Preset quick test video chips */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-amber-500" />
              Gợi ý mẫu:
            </span>
            {sampleVideos.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setInputUrl(sample.url);
                  const id = extractYouTubeId(sample.url);
                  if (id) {
                    const embed = `https://www.youtube.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`;
                    setEmbedUrl(embed);
                    setRawUrl(sample.url);
                    setVideoId(id);
                  }
                }}
                className="rounded-lg bg-slate-100 hover:bg-red-50 hover:text-red-700 px-2 py-1 text-[11px] font-medium text-slate-600 transition-colors cursor-pointer border border-slate-200/60"
              >
                {sample.title}
              </button>
            ))}
          </div>

          {/* <iframe> Player Area */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-700">
              <span>Khung phát video YouTube</span>
              {embedUrl && (
                <div className="flex items-center gap-2 text-xs normal-case font-normal">
                  <a
                    href={rawUrl || `https://www.youtube.com/watch?v=${videoId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-red-600 hover:underline font-medium text-[11px]"
                  >
                    <span>Mở trên YouTube</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                  <button
                    type="button"
                    onClick={handleRemoveVideo}
                    className="flex items-center gap-1 text-slate-400 hover:text-rose-600 transition-colors p-1"
                    title="Gỡ video này"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>

            {embedUrl ? (
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-lg border border-slate-200 ring-1 ring-black/5 animate-in fade-in duration-200">
                <iframe
                  src={embedUrl}
                  title="YouTube video player"
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            ) : (
              /* Empty state placeholder */
              <div className="aspect-video w-full rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/70 flex flex-col items-center justify-center p-6 text-center text-slate-400">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-xs border border-slate-200 mb-3 text-red-500">
                  <Youtube className="h-8 w-8 fill-current" />
                </div>
                <p className="text-sm font-bold text-slate-700 mb-1">
                  Chưa có video nào được nhúng
                </p>
                <p className="text-xs text-slate-500 max-w-sm mb-3">
                  Hãy dán một đường link video từ YouTube ở trên và bấm nút{' '}
                  <strong className="text-red-600 font-semibold">Lưu & Hiển thị</strong> để bắt đầu xem.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    const sample = sampleVideos[0];
                    setInputUrl(sample.url);
                    const id = extractYouTubeId(sample.url);
                    if (id) {
                      setEmbedUrl(`https://www.youtube.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`);
                      setRawUrl(sample.url);
                      setVideoId(id);
                    }
                  }}
                  className="text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-xl px-3 py-1.5 transition-colors cursor-pointer"
                >
                  Dùng thử video mẫu ngay
                </button>
              </div>
            )}
          </div>

          {/* Quick instructions guide */}
          <div className="rounded-2xl bg-slate-50 border border-slate-100 p-3 text-[11px] text-slate-500 flex items-start gap-2">
            <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-semibold text-slate-700">Hỗ trợ các định dạng:</span>{' '}
              Đường link máy tính (`youtube.com/watch?v=...`), điện thoại di động (`m.youtube.com`), link rút gọn (`youtu.be/...`), hoặc YouTube Shorts.
              Hệ thống tự động lưu vào cơ sở dữ liệu và bộ nhớ để giữ video khi tải lại trang (F5).
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50/90 px-5 sm:px-6 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5 font-medium text-slate-600">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            Hệ thống Thi đua Lớp 8/1
          </span>
          <button
            onClick={onClose}
            className="rounded-xl bg-white border border-slate-200 px-4 py-1.5 font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
