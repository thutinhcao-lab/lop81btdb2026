export type RoleType = 'TEACHER' | 'MONITOR' | 'RED_FLAG' | 'TEAM_LEADER';

export type LoginModeId =
  | 'TEACHER'
  | 'MONITOR'
  | 'TEAM_LEADER_1'
  | 'TEAM_LEADER_2'
  | 'TEAM_LEADER_3'
  | 'TEAM_LEADER_4';

export interface User {
  id: string;
  username: string;
  name: string;
  role: RoleType;
  team?: number; // 1, 2, 3, 4 for TEAM_LEADER
  modeId: LoginModeId;
}

export interface AuthAccountConfig {
  modeId: LoginModeId;
  role: RoleType;
  team?: number;
  title: string;
  badge: string;
  defaultUsername: string;
  allowedUsernames: string[];
  password: string;
  name: string;
  desc: string;
  scopeDesc: string;
  color: string;
  activeColor: string;
  iconType: 'crown' | 'monitor' | 'team1' | 'team2' | 'team3' | 'team4';
}

export interface Student {
  id: string;
  code: string; // MaHS e.g. HS01
  name: string; // HoTen
  team: number; // To: 1, 2, 3, 4
  points: number; // TongDiem
  prevRank?: number;
  role?: string; // Lớp trưởng, Tổ trưởng, Cờ đỏ, Thành viên
  gender: 'nam' | 'nu';
  avatar?: string;
  phone?: string;
  note?: string;
}

export type CriteriaType = 'plus' | 'minus';

export interface Criteria {
  id: string; // MaTieuChi
  name: string; // TenTieuChi
  type: CriteriaType; // 'plus' | 'minus'
  points: number; // Số điểm (always positive value in criteria, signed in log)
  category: 'Học tập' | 'Kỷ luật & Nề nếp' | 'Đồng phục' | 'Vệ sinh & Lao động' | 'Phong trào & Hoạt động';
  description?: string;
}

export interface ScoreLog {
  id: string; // ID
  timestamp: string; // ISO string
  formattedDate: string; // DD/MM/YYYY HH:mm
  operator: string; // NguoiCham
  operatorRole: string;
  studentId: string; // MaHS
  studentName: string;
  team: number;
  criteriaId: string; // MaTieuChi
  criteriaName: string;
  pointChange: number; // e.g. +5 or -10
  type: CriteriaType;
  note?: string;
  reverted?: boolean;
}

export interface AppConfig {
  className: string; // e.g. "Lớp 8/1"
  schoolYear: string; // e.g. "2024 - 2025"
  semester: string; // "Học kỳ 1" | "Học kỳ 2"
  currentWeek: number; // e.g. 8
  startingPoints: number; // e.g. 100 base points or 0
  googleSheetScriptUrl: string;
  soundEnabled: boolean;
  customLogoUrl?: string;
}

export interface TeamStats {
  teamNumber: number;
  teamName: string;
  totalPoints: number;
  avgPoints: number;
  studentCount: number;
  rank: number;
  topStudent?: Student;
}

export interface WeeklyArchive {
  weekNumber: number;
  date: string;
  topStudents: Student[];
  warningStudents: Student[];
  teamRankings: TeamStats[];
}
