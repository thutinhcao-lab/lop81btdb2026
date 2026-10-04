import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react';

export interface MusicInfo {
  musicUrl: string | null;
  title: string | null;
  fileName?: string | null;
  fileSize?: number | null;
}

interface BackgroundMusicContextType {
  musicInfo: MusicInfo;
  isPlaying: boolean;
  isUploading: boolean;
  isLoadingConfig: boolean;
  errorMessage: string | null;
  successMessage: string | null;
  volume: number;
  setVolume: (v: number) => void;
  togglePlay: () => void;
  play: () => void;
  pause: () => void;
  handleFileUpload: (file: File) => Promise<boolean>;
  deleteMusic: () => Promise<boolean>;
  openUploadDialog: () => void;
  setErrorMessage: (msg: string | null) => void;
  setSuccessMessage: (msg: string | null) => void;
}

const BackgroundMusicContext = createContext<BackgroundMusicContextType | undefined>(undefined);

export const BackgroundMusicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [musicInfo, setMusicInfo] = useState<MusicInfo>({
    musicUrl: null,
    title: null,
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [userExplicitlyPaused, setUserExplicitlyPaused] = useState(false);
  const [volume, setVolume] = useState(0.45); // 45% default volume

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const firstInteractionHandledRef = useRef(false);

  // 1. Fetch initial configuration from database
  const fetchMusicConfig = useCallback(async () => {
    try {
      setIsLoadingConfig(true);
      const res = await fetch('/api/background-music');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.musicUrl) {
          setMusicInfo({
            musicUrl: data.musicUrl,
            title: data.title || 'Nhạc nền đăng nhập',
            fileName: data.fileName,
            fileSize: data.fileSize,
          });
        } else {
          setMusicInfo({ musicUrl: null, title: null });
        }
      }
    } catch (err) {
      console.error('Không thể kiểm tra nhạc nền từ máy chủ:', err);
    } finally {
      setIsLoadingConfig(false);
    }
  }, []);

  useEffect(() => {
    fetchMusicConfig();
  }, [fetchMusicConfig]);

  // 2. Adjust volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // 3. User interaction listener for autoplay
  useEffect(() => {
    if (!musicInfo.musicUrl) return;

    const handleFirstUserInteraction = () => {
      if (firstInteractionHandledRef.current) return;
      if (userExplicitlyPaused) return;

      if (audioRef.current && audioRef.current.paused) {
        firstInteractionHandledRef.current = true;
        audioRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch((e) => console.log('Autoplay deferred until user interaction:', e));
      }
    };

    window.addEventListener('click', handleFirstUserInteraction, { once: true });
    window.addEventListener('touchstart', handleFirstUserInteraction, { once: true });
    window.addEventListener('keydown', handleFirstUserInteraction, { once: true });

    return () => {
      window.removeEventListener('click', handleFirstUserInteraction);
      window.removeEventListener('touchstart', handleFirstUserInteraction);
      window.removeEventListener('keydown', handleFirstUserInteraction);
    };
  }, [musicInfo.musicUrl, userExplicitlyPaused]);

  // Toggle Play / Pause
  const togglePlay = useCallback(() => {
    if (!audioRef.current || !musicInfo.musicUrl) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      setUserExplicitlyPaused(true);
    } else {
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          setUserExplicitlyPaused(false);
        })
        .catch((err) => {
          console.error('Lỗi khi phát nhạc:', err);
          setErrorMessage('Không thể phát nhạc. Vui lòng thử lại!');
          setTimeout(() => setErrorMessage(null), 3000);
        });
    }
  }, [isPlaying, musicInfo.musicUrl]);

  const play = useCallback(() => {
    if (audioRef.current && musicInfo.musicUrl && !isPlaying) {
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          setUserExplicitlyPaused(false);
        })
        .catch(() => {});
    }
  }, [musicInfo.musicUrl, isPlaying]);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  // Handle file upload
  const handleFileUpload = useCallback(
    async (file: File): Promise<boolean> => {
      const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      if (ext !== '.mp3' && ext !== '.wav') {
        setErrorMessage('Chỉ chấp nhận file âm thanh định dạng .mp3 hoặc .wav!');
        setTimeout(() => setErrorMessage(null), 4000);
        return false;
      }

      // Max size: 5MB
      const MAX_SIZE = 5 * 1024 * 1024;
      if (file.size > MAX_SIZE) {
        const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
        setErrorMessage(`Dung lượng file (${sizeMB}MB) vượt quá giới hạn tối đa 5MB!`);
        setTimeout(() => setErrorMessage(null), 4000);
        return false;
      }

      try {
        setIsUploading(true);
        setErrorMessage(null);

        const formData = new FormData();
        formData.append('music', file);
        formData.append('title', file.name.replace(/\.[^/.]+$/, ''));

        const res = await fetch('/api/background-music/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        if (res.ok && data.success) {
          setMusicInfo({
            musicUrl: data.musicUrl,
            title: data.title || file.name,
            fileSize: data.fileSize,
          });
          setSuccessMessage('Tải nhạc nền thành công!');
          setUserExplicitlyPaused(false);
          setTimeout(() => setSuccessMessage(null), 3500);

          setTimeout(() => {
            if (audioRef.current) {
              audioRef.current
                .play()
                .then(() => setIsPlaying(true))
                .catch(() => {});
            }
          }, 350);

          return true;
        } else {
          setErrorMessage(data.message || 'Lỗi khi tải file nhạc lên máy chủ');
          setTimeout(() => setErrorMessage(null), 4000);
          return false;
        }
      } catch (err: any) {
        setErrorMessage(err.message || 'Lỗi mạng khi kết nối máy chủ');
        setTimeout(() => setErrorMessage(null), 4000);
        return false;
      } finally {
        setIsUploading(false);
      }
    },
    []
  );

  const deleteMusic = useCallback(async (): Promise<boolean> => {
    try {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlaying(false);

      const res = await fetch('/api/background-music', { method: 'DELETE' });
      if (res.ok) {
        setMusicInfo({ musicUrl: null, title: null });
        setSuccessMessage('Đã gỡ nhạc nền thành công');
        setTimeout(() => setSuccessMessage(null), 3000);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Lỗi khi xóa nhạc:', err);
      return false;
    }
  }, []);

  const openUploadDialog = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
    e.target.value = '';
  };

  return (
    <BackgroundMusicContext.Provider
      value={{
        musicInfo,
        isPlaying,
        isUploading,
        isLoadingConfig,
        errorMessage,
        successMessage,
        volume,
        setVolume,
        togglePlay,
        play,
        pause,
        handleFileUpload,
        deleteMusic,
        openUploadDialog,
        setErrorMessage,
        setSuccessMessage,
      }}
    >
      {/* Global HTML5 Audio Element */}
      <audio
        ref={audioRef}
        src={musicInfo.musicUrl || undefined}
        loop
        preload="auto"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* Hidden file input for file selection */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={onFileInputChange}
        accept=".mp3,.wav,audio/mpeg,audio/wav"
        className="hidden"
      />

      {children}
    </BackgroundMusicContext.Provider>
  );
};

export const useBackgroundMusic = () => {
  const context = useContext(BackgroundMusicContext);
  if (!context) {
    throw new Error('useBackgroundMusic must be used within a BackgroundMusicProvider');
  }
  return context;
};
