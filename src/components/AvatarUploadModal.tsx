import React, { useState, useRef } from 'react';
import {
  X,
  UploadCloud,
  Check,
  Trash2,
  Sparkles,
  Link as LinkIcon,
  FolderOpen,
  User as UserIcon,
} from 'lucide-react';
import { Student } from '../types';
import { PRESET_AVATARS, resizeAvatarImage, getStudentAvatar } from '../utils/avatar';

interface AvatarUploadModalProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveAvatar: (newAvatarUrl: string | undefined) => void;
}

export const AvatarUploadModal: React.FC<AvatarUploadModalProps> = ({
  student,
  isOpen,
  onClose,
  onSaveAvatar,
}) => {
  if (!isOpen || !student) return null;

  const currentAvatar = getStudentAvatar(student);
  const [preview, setPreview] = useState<string>(student.avatar || currentAvatar);
  const [urlInput, setUrlInput] = useState<string>(student.avatar || '');
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Vui lòng chọn một tệp hình ảnh hợp lệ (PNG, JPG, JPEG, WEBP).');
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setErrorMessage('Kích thước ảnh tối đa là 15MB.');
      return;
    }

    setErrorMessage('');
    setIsProcessing(true);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const rawBase64 = e.target?.result as string;
        // Resize and optimize to compact base64
        const optimized = await resizeAvatarImage(rawBase64, 360, 360, 0.88);
        setPreview(optimized);
        setIsProcessing(false);
      };
      reader.onerror = () => {
        setErrorMessage('Không thể đọc tệp hình ảnh. Vui lòng thử lại.');
        setIsProcessing(false);
      };
      reader.readAsDataURL(file);
    } catch {
      setErrorMessage('Lỗi xử lý hình ảnh.');
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleSave = () => {
    // If preview equals the default avatar or empty, save undefined; else save preview
    if (!preview || preview === currentAvatar) {
      onSaveAvatar(student.avatar); // keep as is or default
    } else {
      onSaveAvatar(preview);
    }
    onClose();
  };

  const handleResetToDefault = () => {
    onSaveAvatar(undefined);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative bg-linear-to-r from-blue-700 via-indigo-700 to-purple-700 p-5 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 rounded-full bg-black/20 hover:bg-black/30 p-1.5 text-white transition-colors cursor-pointer"
            title="Đóng"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-amber-300" />
            <h3 className="text-base sm:text-lg font-black tracking-tight">
              Tải Ảnh Đại Diện Mới
            </h3>
          </div>
          <p className="text-xs text-blue-100 mt-1">
            Học sinh: <strong className="text-white">{student.name}</strong> • Mã: <span className="font-mono text-amber-300">{student.code}</span> • Tổ {student.team}
          </p>
        </div>

        {/* Hidden native file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png, image/jpeg, image/jpg, image/webp"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFile(e.target.files[0]);
            }
          }}
        />

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {/* Avatar Preview Section */}
          <div className="flex flex-col items-center justify-center">
            <div className="relative group/avatar mb-2">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="relative h-28 w-28 sm:h-32 sm:w-32 rounded-3xl overflow-hidden shadow-lg ring-4 ring-blue-500/20 border-2 border-slate-200 cursor-pointer bg-slate-100 flex items-center justify-center hover:opacity-95 transition-all"
                title="Bấm để chọn ảnh từ máy tính"
              >
                {preview ? (
                  <img
                    src={preview}
                    alt={student.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <UserIcon className="h-14 w-14 text-slate-400" />
                )}

                {/* Hover overlay hint */}
                <div className="absolute inset-0 bg-black/45 flex flex-col items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity text-white text-center p-2">
                  <UploadCloud className="h-6 w-6 mb-1 text-white animate-bounce" />
                  <span className="text-[11px] font-bold">Chọn tệp từ máy tính</span>
                </div>
              </div>
            </div>

            <p className="text-xs font-semibold text-slate-600">
              {isProcessing ? 'Đang tối ưu hình ảnh...' : 'Hình ảnh đại diện sẽ hiển thị trong hệ thống'}
            </p>
          </div>

          {/* Primary Action Button: Upload from computer */}
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-2.5 w-full rounded-2xl bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 py-3 px-4 text-white font-bold text-sm shadow-md hover:shadow-lg active:scale-[0.98] transition-all cursor-pointer"
            >
              <FolderOpen className="h-5 w-5 text-amber-300" />
              <span>Chọn & Tải Tệp Hình Ảnh Từ Máy Tính</span>
            </button>

            {/* Drop Zone Box */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-dashed cursor-pointer transition-all ${
                isDragging
                  ? 'border-blue-500 bg-blue-50/70 scale-[1.01]'
                  : 'border-slate-300 bg-slate-50/80 hover:border-blue-400 hover:bg-blue-50/40'
              }`}
            >
              <UploadCloud className="h-6 w-6 text-slate-400 mb-1" />
              <p className="text-xs font-bold text-slate-700 text-center">
                Hoặc kéo thả file ảnh (PNG, JPG, WEBP) vào đây
              </p>
              <span className="text-[10px] text-slate-400 mt-0.5">
                Hỗ trợ tệp ảnh chụp từ điện thoại, máy ảnh hoặc tải về máy
              </span>
            </div>

            {errorMessage && (
              <p className="text-xs font-semibold text-rose-600 text-center bg-rose-50 p-2 rounded-xl border border-rose-200">
                {errorMessage}
              </p>
            )}
          </div>

          {/* Preset Cute Student Avatars */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center gap-1.5 mb-2.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                Hoặc chọn nhanh avatar mẫu học sinh:
              </label>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {PRESET_AVATARS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => {
                    setPreview(preset.url);
                    setErrorMessage('');
                  }}
                  className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all p-0.5 cursor-pointer hover:scale-105 active:scale-95 ${
                    preview === preset.url
                      ? 'border-blue-600 ring-2 ring-blue-500/40'
                      : 'border-slate-200 hover:border-blue-300'
                  }`}
                  title={preset.label}
                >
                  <img
                    src={preset.url}
                    alt={preset.label}
                    className="h-full w-full object-cover rounded-lg"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Web URL Option */}
          <div className="pt-2 border-t border-slate-100 space-y-1.5">
            <label className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-slate-600">
              <LinkIcon className="h-3 w-3 text-slate-400" />
              <span>Hoặc dán link ảnh trực tuyến (URL)</span>
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="https://example.com/anh-hoc-sinh.jpg"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-hidden"
              />
              <button
                type="button"
                onClick={() => {
                  if (urlInput.trim()) {
                    setPreview(urlInput.trim());
                    setErrorMessage('');
                  }
                }}
                className="rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 text-xs font-bold text-slate-700 cursor-pointer active:scale-95"
              >
                Áp dụng
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between gap-2">
          <div>
            {student.avatar && (
              <button
                type="button"
                onClick={handleResetToDefault}
                className="flex items-center gap-1 rounded-xl text-rose-600 hover:bg-rose-50 px-3 py-2 text-xs font-bold transition-colors cursor-pointer"
                title="Khôi phục avatar mặc định"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Về mặc định</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-5 py-2 text-xs font-bold text-white shadow-md active:scale-95 transition-all cursor-pointer"
            >
              <Check className="h-4 w-4" />
              <span>Lưu Ảnh Đại Diện</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
