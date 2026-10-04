import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Upload,
  Download,
  Edit2,
  Trash2,
  Eye,
  Zap,
  Check,
  X,
  FileSpreadsheet,
  Pencil,
  Camera,
  FolderOpen,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Student } from '../types';
import { StudentAvatar } from '../components/StudentAvatar';
import { AvatarUploadModal } from '../components/AvatarUploadModal';

interface StudentsPageProps {
  onSelectStudent: (student: Student) => void;
  onQuickScore: (student: Student) => void;
}

export const StudentsPage: React.FC<StudentsPageProps> = ({
  onSelectStudent,
  onQuickScore,
}) => {
  const {
    students,
    addStudent,
    updateStudent,
    deleteStudent,
    importStudentsCSV,
    user,
    config,
    addToast,
    isTeacher,
    isMonitor,
    isTeamLeader,
    userTeam,
    canScoreStudent,
  } = useApp();

  const [search, setSearch] = useState('');
  const [teamFilter, setTeamFilter] = useState<number | 'ALL'>(
    isTeamLeader && userTeam ? userTeam : 'ALL'
  );
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [csvInput, setCsvInput] = useState('');

  // Avatar Modal State for uploading custom photo
  const [avatarModalStudent, setAvatarModalStudent] = useState<Student | null>(null);

  // Form state for Add/Edit
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    team: 1,
    points: 100,
    role: 'Thành viên',
    gender: 'nam' as 'nam' | 'nu',
    avatar: '',
  });

  // Filter students
  const filteredStudents = students.filter((s) => {
    const matchesTeam = teamFilter === 'ALL' || s.team === teamFilter;
    const q = search.toLowerCase().trim();
    const matchesSearch = !q || s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q);
    return matchesTeam && matchesSearch;
  });

  const handleOpenAdd = () => {
    const nextNum = students.length + 1;
    const nextCode = `HS${nextNum.toString().padStart(2, '0')}`;
    setFormData({
      code: nextCode,
      name: '',
      team: 1,
      points: config.startingPoints || 100,
      role: 'Thành viên',
      gender: 'nam',
      avatar: '',
    });
    setEditingStudent(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (student: Student) => {
    setFormData({
      code: student.code,
      name: student.name,
      team: student.team,
      points: student.points,
      role: student.role || 'Thành viên',
      gender: student.gender,
      avatar: student.avatar || '',
    });
    setEditingStudent(student);
    setIsAddModalOpen(true);
  };

  const handleOpenAvatarModal = (student: Student) => {
    setAvatarModalStudent(student);
  };

  const handleSaveAvatar = (newAvatarUrl: string | undefined) => {
    if (!avatarModalStudent) return;
    updateStudent({
      ...avatarModalStudent,
      avatar: newAvatarUrl,
    });
    if (newAvatarUrl) {
      addToast('success', `Đã cập nhật ảnh đại diện cho học sinh ${avatarModalStudent.name}!`);
    } else {
      addToast('info', `Đã đặt lại ảnh đại diện mặc định cho học sinh ${avatarModalStudent.name}.`);
    }
    setAvatarModalStudent(null);
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingStudent) {
      updateStudent({
        ...editingStudent,
        code: formData.code.trim(),
        name: formData.name.trim(),
        team: Number(formData.team),
        points: Number(formData.points),
        role: formData.role,
        gender: formData.gender,
      });
    } else {
      addStudent({
        code: formData.code.trim(),
        name: formData.name.trim(),
        team: Number(formData.team),
        points: Number(formData.points),
        role: formData.role,
        gender: formData.gender,
      });
    }

    setIsAddModalOpen(false);
  };

  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvInput.trim()) return;

    const res = importStudentsCSV(csvInput);
    if (res.success) {
      setIsImportModalOpen(false);
      setCsvInput('');
    }
  };

  const handleExportCSV = () => {
    const headers = ['Mã HS,Họ và Tên,Tổ,Tổng Điểm,Chức Vụ,Giới Tính'];
    const rows = students.map(
      (s) => `"${s.code}","${s.name}",${s.team},${s.points},"${s.role || 'Thành viên'}","${s.gender === 'nu' ? 'Nữ' : 'Nam'}"`
    );
    const content = '\uFEFF' + [headers, ...rows].join('\n'); // UTF-8 BOM for Excel
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Danh_Sach_Hoc_Sinh_${config.className.replace(/\s+/g, '_')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-3xl bg-linear-to-r from-blue-700 via-indigo-700 to-purple-800 p-6 text-white shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
            <Users className="h-3.5 w-3.5" />
            <span>Hồ Sơ Nề Nếp</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black mt-2 tracking-tight">
            Quản Lý Học Sinh {config.className}
          </h2>
          <p className="text-xs sm:text-sm text-blue-100 mt-1">
            Tổng số: {students.length} học sinh • 4 Tổ thi đua • Cập nhật điểm liên tục
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isTeacher && (
            <>
              <button
                onClick={() => setIsImportModalOpen(true)}
                className="flex items-center gap-1.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 px-3.5 py-2 text-xs font-bold text-white active:scale-95 transition-all cursor-pointer"
              >
                <Upload className="h-4 w-4" />
                <span>Nhập Excel/CSV</span>
              </button>
              <button
                onClick={handleOpenAdd}
                className="flex items-center gap-1.5 rounded-2xl bg-white px-4 py-2 text-xs font-black text-blue-900 shadow-md hover:bg-blue-50 active:scale-95 transition-all cursor-pointer"
              >
                <UserPlus className="h-4 w-4" />
                <span>Thêm Học Sinh</span>
              </button>
            </>
          )}

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 px-3.5 py-2 text-xs font-bold text-white active:scale-95 transition-all cursor-pointer"
            title="Xuất file CSV/Excel"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Xuất CSV</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xs">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {(['ALL', 1, 2, 3, 4] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTeamFilter(t)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold shrink-0 transition-all ${
                teamFilter === t
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t === 'ALL' ? 'Tất cả 4 Tổ' : `Tổ ${t}`}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo tên hoặc mã HS..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-3 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-hidden"
          />
        </div>
      </div>

      {/* Student Table */}
      <div className="rounded-3xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4 sm:px-6">Mã HS</th>
                <th className="py-3.5 px-4">Họ và Tên</th>
                <th className="py-3.5 px-4">Tổ</th>
                <th className="py-3.5 px-4">Chức vụ</th>
                <th className="py-3.5 px-4 text-center">Tổng Điểm</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 sm:px-6 font-mono font-bold text-slate-600">
                    {student.code}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900">
                    <div className="flex items-center gap-3">
                      {/* Avatar with edit pen icon button */}
                      <StudentAvatar
                        student={student}
                        size="md"
                        showEditButton={true}
                        onEditClick={() => handleOpenAvatarModal(student)}
                        onClick={() => onSelectStudent(student)}
                        title={`Xem hồ sơ ${student.name} • Bấm bút để đổi ảnh`}
                      />

                      {/* Name & Quick preview */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span
                            onClick={() => onSelectStudent(student)}
                            className="truncate font-bold text-slate-900 hover:text-blue-600 cursor-pointer transition-colors text-xs sm:text-sm"
                          >
                            {student.name}
                          </span>
                        </div>
                        <span className="text-[11px] font-mono text-slate-400 block mt-0.5">
                          {student.code}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 font-bold text-slate-700">
                      Tổ {student.team}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    {student.role && student.role !== 'Thành viên' ? (
                      <span className="rounded-md bg-amber-50 border border-amber-200 px-2 py-0.5 font-bold text-amber-800">
                        {student.role}
                      </span>
                    ) : (
                      'Thành viên'
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-block font-black text-sm px-2.5 py-0.5 rounded-lg ${
                        student.points >= 115
                          ? 'bg-emerald-100 text-emerald-800'
                          : student.points < 90
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      {student.points} đ
                    </span>
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => {
                          if (canScoreStudent(student)) {
                            onQuickScore(student);
                          } else {
                            addToast(
                              'warning',
                              `Bạn là Tổ trưởng Tổ ${userTeam}, chỉ được chấm điểm cho thành viên Tổ ${userTeam}. Học sinh ${student.name} thuộc Tổ ${student.team}!`,
                              'Quyền bị giới hạn'
                            );
                          }
                        }}
                        className={`rounded-lg p-1.5 transition-colors ${
                          canScoreStudent(student)
                            ? 'text-slate-500 hover:bg-red-50 hover:text-red-600 cursor-pointer'
                            : 'text-slate-300 hover:bg-slate-100 cursor-not-allowed opacity-40'
                        }`}
                        title={
                          canScoreStudent(student)
                            ? `Chấm điểm cho ${student.name}`
                            : `Chỉ Tổ trưởng Tổ ${student.team} hoặc Lớp trưởng/GVCN mới được chấm`
                        }
                      >
                        <Zap className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onSelectStudent(student)}
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        title="Xem hồ sơ"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {isTeacher && (
                        <>
                          <button
                            onClick={() => handleOpenEdit(student)}
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-amber-50 hover:text-amber-600 transition-colors"
                            title="Sửa thông tin"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Bạn có chắc chắn muốn xóa học sinh "${student.name}"?`)) {
                                deleteStudent(student.id);
                              }
                            }}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                            title="Xóa học sinh"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD / EDIT STUDENT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="w-full max-w-md rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
              <h3 className="text-base font-bold text-slate-900">
                {editingStudent ? 'Sửa Thông Tin Học Sinh' : 'Thêm Học Sinh Mới'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Mã HS
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Tổ
                  </label>
                  <select
                    value={formData.team}
                    onChange={(e) => setFormData({ ...formData, team: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold"
                  >
                    <option value={1}>Tổ 1</option>
                    <option value={2}>Tổ 2</option>
                    <option value={3}>Tổ 3</option>
                    <option value={4}>Tổ 4</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Họ và Tên
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nguyễn Văn An"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Chức vụ
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                  >
                    <option value="Thành viên">Thành viên</option>
                    <option value="Lớp trưởng">Lớp trưởng</option>
                    <option value="Lớp phó Học tập">Lớp phó Học tập</option>
                    <option value="Lớp phó Văn thể">Lớp phó Văn thể</option>
                    <option value="Tổ trưởng">Tổ trưởng</option>
                    <option value="Cờ đỏ">Cờ đỏ</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Giới tính
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) =>
                      setFormData({ ...formData, gender: e.target.value as 'nam' | 'nu' })
                    }
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                  >
                    <option value="nam">Nam</option>
                    <option value="nu">Nữ</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Điểm số hiện tại
                </label>
                <input
                  type="number"
                  value={formData.points}
                  onChange={(e) => setFormData({ ...formData, points: Number(e.target.value) })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow-md"
                >
                  {editingStudent ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AVATAR UPLOAD POPUP MODAL */}
      <AvatarUploadModal
        student={avatarModalStudent}
        isOpen={!!avatarModalStudent}
        onClose={() => setAvatarModalStudent(null)}
        onSaveAvatar={handleSaveAvatar}
      />
    </div>
  );
};
