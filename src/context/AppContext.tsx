import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  Student,
  Criteria,
  ScoreLog,
  AppConfig,
  User,
  RoleType,
  LoginModeId,
  TeamStats,
  CriteriaType,
} from '../types';
import {
  INITIAL_CONFIG,
  INITIAL_CRITERIA,
  INITIAL_STUDENTS,
  INITIAL_LOGS,
} from '../data/initialData';
import {
  AUTH_ACCOUNTS,
  findAccountByMode,
  findAccountByUsername,
} from '../data/authAccounts';
import { soundManager } from '../utils/sound';
import { getStudentAvatar } from '../utils/avatar';
import {
  sendScoreLogToSheets,
  revertScoreLogOnSheets,
  testGoogleSheetsConnection,
  syncWholeDatasetToSheets,
} from '../services/googleSheetsService';

export interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title?: string;
  message: string;
}

export interface LoginResult {
  success: boolean;
  message: string;
}

interface AppContextType {
  user: User | null;
  students: Student[];
  criteria: Criteria[];
  logs: ScoreLog[];
  config: AppConfig;
  teamStats: TeamStats[];
  toasts: ToastItem[];
  isSyncing: boolean;
  syncStatus: 'offline' | 'local_only' | 'synced' | 'error';
  lastSyncTime: string | null;

  // Role & Permission Helpers
  isTeacher: boolean;
  isMonitor: boolean;
  isTeamLeader: boolean;
  userTeam?: number;
  canScoreStudent: (student: Student | number) => boolean;
  canRevertLog: (log: ScoreLog) => boolean;

  // Selected for inspection / modal
  selectedStudent: Student | null;
  setSelectedStudent: (student: Student | null) => void;
  selectedTeam: number | null;
  setSelectedTeam: (teamNum: number | null) => void;
  isQuickSearchOpen: boolean;
  setIsQuickSearchOpen: (open: boolean) => void;

  // Actions
  login: (modeIdOrUsername: string, password?: string, customUsername?: string) => LoginResult;
  logout: () => void;
  quickScore: (studentId: string, criteriaId: string, customNote?: string) => Promise<boolean>;
  revertLog: (logId: string) => Promise<boolean>;
  addStudent: (student: Omit<Student, 'id'>) => void;
  updateStudent: (student: Student) => void;
  deleteStudent: (studentId: string) => void;
  addCriteria: (criteria: Criteria) => void;
  updateCriteria: (criteria: Criteria) => void;
  deleteCriteria: (criteriaId: string) => void;
  importStudentsCSV: (csvText: string) => { success: boolean; count: number; error?: string };
  updateConfig: (newConfig: Partial<AppConfig>) => void;
  syncFromSheets: () => Promise<boolean>;
  syncToSheets: () => Promise<boolean>;
  resetWeeklyScores: (archiveOnly?: boolean) => void;
  addToast: (type: ToastItem['type'], message: string, title?: string) => void;
  removeToast: (id: string) => void;
  triggerConfetti: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USER: 'emulation_user',
  STUDENTS: 'emulation_students',
  CRITERIA: 'emulation_criteria',
  LOGS: 'emulation_logs',
  CONFIG: 'emulation_config',
  LAST_SYNC: 'emulation_last_sync',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Initial State from LocalStorage or Seed Data
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USER);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.role) {
          const modeId: LoginModeId =
            parsed.modeId ||
            (parsed.role === 'TEACHER'
              ? 'TEACHER'
              : parsed.role === 'MONITOR'
              ? 'MONITOR'
              : (`TEAM_LEADER_${parsed.team || 1}` as LoginModeId));
          const account = findAccountByMode(modeId);
          return {
            id: parsed.id || `USR_${modeId}`,
            username: parsed.username || (account ? account.defaultUsername : 'giaovien'),
            name: parsed.name || (account ? account.name : 'Cô Cao Thị Tình'),
            role: parsed.role,
            team: parsed.team,
            modeId,
          };
        }
      }
    } catch {
      // fallback
    }
    // Default logged in as Teacher for convenient demo/use out of the box
    return {
      id: 'USR_TEACHER',
      username: 'giaovien',
      name: 'Cô Cao Thị Tình',
      role: 'TEACHER',
      modeId: 'TEACHER',
    };
  });

  const [config, setConfig] = useState<AppConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CONFIG);
      if (saved) return { ...INITIAL_CONFIG, ...JSON.parse(saved) };
    } catch {}
    return INITIAL_CONFIG;
  });

  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STUDENTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map((s: Student) => ({
            ...s,
            avatar: s.avatar || getStudentAvatar(s),
          }));
        }
      }
    } catch {}
    return INITIAL_STUDENTS;
  });

  const [criteria, setCriteria] = useState<Criteria[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CRITERIA);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_CRITERIA;
  });

  const [logs, setLogs] = useState<ScoreLog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LOGS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_LOGS;
  });

  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<'offline' | 'local_only' | 'synced' | 'error'>(() => {
    return config.googleSheetScriptUrl ? 'synced' : 'local_only';
  });
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
  });

  // Modals & Navigation state
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);
  const [isQuickSearchOpen, setIsQuickSearchOpen] = useState<boolean>(false);

  // Synchronize sound settings with SoundManager
  useEffect(() => {
    soundManager.setMuted(!config.soundEnabled);
  }, [config.soundEnabled]);

  // Persist state to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CRITERIA, JSON.stringify(criteria));
  }, [criteria]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  }, [user]);

  // Toast Helper
  const addToast = useCallback((type: ToastItem['type'], message: string, title?: string) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, type, title, message }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const triggerConfetti = useCallback(() => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#dc2626', '#f59e0b', '#2563eb', '#10b981', '#a855f7'],
    });
  }, []);

  // Compute Team Stats
  const teamStats = useMemo<TeamStats[]>(() => {
    const teams = [1, 2, 3, 4].map((teamNum) => {
      const teamStudents = students.filter((s) => s.team === teamNum);
      const totalPoints = teamStudents.reduce((sum, s) => sum + s.points, 0);
      const avgPoints = teamStudents.length > 0 ? Math.round((totalPoints / teamStudents.length) * 10) / 10 : 0;
      
      const sortedInTeam = [...teamStudents].sort((a, b) => b.points - a.points);
      const topStudent = sortedInTeam.length > 0 ? sortedInTeam[0] : undefined;

      return {
        teamNumber: teamNum,
        teamName: `Tổ ${teamNum}`,
        totalPoints,
        avgPoints,
        studentCount: teamStudents.length,
        rank: 1, // Will calculate below
        topStudent,
      };
    });

    // Sort by avgPoints descending (or total points) to assign rank
    const sorted = [...teams].sort((a, b) => b.totalPoints - a.totalPoints);
    sorted.forEach((team, index) => {
      team.rank = index + 1;
    });

    // Return in team 1..4 order
    return teams.sort((a, b) => a.teamNumber - b.teamNumber);
  }, [students]);

  // Role & Permission Helpers
  const isTeacher = user?.role === 'TEACHER';
  const isMonitor = user?.role === 'MONITOR';
  const isTeamLeader = user?.role === 'TEAM_LEADER';
  const userTeam = user?.team;

  const canScoreStudent = useCallback(
    (studentOrTeam: Student | number): boolean => {
      if (!user) return false;
      if (user.role === 'TEACHER' || user.role === 'MONITOR') return true;
      const teamNum = typeof studentOrTeam === 'number' ? studentOrTeam : studentOrTeam.team;
      if (user.role === 'TEAM_LEADER') return user.team === teamNum;
      return false;
    },
    [user]
  );

  const canRevertLog = useCallback(
    (log: ScoreLog): boolean => {
      if (!user) return false;
      if (user.role === 'TEACHER' || user.role === 'MONITOR') return true;
      if (user.role === 'TEAM_LEADER') return user.team === log.team;
      return false;
    },
    [user]
  );

  // 6-Mode Authentication
  const login = (
    modeIdOrUsername: string,
    password = '',
    customUsername?: string
  ): LoginResult => {
    // 1. Identify target account
    let targetAccount = findAccountByMode(modeIdOrUsername);
    if (!targetAccount) {
      targetAccount = findAccountByUsername(customUsername || modeIdOrUsername);
    }

    if (!targetAccount) {
      const msg = 'Không tìm thấy tài khoản hoặc chế độ đăng nhập tương ứng.';
      addToast('error', msg, 'Đăng nhập thất bại');
      return { success: false, message: msg };
    }

    // 2. Exact password check
    const enteredPassword = password.trim();
    if (enteredPassword !== targetAccount.password) {
      const msg = `Mật khẩu không chính xác cho ${targetAccount.title}. Vui lòng kiểm tra lại.`;
      addToast('error', msg, 'Sai mật khẩu');
      soundManager.playBuzzer();
      return { success: false, message: msg };
    }

    // 3. Success! Set user session
    const username = customUsername?.trim() || targetAccount.defaultUsername;
    const newUser: User = {
      id: `USR_${targetAccount.modeId}`,
      username,
      name: targetAccount.name,
      role: targetAccount.role,
      team: targetAccount.team,
      modeId: targetAccount.modeId,
    };

    setUser(newUser);
    soundManager.playTing();
    addToast(
      'success',
      `Đăng nhập thành công với vai trò: ${targetAccount.title}! (${targetAccount.scopeDesc})`,
      'Đăng nhập thành công'
    );
    return { success: true, message: 'Đăng nhập thành công' };
  };

  const logout = () => {
    setUser(null);
    addToast('info', 'Bạn đã đăng xuất khỏi hệ thống.');
  };

  // CORE SCORING LOGIC
  const quickScore = async (
    studentId: string,
    criteriaId: string,
    customNote?: string
  ): Promise<boolean> => {
    const student = students.find((s) => s.id === studentId || s.code === studentId);
    if (!student) {
      addToast('error', 'Không tìm thấy học sinh', 'Lỗi chấm điểm');
      return false;
    }

    // Permission check: Team leader can only score their own team
    if (!canScoreStudent(student)) {
      addToast(
        'error',
        `Tổ trưởng Tổ ${user?.team} chỉ được phép chấm điểm cho học sinh thuộc Tổ ${user?.team}!`,
        'Quyền bị giới hạn'
      );
      soundManager.playBuzzer();
      return false;
    }

    const crit = criteria.find((c) => c.id === criteriaId);
    if (!crit) {
      addToast('error', 'Không tìm thấy tiêu chí', 'Lỗi chấm điểm');
      return false;
    }

    const pointChange = crit.type === 'plus' ? Math.abs(crit.points) : -Math.abs(crit.points);
    const newStudentPoints = student.points + pointChange;

    const operatorName = user ? user.name : 'Giáo viên';
    const operatorRole = user
      ? user.role === 'TEACHER'
        ? 'Giáo viên CN'
        : user.role === 'MONITOR'
        ? 'Lớp trưởng'
        : `Tổ trưởng Tổ ${user.team || 1}`
      : 'Giáo viên';

    const now = new Date();
    const formattedDate = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} ${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}`;

    const newLog: ScoreLog = {
      id: `LOG_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      timestamp: now.toISOString(),
      formattedDate,
      operator: operatorName,
      operatorRole,
      studentId: student.code,
      studentName: student.name,
      team: student.team,
      criteriaId: crit.id,
      criteriaName: crit.name,
      pointChange,
      type: crit.type,
      note: customNote || crit.description || '',
    };

    // 1. Update Student Points in state
    setStudents((prev) =>
      prev.map((s) => (s.id === student.id ? { ...s, points: newStudentPoints } : s))
    );

    // 2. Prepend Log in state
    setLogs((prev) => [newLog, ...prev]);

    // 3. Play sound & Toast
    if (crit.type === 'plus') {
      soundManager.playTing();
      addToast(
        'success',
        `Đã cộng ${Math.abs(pointChange)} điểm cho ${student.name} (${crit.name})`,
        '🟢 Việc tốt (+)'
      );
      if (newStudentPoints >= 130) {
        triggerConfetti();
        soundManager.playFanfare();
      }
    } else {
      soundManager.playBuzzer();
      addToast(
        'warning',
        `Đã trừ ${Math.abs(pointChange)} điểm của ${student.name} (${crit.name})`,
        '🔴 Vi phạm (-)'
      );
    }

    // 4. Background Sync with Google Sheets if configured
    if (config.googleSheetScriptUrl) {
      setIsSyncing(true);
      sendScoreLogToSheets(config.googleSheetScriptUrl, newLog)
        .then((res) => {
          if (res.success) {
            setSyncStatus('synced');
            setLastSyncTime(new Date().toLocaleTimeString('vi-VN'));
          } else {
            setSyncStatus('error');
            addToast('warning', `Lưu nội bộ thành công, chưa đẩy lên Sheets: ${res.message}`);
          }
        })
        .catch(() => {
          setSyncStatus('error');
        })
        .finally(() => {
          setIsSyncing(false);
        });
    }

    return true;
  };

  // REVERT / CANCEL A SCORE
  const revertLog = async (logId: string): Promise<boolean> => {
    const logIndex = logs.findIndex((l) => l.id === logId);
    if (logIndex === -1) {
      addToast('error', 'Không tìm thấy dòng lịch sử để hoàn tác');
      return false;
    }

    const logToRevert = logs[logIndex];
    if (logToRevert.reverted) {
      addToast('warning', 'Thao tác này đã được hoàn tác trước đó.');
      return false;
    }

    // Permission check: Team leader can only revert logs for their own team
    if (!canRevertLog(logToRevert)) {
      addToast(
        'error',
        `Tổ trưởng Tổ ${user?.team} chỉ được sửa/hủy chấm điểm của học sinh thuộc Tổ ${user?.team}!`,
        'Quyền bị giới hạn'
      );
      soundManager.playBuzzer();
      return false;
    }

    // Refund points: subtract the pointChange (so if it was -5, subtract(-5) adds 5 back)
    const refundPoints = -logToRevert.pointChange;

    setStudents((prev) =>
      prev.map((s) => {
        if (s.code === logToRevert.studentId || s.id === logToRevert.studentId) {
          return { ...s, points: s.points + refundPoints };
        }
        return s;
      })
    );

    // Mark log as reverted or remove
    setLogs((prev) => prev.filter((l) => l.id !== logId));

    soundManager.playTing();
    addToast(
      'success',
      `Đã hủy thao tác chấm điểm. Điểm của ${logToRevert.studentName} đã được khôi phục (${refundPoints > 0 ? '+' : ''}${refundPoints} điểm).`,
      'Hoàn tác thành công'
    );

    // Sync to Sheets
    if (config.googleSheetScriptUrl) {
      setIsSyncing(true);
      revertScoreLogOnSheets(config.googleSheetScriptUrl, logId)
        .then((res) => {
          if (res.success) {
            setSyncStatus('synced');
          }
        })
        .finally(() => setIsSyncing(false));
    }

    return true;
  };

  // Student CRUD
  const addStudent = (newS: Omit<Student, 'id'>) => {
    const id = newS.code || `HS${(students.length + 1).toString().padStart(2, '0')}`;
    const studentWithId: Student = {
      ...newS,
      id,
      code: newS.code || id,
      points: Number(newS.points) || config.startingPoints || 100,
    };
    setStudents((prev) => [...prev, studentWithId]);
    addToast('success', `Đã thêm học sinh ${studentWithId.name} vào Tổ ${studentWithId.team}!`);
    soundManager.playTing();
  };

  const updateStudent = (updatedStudent: Student) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === updatedStudent.id ? updatedStudent : s))
    );
    addToast('success', `Đã cập nhật thông tin học sinh ${updatedStudent.name}`);
  };

  const deleteStudent = (studentId: string) => {
    const target = students.find((s) => s.id === studentId);
    setStudents((prev) => prev.filter((s) => s.id !== studentId));
    addToast('info', `Đã xóa học sinh ${target ? target.name : studentId} khỏi danh sách.`);
  };

  // Criteria CRUD
  const addCriteria = (crit: Criteria) => {
    const id = crit.id || `TC_${crit.type.toUpperCase()}_${Date.now().toString().slice(-4)}`;
    const newCrit: Criteria = { ...crit, id };
    setCriteria((prev) => [...prev, newCrit]);
    addToast('success', `Đã thêm tiêu chí mới: "${newCrit.name}" (${newCrit.type === 'plus' ? '+' : '-'}${newCrit.points}đ)`);
    soundManager.playTing();
  };

  const updateCriteria = (updatedCrit: Criteria) => {
    setCriteria((prev) =>
      prev.map((c) => (c.id === updatedCrit.id ? updatedCrit : c))
    );
    addToast('success', `Đã cập nhật tiêu chí "${updatedCrit.name}"`);
  };

  const deleteCriteria = (criteriaId: string) => {
    const target = criteria.find((c) => c.id === criteriaId);
    setCriteria((prev) => prev.filter((c) => c.id !== criteriaId));
    addToast('info', `Đã xóa tiêu chí: ${target ? target.name : criteriaId}`);
  };

  // CSV Import
  const importStudentsCSV = (csvText: string): { success: boolean; count: number; error?: string } => {
    try {
      const lines = csvText.trim().split('\n');
      if (lines.length <= 1) {
        return { success: false, count: 0, error: 'Dữ liệu CSV rỗng hoặc chỉ có dòng tiêu đề.' };
      }

      const importedList: Student[] = [];
      const startIndex = lines[0].toLowerCase().includes('ma') || lines[0].toLowerCase().includes('tên') ? 1 : 0;

      for (let i = startIndex; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const cols = line.split(',').map((c) => c.trim().replace(/^["']|["']$/g, ''));
        if (cols.length >= 2) {
          const code = cols[0] || `HS${(i + 1).toString().padStart(2, '0')}`;
          const name = cols[1];
          const team = Number(cols[2]) || (i % 4) + 1;
          const points = Number(cols[3]) || config.startingPoints || 100;
          const role = cols[4] || 'Thành viên';
          const gender = (cols[5]?.toLowerCase().includes('nữ') || cols[5]?.toLowerCase() === 'f' || cols[5]?.toLowerCase() === 'nu') ? 'nu' : 'nam';

          importedList.push({
            id: code,
            code,
            name,
            team: team >= 1 && team <= 4 ? team : 1,
            points,
            role,
            gender,
            prevRank: i + 1,
          });
        }
      }

      if (importedList.length === 0) {
        return { success: false, count: 0, error: 'Không đọc được dòng học sinh nào từ file.' };
      }

      setStudents(importedList);
      addToast('success', `Đã import thành công ${importedList.length} học sinh vào lớp!`, 'Nhập dữ liệu thành công');
      soundManager.playFanfare();
      return { success: true, count: importedList.length };
    } catch (err) {
      return { success: false, count: 0, error: String(err) };
    }
  };

  // App Config Update
  const updateConfig = (newCfg: Partial<AppConfig>) => {
    setConfig((prev) => ({ ...prev, ...newCfg }));
    addToast('success', 'Đã lưu cấu hình hệ thống');
  };

  // Bi-directional Sync
  const syncFromSheets = async (): Promise<boolean> => {
    if (!config.googleSheetScriptUrl) {
      addToast('error', 'Chưa điền URL Google Apps Script. Vui lòng vào Cài đặt để cấu hình.');
      return false;
    }

    setIsSyncing(true);
    try {
      const res = await testGoogleSheetsConnection(config.googleSheetScriptUrl);
      if (res.success && res.data) {
        if (res.data.students && res.data.students.length > 0) {
          setStudents(res.data.students);
        }
        if (res.data.criteria && res.data.criteria.length > 0) {
          setCriteria(res.data.criteria);
        }
        if (res.data.logs) {
          setLogs(res.data.logs);
        }
        const timeStr = new Date().toLocaleTimeString('vi-VN');
        setLastSyncTime(timeStr);
        localStorage.setItem(STORAGE_KEYS.LAST_SYNC, timeStr);
        setSyncStatus('synced');
        addToast('success', 'Đã tải và đồng bộ toàn bộ dữ liệu mới nhất từ Google Sheets!');
        soundManager.playTing();
        return true;
      } else {
        setSyncStatus('error');
        addToast('error', res.message || 'Không thể đồng bộ từ Google Sheets');
        return false;
      }
    } catch (err) {
      setSyncStatus('error');
      addToast('error', String(err));
      return false;
    } finally {
      setIsSyncing(false);
    }
  };

  const syncToSheets = async (): Promise<boolean> => {
    if (!config.googleSheetScriptUrl) {
      addToast('error', 'Chưa điền URL Google Apps Script.');
      return false;
    }

    setIsSyncing(true);
    try {
      const res = await syncWholeDatasetToSheets(config.googleSheetScriptUrl, {
        students,
        criteria,
      });
      if (res.success) {
        const timeStr = new Date().toLocaleTimeString('vi-VN');
        setLastSyncTime(timeStr);
        localStorage.setItem(STORAGE_KEYS.LAST_SYNC, timeStr);
        setSyncStatus('synced');
        addToast('success', 'Đã đẩy toàn bộ danh sách học sinh & tiêu chí lên Google Sheets!');
        soundManager.playTing();
        return true;
      } else {
        setSyncStatus('error');
        addToast('error', res.message);
        return false;
      }
    } catch (err) {
      setSyncStatus('error');
      addToast('error', String(err));
      return false;
    } finally {
      setIsSyncing(false);
    }
  };

  // Reset / Archive Weekly
  const resetWeeklyScores = (archiveOnly = false) => {
    // Increment week number
    const nextWeek = config.currentWeek + 1;
    setConfig((prev) => ({ ...prev, currentWeek: nextWeek }));

    if (!archiveOnly) {
      // Reset student points to base points (e.g. 100)
      const basePoints = config.startingPoints || 100;
      setStudents((prev) =>
        prev.map((s) => ({
          ...s,
          prevRank: undefined,
          points: basePoints,
        }))
      );
      addToast(
        'success',
        `Đã chốt tuần ${config.currentWeek} và làm mới điểm sang Tuần ${nextWeek} (Khởi điểm: ${basePoints}đ)!`,
        'Chốt điểm tuần mới'
      );
    } else {
      addToast('info', `Đã lưu trữ số liệu tuần ${config.currentWeek}. Điểm số giữ nguyên tiếp tục tích lũy sang Tuần ${nextWeek}.`);
    }
    soundManager.playFanfare();
  };

  return (
    <AppContext.Provider
      value={{
        user,
        students,
        criteria,
        logs,
        config,
        teamStats,
        toasts,
        isSyncing,
        syncStatus,
        lastSyncTime,

        // Role & Permission Helpers
        isTeacher,
        isMonitor,
        isTeamLeader,
        userTeam,
        canScoreStudent,
        canRevertLog,

        selectedStudent,
        setSelectedStudent,
        selectedTeam,
        setSelectedTeam,
        isQuickSearchOpen,
        setIsQuickSearchOpen,

        login,
        logout,
        quickScore,
        revertLog,
        addStudent,
        updateStudent,
        deleteStudent,
        addCriteria,
        updateCriteria,
        deleteCriteria,
        importStudentsCSV,
        updateConfig,
        syncFromSheets,
        syncToSheets,
        resetWeeklyScores,
        addToast,
        removeToast,
        triggerConfetti,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
