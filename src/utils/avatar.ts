/**
 * Student Avatar Utility
 * Provides deterministic, high-quality student portrait avatars and helpers.
 */

import { Student } from '../types';

export const PRESET_AVATARS = [
  { id: 'preset_1', label: 'Học sinh Nam 1', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Felix&backgroundColor=b6e3f4' },
  { id: 'preset_2', label: 'Học sinh Nữ 1', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Aneka&backgroundColor=ffd5dc' },
  { id: 'preset_3', label: 'Học sinh Nam 2', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Oliver&backgroundColor=c0aede' },
  { id: 'preset_4', label: 'Học sinh Nữ 2', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Sophia&backgroundColor=ffdfbf' },
  { id: 'preset_5', label: 'Học sinh Nam 3', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Leo&backgroundColor=d1d4f9' },
  { id: 'preset_6', label: 'Học sinh Nữ 3', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Zoe&backgroundColor=ffd5dc' },
  { id: 'preset_7', label: 'Học sinh Nam 4', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Max&backgroundColor=b6e3f4' },
  { id: 'preset_8', label: 'Học sinh Nữ 4', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Mia&backgroundColor=c0aede' },
];

/**
 * Returns student avatar URL if defined, or generates a deterministic cute student avatar based on student code/name.
 */
export function getStudentAvatar(student: {
  id?: string;
  code?: string;
  name: string;
  gender?: 'nam' | 'nu';
  avatar?: string;
}): string {
  if (student.avatar && student.avatar.trim()) {
    return student.avatar;
  }
  const seed = student.code ? `${student.code}_${student.name}` : student.name;
  const bg = student.gender === 'nu' ? 'ffd5dc,c0aede,ffdfbf' : 'b6e3f4,c0aede,d1d4f9';
  return `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(seed)}&backgroundColor=${bg}`;
}

/**
 * Resizes an image (base64) to reasonable dimensions for avatars and returns JPEG data URL.
 */
export function resizeAvatarImage(
  base64Str: string,
  maxWidth = 360,
  maxHeight = 360,
  quality = 0.88
): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      let width = img.width;
      let height = img.height;
      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      } else {
        resolve(base64Str);
      }
    };
    img.onerror = () => resolve(base64Str);
  });
}
