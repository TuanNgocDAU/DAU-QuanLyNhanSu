import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { ChucVu } from '../types';
import { Plus, Pencil, Trash2, Search, X, Save, FileDown, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx'; // Import xlsx library

export const DanhMucChucVuManagement: React.FC = () => {
  const [chucVuList, setChucVuList] = useState<ChucVu[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentChucVu, setCurrentChucVu] = useState<ChucVu | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalError, setModalError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchChucVu = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('DanhMucChucVu').select('*').order('id', { ascending: true });
    if (error) {
      alert('Lỗi khi tải danh mục Chức vụ: ' + error.message);
    } else {
      setChucVuList(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchChucVu();
  }, []);

  const generateNewMaChucVu = async () => {
    const { data, error } = await supabase.from('DanhMucChucVu').select('machucvu');
    if (error) {
      console.error('Error fetching existing machucvu:', error.message);
      return 'CV001'; // Default fallback
    }

    const existingCodes = data
      .map(item => String(item.machucvu || '')) // Ensure it's a string, converting null/undefined to ''
      .filter(code => code.startsWith('CV') && !isNaN(parseInt(code.substring(2))))
      .map(code => parseInt(code.substring(2)));

    const maxNum = existingCodes.length > 0 ? Math.max(...existingCodes) : 0;
    const newNum = maxNum + 1;
    return `CV${String(newNum).padStart(3, '0')}`;
  };

  const handleOpenAdd = async () => {
    setModalError(null);
    setIsEditing(false);
    const newMaChucVu = await generateNewMaChucVu();
    setCurrentChucVu({ id: 0, machucvu: newMaChucVu, giatri: '' }); // id will be ignored by Supabase for insert
    setIsModalOpen(true);
  };

  const handleOpenEdit = (chucVu: ChucVu) => {
    setModalError(null);
    setIsEditing(true);
    setCurrentChucVu(chucVu);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentChucVu) return;

    setSaving(true);
    setModalError(null);

    // Validate if giatri is not empty
    if (!currentChucVu.giatri.trim()) {
      setModalError('Giá trị không được để trống.');
      setSaving(false);
      return;
    }

    // Check for duplicate machucvu or giatri (only for new entries or if changed for existing)
    // Explicitly cast to String to prevent TypeError if machucvu/giatri is not a string
    const isMaChucVuDuplicate = chucVuList.some(cv => 
        String(cv.machucvu || '') === String(currentChucVu.machucvu || '') && (!isEditing || cv.id !== currentChucVu.id)
    );
    const isGiaTriDuplicate = chucVuList.some(cv => 
        String(cv.giatri || '').toLowerCase().trim() === String(currentChucVu.giatri || '').toLowerCase().trim() && (!isEditing || cv.id !== currentChucVu.id)
    );

    if (isMaChucVuDuplicate) {
        setModalError('Mã chức vụ đã tồn tại. Vui lòng chọn mã khác.');
        setSaving(false);
        return;
    }
    if (isGiaTriDuplicate) {
        setModalError('Giá trị chức vụ đã tồn tại. Vui lòng nhập giá trị khác.');
        setSaving(false);
        return;
    }


    if (isEditing) {
      const { id, ...updates } = currentChucVu; // Exclude ID from updates payload
      const { error } = await supabase
        .from('DanhMucChucVu')
        .update(updates)
        .eq('id', id);

      if (error) {
        setModalError('Cập nhật thất bại: ' + error.message);
      } else {
        setIsModalOpen(false);
        fetchChucVu();
      }
    } else {
      // Add new
      const { error } = await supabase.from('DanhMucChucVu').insert([currentChucVu]);
      if (error) {
        setModalError('Thêm mới thất bại: ' + error.message);
      } else {
        setIsModalOpen(false);
        fetchChucVu();
      }
    }
    setSaving(false);
  };

  const handleDelete = async (id: number, machucvu: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa chức vụ ${machucvu} này không?`)) {
      const { error } = await supabase.from('DanhMucChucVu').delete().eq('id', id);
      if (error) {
        alert('Xóa thất bại: ' + error.message);
      } else {
        fetchChucVu();
      }
    }
  };

  const handleExportExcel = () => {
    const dataToExport = filteredChucVu.map(cv => ({
      ID: cv.id,
      'Mã Chức vụ': cv.machucvu,
      'Giá Trị': cv.giatri,
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Danh mục Chức vụ");

    // Ensure UTF-8 BOM for Vietnamese characters in XLSX
    // XLSX library handles BOM for .xlsx format by default.
    XLSX.writeFile(wb, "DanhMucChucVu.xlsx");
  };

  const filteredChucVu = chucVuList.filter(cv => {
    if (!cv) return false; // Ensure cv itself is not null/undefined
    const maChucVu = String(cv.machucvu || '').toLowerCase();
    const giaTri = String(cv.giatri || '').toLowerCase();
    const lowerSearchTerm = searchTerm.toLowerCase();
  
    return maChucVu.includes(lowerSearchTerm) || giaTri.includes(lowerSearchTerm);
  });

  return (
    <div className="max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Quản lý Danh mục Chức vụ</h2>
      
      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <div className="relative w-full sm:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Tìm kiếm theo mã hoặc giá trị chức vụ..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex space-x-2 w-full sm:w-auto">
          <button
            onClick={handleOpenAdd}
            className="flex-1 sm:flex-none flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Thêm mới
          </button>
          <button
            onClick={handleExportExcel}
            className="flex-1 sm:flex-none flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-blue-800 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FileDown className="h-4 w-4 mr-2" />
            Xuất Excel
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow overflow-hidden rounded-lg border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã Chức vụ</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giá Trị</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-sm text-gray-500">Đang tải dữ liệu...</td>
                </tr>
              ) : filteredChucVu.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-sm text-gray-500">Không tìm thấy chức vụ nào.</td>
                </tr>
              ) : (
                filteredChucVu.map((cv) => (
                  <tr key={cv.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{cv.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{cv.machucvu}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{cv.giatri}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => handleOpenEdit(cv)} className="text-indigo-600 hover:text-indigo-900 mr-4">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(cv.id, cv.machucvu)} className="text-red-600 hover:text-red-900">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form for Add/Edit */}
      {isModalOpen && currentChucVu && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900 bg-opacity-50">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full">
              <form onSubmit={handleSave}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex justify-between items-center mb-5 border-b pb-2">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {isEditing ? 'Hiệu Chỉnh Chức vụ' : 'Thêm Mới Chức vụ'}
                    </h3>
                    <button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Mã Chức vụ</label>
                      <input 
                        type="text" 
                        required 
                        disabled={isEditing} // machucvu is readonly when editing
                        value={currentChucVu.machucvu} 
                        onChange={e => setCurrentChucVu({...currentChucVu, machucvu: e.target.value})} 
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Giá Trị</label>
                      <input 
                        type="text" 
                        required 
                        value={currentChucVu.giatri} 
                        onChange={e => setCurrentChucVu({...currentChucVu, giatri: e.target.value})} 
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" 
                      />
                    </div>
                  </div>

                  {modalError && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded mt-4 flex items-center">
                      <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
                      <p className="text-sm text-red-700 font-medium">{modalError}</p>
                    </div>
                  )}

                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button type="submit" disabled={saving} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50">
                    {saving ? 'Đang lưu...' : 'Lưu Thông Tin'}
                  </button>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                    Hủy Bỏ
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};