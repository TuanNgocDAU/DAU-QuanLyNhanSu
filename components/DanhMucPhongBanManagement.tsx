import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { PhongBan } from '../types';
import { Plus, Pencil, Trash2, Search, X, Save, FileDown, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx'; // Import xlsx library

export const DanhMucPhongBanManagement: React.FC = () => {
  const [phongBanList, setPhongBanList] = useState<PhongBan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPhongBan, setCurrentPhongBan] = useState<PhongBan | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalError, setModalError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchPhongBan = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('DanhMucPhongBan').select('*').order('id', { ascending: true });
    if (error) {
      alert('Lỗi khi tải danh mục Khoa, Phòng: ' + error.message);
    } else {
      setPhongBanList(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPhongBan();
  }, []);

  const generateNewMaPhongBan = async () => {
    const { data, error } = await supabase.from('DanhMucPhongBan').select('maphongban');
    if (error) {
      console.error('Error fetching existing maphongban:', error.message);
      return 'PB001'; // Default fallback
    }

    const existingCodes = data
      .map(item => String(item.maphongban || '')) // Ensure it's a string, converting null/undefined to ''
      .filter(code => code.startsWith('PB') && !isNaN(parseInt(code.substring(2))))
      .map(code => parseInt(code.substring(2)));

    const maxNum = existingCodes.length > 0 ? Math.max(...existingCodes) : 0;
    const newNum = maxNum + 1;
    return `PB${String(newNum).padStart(3, '0')}`;
  };

  const handleOpenAdd = async () => {
    setModalError(null);
    setIsEditing(false);
    const newMaPhongBan = await generateNewMaPhongBan();
    setCurrentPhongBan({ id: 0, maphongban: newMaPhongBan, giatri: '', sapxep: 0 }); // id will be ignored by Supabase for insert
    setIsModalOpen(true);
  };

  const handleOpenEdit = (phongBan: PhongBan) => {
    setModalError(null);
    setIsEditing(true);
    setCurrentPhongBan(phongBan);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPhongBan) return;

    setSaving(true);
    setModalError(null);

    // Validate if giatri is not empty
    if (!currentPhongBan.giatri.trim()) {
      setModalError('Giá trị không được để trống.');
      setSaving(false);
      return;
    }

    // Check for duplicate maphongban or giatri (only for new entries or if changed for existing)
    const isMaPhongBanDuplicate = phongBanList.some(pb => 
        String(pb.maphongban || '') === String(currentPhongBan.maphongban || '') && (!isEditing || pb.id !== currentPhongBan.id)
    );
    const isGiaTriDuplicate = phongBanList.some(pb => 
        String(pb.giatri || '').toLowerCase().trim() === String(currentPhongBan.giatri || '').toLowerCase().trim() && (!isEditing || pb.id !== currentPhongBan.id)
    );

    if (isMaPhongBanDuplicate) {
        setModalError('Mã phòng ban đã tồn tại. Vui lòng chọn mã khác.');
        setSaving(false);
        return;
    }
    if (isGiaTriDuplicate) {
        setModalError('Giá trị phòng ban đã tồn tại. Vui lòng nhập giá trị khác.');
        setSaving(false);
        return;
    }


    if (isEditing) {
      const { id, ...updates } = currentPhongBan; // Exclude ID from updates payload
      const { error } = await supabase
        .from('DanhMucPhongBan')
        .update(updates)
        .eq('id', id);

      if (error) {
        setModalError('Cập nhật thất bại: ' + error.message);
      } else {
        setIsModalOpen(false);
        fetchPhongBan();
      }
    } else {
      // Add new
      const { error } = await supabase.from('DanhMucPhongBan').insert([currentPhongBan]);
      if (error) {
        setModalError('Thêm mới thất bại: ' + error.message);
      } else {
        setIsModalOpen(false);
        fetchPhongBan();
      }
    }
    setSaving(false);
  };

  const handleDelete = async (id: number, maphongban: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa Khoa/Phòng ${maphongban} này không?`)) {
      const { error } = await supabase.from('DanhMucPhongBan').delete().eq('id', id);
      if (error) {
        alert('Xóa thất bại: ' + error.message);
      } else {
        fetchPhongBan();
      }
    }
  };

  const handleExportExcel = () => {
    const dataToExport = filteredPhongBan.map(pb => ({
      ID: pb.id,
      'Mã Phòng ban': pb.maphongban,
      'Giá Trị': pb.giatri,
      'Sắp Xếp': pb.sapxep,
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "DanhMucPhongBan");

    XLSX.writeFile(wb, "DanhMucPhongBan.xlsx");
  };

  const filteredPhongBan = phongBanList.filter(pb => {
    if (!pb) return false;
    const maPhongBan = String(pb.maphongban || '').toLowerCase();
    const giaTri = String(pb.giatri || '').toLowerCase();
    const sapXep = String(pb.sapxep || '').toLowerCase(); // Convert number to string for search
    const lowerSearchTerm = searchTerm.toLowerCase();
  
    return maPhongBan.includes(lowerSearchTerm) || 
           giaTri.includes(lowerSearchTerm) || 
           sapXep.includes(lowerSearchTerm);
  });

  return (
    <div className="max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Quản lý Danh mục Khoa, Phòng</h2>
      
      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <div className="relative w-full sm:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Tìm kiếm theo mã, giá trị hoặc sắp xếp..."
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
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã Phòng ban</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giá Trị</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sắp Xếp</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-500">Đang tải dữ liệu...</td>
                </tr>
              ) : filteredPhongBan.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-500">Không tìm thấy Khoa, Phòng nào.</td>
                </tr>
              ) : (
                filteredPhongBan.map((pb) => (
                  <tr key={pb.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{pb.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{pb.maphongban}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{pb.giatri}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{pb.sapxep}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => handleOpenEdit(pb)} className="text-indigo-600 hover:text-indigo-900 mr-4">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(pb.id, pb.maphongban)} className="text-red-600 hover:text-red-900">
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
      {isModalOpen && currentPhongBan && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900 bg-opacity-50">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full">
              <form onSubmit={handleSave}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex justify-between items-center mb-5 border-b pb-2">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {isEditing ? 'Hiệu Chỉnh Khoa, Phòng' : 'Thêm Mới Khoa, Phòng'}
                    </h3>
                    <button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Mã Phòng ban</label>
                      <input 
                        type="text" 
                        required 
                        disabled={isEditing} // maphongban is readonly when editing
                        value={currentPhongBan.maphongban} 
                        onChange={e => setCurrentPhongBan({...currentPhongBan, maphongban: e.target.value})} 
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Giá Trị</label>
                      <input 
                        type="text" 
                        required 
                        value={currentPhongBan.giatri} 
                        onChange={e => setCurrentPhongBan({...currentPhongBan, giatri: e.target.value})} 
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Sắp Xếp</label>
                      <input 
                        type="number" 
                        required 
                        value={currentPhongBan.sapxep} 
                        onChange={e => setCurrentPhongBan({...currentPhongBan, sapxep: parseInt(e.target.value) || 0})} // Ensure it's a number
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