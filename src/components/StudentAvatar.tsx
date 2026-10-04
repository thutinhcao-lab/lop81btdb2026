import React, { useState } from 'react';
import { Pencil, User as UserIcon } from 'lucide-react';
import { getStudentAvatar } from '../utils/avatar';

interface StudentAvatarProps {
  student: {
    id?: string;
    code?: string;
    name: string;
    gender?: 'nam' | 'nu';
    avatar?: string;
  };
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showEditButton?: boolean;
  onEditClick?: () => void;
  onClick?: () => void;
  title?: string;
}

const SIZE_CLASSES = {
  xs: 'h-7 w-7 text-xs rounded-xl',
  sm: 'h-8 w-8 text-xs rounded-xl',
  md: 'h-10 w-10 text-sm rounded-2xl',
  lg: 'h-14 w-14 text-base rounded-2xl',
  xl: 'h-24 w-24 text-xl rounded-3xl',
};

const PENCIL_SIZE_CLASSES = {
  xs: 'h-3.5 w-3.5 -bottom-1 -right-1 p-0.5',
  sm: 'h-4 w-4 -bottom-1 -right-1 p-0.5',
  md: 'h-5 w-5 -bottom-1 -right-1 p-1',
  lg: 'h-6 w-6 -bottom-1 -right-1 p-1.5',
  xl: 'h-7 w-7 -bottom-1 -right-1 p-1.5',
};

export const StudentAvatar: React.FC<StudentAvatarProps> = ({
  student,
  size = 'md',
  className = '',
  showEditButton = false,
  onEditClick,
  onClick,
  title,
}) => {
  const [imgError, setImgError] = useState(false);
  const avatarUrl = getStudentAvatar(student);

  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.md;
  const pencilClass = PENCIL_SIZE_CLASSES[size] || PENCIL_SIZE_CLASSES.md;

  return (
    <div className="relative group/avatar inline-block shrink-0 select-none">
      <div
        onClick={onClick}
        className={`relative overflow-hidden bg-slate-100 border border-slate-200 shadow-2xs flex items-center justify-center transition-transform ${
          onClick ? 'cursor-pointer hover:scale-105 active:scale-95' : ''
        } ${sizeClass} ${className}`}
        title={title || student.name}
      >
        {!imgError ? (
          <img
            src={avatarUrl}
            alt={student.name}
            className="h-full w-full object-cover"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <div
            className={`flex h-full w-full items-center justify-center font-black text-white ${
              student.gender === 'nu'
                ? 'bg-linear-to-tr from-pink-500 to-rose-400'
                : 'bg-linear-to-tr from-blue-600 to-indigo-500'
            }`}
          >
            {student.name.trim().split(' ').slice(-1)[0]?.charAt(0) || <UserIcon className="h-4 w-4" />}
          </div>
        )}
      </div>

      {showEditButton && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onEditClick?.();
          }}
          className={`absolute flex items-center justify-center rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-md ring-2 ring-white transition-all hover:scale-115 active:scale-95 cursor-pointer z-10 ${pencilClass}`}
          title="Tải ảnh đại diện mới từ máy tính"
        >
          <Pencil className="h-full w-full" />
        </button>
      )}
    </div>
  );
};
