import { AuthAccountConfig } from '../types';

export const AUTH_ACCOUNTS: AuthAccountConfig[] = [
  {
    modeId: 'TEACHER',
    role: 'TEACHER',
    title: 'Giáo Viên Chủ Nhiệm',
    badge: 'Toàn quyền Admin',
    defaultUsername: 'giaovien',
    allowedUsernames: [
      'giaovien',
      'gvcn',
      'tinh',
      'caotinh',
      'caothitinh',
      'thutinhcao@gmail.com',
    ],
    password: 'Tinh@11071987',
    name: 'Cô Cao Thị Tình',
    desc: 'Quản trị hệ thống, cấu hình Google Sheets, chốt điểm tuần, thêm/sửa/xóa học sinh và tiêu chí',
    scopeDesc: 'Được tất cả các quyền trong hệ thống',
    color: 'border-red-500 bg-red-50/70 text-red-900',
    activeColor: 'ring-2 ring-red-500 border-red-600 bg-red-100/80',
    iconType: 'crown',
  },
  {
    modeId: 'MONITOR',
    role: 'MONITOR',
    title: 'Lớp Trưởng',
    badge: 'Cán sự lớp',
    defaultUsername: 'loptruong',
    allowedUsernames: ['loptruong', 'lt', 'an', 'nguyenvanan', 'hs01'],
    password: 'LT@2026',
    name: 'Nguyễn Văn An (Lớp trưởng)',
    desc: 'Quản lý thi đua toàn bộ lớp học, chấm điểm việc tốt/vi phạm cho cả lớp, xem báo cáo và bảng xếp hạng',
    scopeDesc: 'Nhập, sửa phần chấm điểm thi đua cả lớp (Tổ 1 - Tổ 4)',
    color: 'border-blue-500 bg-blue-50/70 text-blue-900',
    activeColor: 'ring-2 ring-blue-500 border-blue-600 bg-blue-100/80',
    iconType: 'monitor',
  },
  {
    modeId: 'TEAM_LEADER_1',
    role: 'TEAM_LEADER',
    team: 1,
    title: 'Tổ Trưởng Tổ 1',
    badge: 'Tổ trưởng T1',
    defaultUsername: 'totruong1',
    allowedUsernames: ['totruong1', 'tt1', 'totruongto1', 'bich', 'hs02'],
    password: 'TTT1@2026',
    name: 'Trần Thị Bích (Tổ trưởng Tổ 1)',
    desc: 'Theo dõi nề nếp thi đua, chấm điểm việc tốt, vi phạm và sửa điểm cho các thành viên Tổ 1',
    scopeDesc: 'Chỉ nhập, sửa phần chấm điểm thi đua của Tổ 1',
    color: 'border-emerald-500 bg-emerald-50/70 text-emerald-900',
    activeColor: 'ring-2 ring-emerald-500 border-emerald-600 bg-emerald-100/80',
    iconType: 'team1',
  },
  {
    modeId: 'TEAM_LEADER_2',
    role: 'TEAM_LEADER',
    team: 2,
    title: 'Tổ Trưởng Tổ 2',
    badge: 'Tổ trưởng T2',
    defaultUsername: 'totruong2',
    allowedUsernames: ['totruong2', 'tt2', 'totruongto2', 'my', 'hs12'],
    password: 'TTT2@2026',
    name: 'Phan Thảo My (Tổ trưởng Tổ 2)',
    desc: 'Theo dõi nề nếp thi đua, chấm điểm việc tốt, vi phạm và sửa điểm cho các thành viên Tổ 2',
    scopeDesc: 'Chỉ nhập, sửa phần chấm điểm thi đua của Tổ 2',
    color: 'border-teal-500 bg-teal-50/70 text-teal-900',
    activeColor: 'ring-2 ring-teal-500 border-teal-600 bg-teal-100/80',
    iconType: 'team2',
  },
  {
    modeId: 'TEAM_LEADER_3',
    role: 'TEAM_LEADER',
    team: 3,
    title: 'Tổ Trưởng Tổ 3',
    badge: 'Tổ trưởng T3',
    defaultUsername: 'totruong3',
    allowedUsernames: ['totruong3', 'tt3', 'totruongto3', 'son', 'hs21'],
    password: 'TTT3@2026',
    name: 'Nguyễn Bảo Sơn (Tổ trưởng Tổ 3)',
    desc: 'Theo dõi nề nếp thi đua, chấm điểm việc tốt, vi phạm và sửa điểm cho các thành viên Tổ 3',
    scopeDesc: 'Chỉ nhập, sửa phần chấm điểm thi đua của Tổ 3',
    color: 'border-amber-500 bg-amber-50/70 text-amber-900',
    activeColor: 'ring-2 ring-amber-500 border-amber-600 bg-amber-100/80',
    iconType: 'team3',
  },
  {
    modeId: 'TEAM_LEADER_4',
    role: 'TEAM_LEADER',
    team: 4,
    title: 'Tổ Trưởng Tổ 4',
    badge: 'Tổ trưởng T4',
    defaultUsername: 'totruong4',
    allowedUsernames: ['totruong4', 'tt4', 'totruongto4', 'kiet', 'hs31'],
    password: 'TTT4@2026',
    name: 'Đoàn Tuấn Kiệt (Tổ trưởng Tổ 4)',
    desc: 'Theo dõi nề nếp thi đua, chấm điểm việc tốt, vi phạm và sửa điểm cho các thành viên Tổ 4',
    scopeDesc: 'Chỉ nhập, sửa phần chấm điểm thi đua của Tổ 4',
    color: 'border-purple-500 bg-purple-50/70 text-purple-900',
    activeColor: 'ring-2 ring-purple-500 border-purple-600 bg-purple-100/80',
    iconType: 'team4',
  },
];

export const findAccountByMode = (modeId: string): AuthAccountConfig | undefined => {
  return AUTH_ACCOUNTS.find((a) => a.modeId === modeId);
};

export const findAccountByUsername = (username: string): AuthAccountConfig | undefined => {
  const normalized = username.toLowerCase().trim();
  return AUTH_ACCOUNTS.find(
    (a) =>
      a.defaultUsername.toLowerCase() === normalized ||
      a.allowedUsernames.some((u) => u.toLowerCase() === normalized)
  );
};
