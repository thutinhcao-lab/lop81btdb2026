import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProduction = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT || 3000;

async function startServer() {
  const app = express();
  app.use(express.json());

  // Directories for uploads and database
  const uploadsDir = path.join(__dirname, 'uploads', 'audio');
  const dataDir = path.join(__dirname, 'data');
  const dbFile = path.join(dataDir, 'system_config.json');

  // Ensure directories exist
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Database helper functions (system configuration store)
  const getSystemConfig = () => {
    try {
      if (fs.existsSync(dbFile)) {
        const raw = fs.readFileSync(dbFile, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (e) {
      console.error('Error reading system_config.json:', e);
    }
    return {
      backgroundMusicUrl: null,
      backgroundMusicTitle: null,
      backgroundMusicFileName: null,
      backgroundMusicSize: null,
      youtubeUrl: null,
      youtubeEmbedUrl: null,
      youtubeVideoId: null,
      youtubeTitle: null,
      updatedAt: null,
    };
  };

  const saveSystemConfig = (cfg: Record<string, any>) => {
    try {
      const current = getSystemConfig();
      const updated = {
        ...current,
        ...cfg,
        updatedAt: new Date().toISOString(),
      };
      fs.writeFileSync(dbFile, JSON.stringify(updated, null, 2), 'utf-8');
      return updated;
    } catch (e) {
      console.error('Error saving system_config.json:', e);
      throw e;
    }
  };

  // Static files for uploaded audio
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

  // Multer Storage Configuration
  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, uploadsDir);
    },
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const baseName = path
        .basename(file.originalname, ext)
        .replace(/[^a-zA-Z0-9_\-\.]/g, '_');
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e6);
      cb(null, `bg-music-${baseName}-${uniqueSuffix}${ext}`);
    },
  });

  // Multer file filter: only .mp3 and .wav
  const upload = multer({
    storage,
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB maximum file size limit
    },
    fileFilter: (_req, file, cb) => {
      const allowedExtensions = ['.mp3', '.wav'];
      const ext = path.extname(file.originalname).toLowerCase();
      const allowedMimetypes = [
        'audio/mpeg',
        'audio/mp3',
        'audio/wav',
        'audio/wave',
        'audio/x-wav',
        'audio/x-pn-wav',
      ];

      if (allowedExtensions.includes(ext) || allowedMimetypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(
          new Error('Chỉ chấp nhận file âm thanh định dạng .mp3 hoặc .wav!')
        );
      }
    },
  });

  // ================= API ROUTES =================

  // 1. Get background music configuration
  app.get('/api/background-music', (_req, res) => {
    const config = getSystemConfig();
    res.json({
      success: true,
      musicUrl: config.backgroundMusicUrl || null,
      title: config.backgroundMusicTitle || null,
      fileName: config.backgroundMusicFileName || null,
      fileSize: config.backgroundMusicSize || null,
      updatedAt: config.updatedAt || null,
    });
  });

  // 2. Upload background music (max 5MB, .mp3 or .wav)
  app.post('/api/background-music/upload', (req, res) => {
    upload.single('music')(req, res, (err: any) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'Dung lượng file vượt quá giới hạn tối đa 5MB!',
          });
        }
        return res.status(400).json({
          success: false,
          message: `Lỗi upload: ${err.message}`,
        });
      } else if (err) {
        return res.status(400).json({
          success: false,
          message: err.message || 'File không hợp lệ (chỉ nhận file .mp3, .wav)',
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng chọn file âm thanh .mp3 hoặc .wav để tải lên',
        });
      }

      const relativeUrl = `/uploads/audio/${req.file.filename}`;
      const title = req.body.title || req.file.originalname;

      const updated = saveSystemConfig({
        backgroundMusicUrl: relativeUrl,
        backgroundMusicTitle: title,
        backgroundMusicFileName: req.file.filename,
        backgroundMusicOriginalName: req.file.originalname,
        backgroundMusicSize: req.file.size,
      });

      return res.json({
        success: true,
        message: 'Tải nhạc nền thành công!',
        musicUrl: updated.backgroundMusicUrl,
        title: updated.backgroundMusicTitle,
        fileSize: updated.backgroundMusicSize,
      });
    });
  });

  // 3. Delete/reset background music
  app.delete('/api/background-music', (_req, res) => {
    const current = getSystemConfig();
    if (current.backgroundMusicFileName) {
      const filePath = path.join(uploadsDir, current.backgroundMusicFileName);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (e) {
          console.error('Error removing old file:', e);
        }
      }
    }

    saveSystemConfig({
      backgroundMusicUrl: null,
      backgroundMusicTitle: null,
      backgroundMusicFileName: null,
      backgroundMusicOriginalName: null,
      backgroundMusicSize: null,
    });

    res.json({
      success: true,
      message: 'Đã xóa nhạc nền thành công',
    });
  });

  // ================= YOUTUBE VIDEO ROUTES =================

  function extractYouTubeId(url: string): string | null {
    if (!url) return null;
    const trimmed = url.trim();
    if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
      return trimmed;
    }
    const patterns = [
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts|live)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i,
      /^[a-zA-Z0-9_-]{11}$/,
    ];
    for (const regex of patterns) {
      const match = trimmed.match(regex);
      if (match && match[1]) {
        return match[1];
      }
    }
    return null;
  }

  // 1. Get current YouTube video configuration
  app.get('/api/youtube-video', (_req, res) => {
    const config = getSystemConfig();
    res.json({
      success: true,
      url: config.youtubeUrl || null,
      embedUrl: config.youtubeEmbedUrl || null,
      videoId: config.youtubeVideoId || null,
      title: config.youtubeTitle || null,
      updatedAt: config.updatedAt || null,
    });
  });

  // 2. Save YouTube video
  app.post('/api/youtube-video', (req, res) => {
    const { url, title } = req.body || {};
    if (!url || typeof url !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp đường link YouTube hợp lệ.',
      });
    }

    const videoId = extractYouTubeId(url);
    if (!videoId) {
      return res.status(400).json({
        success: false,
        message: 'Không tìm thấy ID video hợp lệ từ đường link YouTube đã nhập.',
      });
    }

    const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
    const updated = saveSystemConfig({
      youtubeUrl: url.trim(),
      youtubeEmbedUrl: embedUrl,
      youtubeVideoId: videoId,
      youtubeTitle: title || 'Video YouTube',
    });

    res.json({
      success: true,
      message: 'Lưu video YouTube thành công!',
      url: updated.youtubeUrl,
      embedUrl: updated.youtubeEmbedUrl,
      videoId: updated.youtubeVideoId,
      title: updated.youtubeTitle,
    });
  });

  // 3. Clear YouTube video
  app.delete('/api/youtube-video', (_req, res) => {
    saveSystemConfig({
      youtubeUrl: null,
      youtubeEmbedUrl: null,
      youtubeVideoId: null,
      youtubeTitle: null,
    });

    res.json({
      success: true,
      message: 'Đã xóa video YouTube thành công',
    });
  });

  // ================= VITE DEV OR STATIC PROD =================
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Express Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
