import React, { useState } from 'react';
import {
  ClipboardList,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Edit2,
  Trash2,
  X,
  Filter,
  Layers,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Criteria, CriteriaType } from '../types';

export const CriteriaPage: React.FC = () => {
  const { criteria, addCriteria, updateCriteria, deleteCriteria, user } = useApp();

  const [activeTab, setActiveTab] = useState<CriteriaType>('plus');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCriteria, setEditingCriteria] = useState<Criteria | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    type: 'plus' as CriteriaType,
    points: 5,
    category: 'Học tập' as Criteria['category'],
    description: '',
  });

  const isTeacher = user?.role === 'TEACHER';

  const filteredCriteria = criteria.filter((c) => c.type === activeTab);

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      type: activeTab,
      points: activeTab === 'plus' ? 5 : 5,
      category: 'Kỷ luật & Nề nếp',
      description: '',
    });
    setEditingCriteria(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (crit: Criteria) => {
    setFormData({
      name: crit.name,
      type: crit.type,
      points: crit.points,
      category: crit.category,
      description: crit.description || '',
    });
    setEditingCriteria(crit);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingCriteria) {
      updateCriteria({
        ...editingCriteria,
        name: formData.name.trim(),
        type: formData.type,
        points: Number(formData.points),
        category: formData.category,
        description: formData.description.trim(),
      });
    } else {
      addCriteria({
        id: `TC_${formData.type.toUpperCase()}_${Date.now().toString().slice(-4)}`,
        name: formData.name.trim(),
        type: formData.type,
        points: Number(formData.points),
        category: formData.category,
        description: formData.description.trim(),
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-3xl bg-linear-to-r from-emerald-600 via-teal-600 to-cyan-700 p-6 text-white shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
            <ClipboardList className="h-3.5 w-3.5" />
            <span>Nội Quy & Tiêu Chuẩn</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black mt-2 tracking-tight">
            Danh Mục Tiêu Chí Thi Đua
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100 mt-1">
            Quy định các hành vi việc tốt được cộng điểm và các lỗi vi phạm bị trừ điểm của lớp
          </p>
        </div>

        {isTeacher && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-xs font-black text-emerald-800 shadow-md hover:bg-emerald-50 active:scale-95 transition-all self-start sm:self-auto cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Thêm Tiêu Chí Mới</span>
          </button>
        )}
      </div>

      {/* TABS: ĐIỂM CỘNG (+) / ĐIỂM TRỪ (-) */}
      <div className="flex border-b border-slate-200 gap-4">
        <button
          onClick={() => setActiveTab('plus')}
          className={`flex items-center gap-2 pb-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'plus'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>🟢 ĐIỂM CỘNG (VIỆC TỐT)</span>
          <span className="rounded-full bg-emerald-100 px-2 py-0.2 text-xs text-emerald-800">
            {criteria.filter((c) => c.type === 'plus').length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('minus')}
          className={`flex items-center gap-2 pb-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'minus'
              ? 'border-rose-600 text-rose-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <AlertTriangle className="h-4 w-4 text-rose-600" />
          <span>🔴 ĐIỂM TRỪ (LỖI VI PHẠM)</span>
          <span className="rounded-full bg-rose-100 px-2 py-0.2 text-xs text-rose-800">
            {criteria.filter((c) => c.type === 'minus').length}
          </span>
        </button>
      </div>

      {/* Criteria Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCriteria.map((crit) => (
          <div
            key={crit.id}
            className={`flex flex-col justify-between rounded-3xl p-5 border-2 transition-all hover:shadow-md bg-white ${
              crit.type === 'plus'
                ? 'border-emerald-100 hover:border-emerald-300'
                : 'border-rose-100 hover:border-rose-300'
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-600">
                  {crit.category}
                </span>
                <span
                  className={`text-sm font-black px-2.5 py-0.5 rounded-xl ${
                    crit.type === 'plus'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {crit.type === 'plus' ? `+${crit.points}` : `-${crit.points}`} đ
                </span>
              </div>

              <h4 className="text-sm font-bold text-slate-900 mt-2.5 leading-snug">
                {crit.name}
              </h4>
              {crit.description && (
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {crit.description}
                </p>
              )}
            </div>

            {isTeacher && (
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <span className="font-mono text-[10px]">{crit.id}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(crit)}
                    className="p-1 rounded-md hover:bg-slate-100 text-slate-600 hover:text-blue-600 transition-colors"
                    title="Chỉnh sửa"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Bạn có chắc chắn muốn xóa tiêu chí "${crit.name}"?`)) {
                        deleteCriteria(crit.id);
                      }
                    }}
                    className="p-1 rounded-md hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                    title="Xóa"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ADD / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="w-full max-w-md rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
              <h3 className="text-base font-bold text-slate-900">
                {editingCriteria ? 'Sửa Tiêu Chí Thi Đua' : 'Thêm Tiêu Chí Thi Đua Mới'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Loại tiêu chí
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'plus' })}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                      formData.type === 'plus'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    🟢 Việc tốt (Cộng điểm)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'minus' })}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                      formData.type === 'minus'
                        ? 'border-rose-600 bg-rose-50 text-rose-800'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    🔴 Vi phạm (Trừ điểm)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Tên tiêu chí (Hành vi)
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Mặc sai đồng phục / Không thuộc bài / Xung phong..."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Số điểm ({formData.type === 'plus' ? '+' : '-'})
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={100}
                    value={formData.points}
                    onChange={(e) => setFormData({ ...formData, points: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-black text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Danh mục
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        category: e.target.value as Criteria['category'],
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                  >
                    <option value="Học tập">Học tập</option>
                    <option value="Kỷ luật & Nề nếp">Kỷ luật & Nề nếp</option>
                    <option value="Đồng phục">Đồng phục</option>
                    <option value="Vệ sinh & Lao động">Vệ sinh & Lao động</option>
                    <option value="Phong trào & Hoạt động">Phong trào & Hoạt động</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Mô tả / Hướng dẫn áp dụng
                </label>
                <textarea
                  rows={2}
                  placeholder="Chi tiết khi nào áp dụng..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-md"
                >
                  {editingCriteria ? 'Cập nhật' : 'Lưu tiêu chí'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
