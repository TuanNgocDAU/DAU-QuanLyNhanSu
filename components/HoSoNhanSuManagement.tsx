
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { NhanVien, TrinhDo, PhongBan, ChucVu, ChucDanh } from '../types';
import { Search, Info, User, Phone, MapPin, Mail, AlertTriangle, Filter, FileDown } from 'lucide-react';
import * as XLSX from 'xlsx';

export const HoSoNhanSuManagement: React.FC = () => {
  const [nhanVienList, setNhanVienList] = useState<NhanVien[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter States
  const [filters, setFilters] = useState({
    gioitinh: '',
    trinhdo: '',
    phongban: '',
    chucvu: '',
    chucdanh: '',
    giangvien: ''
  });

  // Modal States
  const [selectedContact, setSelectedContact] = useState<NhanVien | null>(null);
  const [selectedLecturer, setSelectedLecturer] = useState<NhanVien | null>(null);

  // Catalog Data for Joins
  const [trinhDoList, setTrinhDoList] = useState<TrinhDo[]>([]);
  const [phongBanList, setPhongBanList] = useState<PhongBan[]>([]);
  const [chucVuList, setChucVuList] = useState<ChucVu[]>([]);
  const [chucDanhList, setChucDanhList] = useState<ChucDanh[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch catalogs concurrently
      const [tdRes, pbRes, cvRes, cdRes, nvRes] = await Promise.all([
        supabase.from('DanhMucTrinhDo').select('*'),
        supabase.from('DanhMucPhongBan').select('*'),
        supabase.from('DanhMucChucVu').select('*'),
        supabase.from('DanhMucChucDanh').select('*'),
        supabase.from('DanhSachNhanVien').select('*').eq('danghiviec', false).order('vithu', { ascending: true })
      ]);

      if (tdRes.data) setTrinhDoList(tdRes.data);
      if (pbRes.data) setPhongBanList(pbRes.data);
      if (cvRes.data) setChucVuList(cvRes.data);
      if (cdRes.data) setChucDanhList(cdRes.data);

      if (nvRes.data) {
        // Join data manually in frontend for display
        const joinedData = nvRes.data.map((nv: NhanVien) => ({
          ...nv,
          ten_trinhdo: tdRes.data?.find(t => t.matrinhdo === nv.trinhdo)?.giatri || nv.trinhdo,
          ten_phongban: pbRes.data?.find(p => p.maphongban === nv.phongban)?.giatri || nv.phongban,
          ten_chucvu: cvRes.data?.find(c => c.machucvu === nv.chucvu)?.giatri || nv.chucvu,
          ten_chucdanh: cdRes.data?.find(d => d.machucdanh === nv.chucdanh)?.giatri || nv.chucdanh,
        }));
        setNhanVienList(joinedData);
      } else if (nvRes.error) {
        console.error("Error fetching employees:", nvRes.error);
        alert("Lỗi tải danh sách nhân viên: " + nvRes.error.message);
      }

    } catch (error) {
      console.error("System error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleOpenLecturerProfile = (nv: NhanVien) => {
    if (nv.giangvien) {
      setSelectedLecturer(nv);
    } else {
      alert("Nhân sự này không phải là giảng viên");
    }
  };

  // Helper function to process Google Drive links
  const getGoogleDriveImageUrl = (url: string) => {
    if (!url) return '';
    // Check if it is a Google Drive link
    if (url.includes('drive.google.com') || url.includes('docs.google.com')) {
      // Extract File ID
      // Patterns: /file/d/ID/view, id=ID, /open?id=ID
      const idMatch = url.match(/[-\w]{25,}/);
      if (idMatch) {
        // Use lh3.googleusercontent.com for direct image display which is often more reliable for <img> tags
        // Alternatively could use https://drive.google.com/uc?export=view&id=${idMatch[0]}
        return `https://lh3.googleusercontent.com/d/${idMatch[0]}`;
      }
    }
    return url;
  };

  // Format date to DD-MM-YYYY
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const parts = dateString.split('-');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateString;
  };

  // Filter Logic
  const filteredData = nhanVienList.filter(nv => {
    const matchesSearch = 
      (nv.ten?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (nv.holot?.toLowerCase() || '').includes(searchTerm.toLowerCase());

    const matchesGioiTinh = filters.gioitinh 
        ? (filters.gioitinh === 'Nam' ? nv.gioitinh === true : nv.gioitinh === false)
        : true;
        
    const matchesTrinhDo = filters.trinhdo ? nv.ten_trinhdo === filters.trinhdo : true;
    const matchesPhongBan = filters.phongban ? nv.ten_phongban === filters.phongban : true;
    const matchesChucVu = filters.chucvu ? nv.ten_chucvu === filters.chucvu : true;
    const matchesChucDanh = filters.chucdanh ? nv.ten_chucdanh === filters.chucdanh : true;
    const matchesGiangVien = filters.giangvien 
      ? (filters.giangvien === 'true' ? nv.giangvien === true : nv.giangvien === false) 
      : true;

    return matchesSearch && matchesGioiTinh && matchesTrinhDo && matchesPhongBan && matchesChucVu && matchesChucDanh && matchesGiangVien;
  });

  // Export Excel Function
  const handleExportExcel = () => {
    const dataToExport = filteredData.map(nv => ({
      'STT': nv.vithu,
      'ID': nv.Id,
      'Mã NV': nv.manv,
      'Họ lót': nv.holot,
      'Tên': nv.ten,
      'Ngày sinh': formatDate(nv.ngaysinh),
      'Giới tính': nv.gioitinh ? 'Nam' : 'Nữ',
      'Trình độ': nv.ten_trinhdo,
      'Khoa / Phòng': nv.ten_phongban,
      'Chức vụ': nv.ten_chucvu,
      'Chức danh': nv.ten_chucdanh,
      'Giảng viên': nv.giangvien ? 'Có' : 'Không',
      'Nơi sinh': nv.noisinh,
      'Nơi ở hiện nay': nv.noiohiennay,
      'SĐT': nv.sodtdd,
      'Email': nv.email,
      'Số CCCD': nv.socccd,
      'Ngày cấp': formatDate(nv.ngaycap),
      'Nơi cấp': nv.noicap,
      'Ngày thử việc': formatDate(nv.ngaythuviec),
      'Ngày chính thức': formatDate(nv.ngaychinhthuc),
      'Ngày QĐ Trợ giảng': formatDate(nv.ngayqdtrogiang),
      'Ngày QĐ Giảng viên': formatDate(nv.ngayqdgiangvien)
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "DanhSachNhanSu");
    
    // Auto-width columns (basic estimation)
    const wscols = Object.keys(dataToExport[0] || {}).map(() => ({ wch: 20 }));
    ws['!cols'] = wscols;

    XLSX.writeFile(wb, "DanhSachNhanSu_DAU.xlsx");
  };

  // Unique values for dropdowns
  const uniqueValues = (key: keyof NhanVien | 'ten_trinhdo' | 'ten_phongban' | 'ten_chucvu' | 'ten_chucdanh') => {
    return Array.from(new Set(nhanVienList.map(item => item[key as keyof NhanVien] as string))).filter(Boolean).sort();
  };

  return (
    <div className="max-w-[1920px] mx-auto">
      <h2 className="text-2xl font-bold text-blue-600 bg-white p-4 mb-6 rounded-lg shadow-sm border border-gray-200">
        Danh sách Nhân sự
      </h2>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Tìm kiếm theo Tên hoặc Họ lót..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
             <button
                onClick={handleExportExcel}
                className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 whitespace-nowrap"
              >
                <FileDown className="h-4 w-4 mr-2" />
                Xuất danh sách Excel
              </button>
            <div className="text-sm text-gray-500 whitespace-nowrap">
              Tổng số: <span className="font-bold text-blue-600">{filteredData.length}</span> nhân sự
            </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow overflow-hidden rounded-lg border border-gray-200 flex flex-col h-[calc(100vh-250px)]">
        <div className="overflow-auto flex-1">
          <table className="min-w-max w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
              <tr>
                <th rowSpan={2} className="px-3 py-3 text-left text-xs font-bold text-red-500 tracking-wider bg-gray-50">Thông tin</th>
                <th rowSpan={2} className="px-3 py-3 text-left text-xs font-bold text-red-500 tracking-wider bg-gray-50">STT</th>
                <th rowSpan={2} className="px-3 py-3 text-left text-xs font-bold text-red-500 tracking-wider bg-gray-50">ID</th>
                <th rowSpan={2} className="px-3 py-3 text-left text-xs font-bold text-red-500 tracking-wider bg-gray-50">Mã NV</th>
                <th rowSpan={2} className="px-3 py-3 text-left text-xs font-bold text-red-500 tracking-wider bg-gray-50">Họ lót</th>
                <th rowSpan={2} className="px-3 py-3 text-left text-xs font-bold text-red-500 tracking-wider bg-gray-50">Tên</th>
                <th rowSpan={2} className="px-3 py-3 text-left text-xs font-bold text-red-500 tracking-wider bg-gray-50">Ngày sinh</th>
                
                {/* Filterable Columns Headers */}
                <th className="px-3 py-1 text-left text-xs font-bold text-red-500 tracking-wider bg-gray-50 border-b">Giới tính</th>
                <th className="px-3 py-1 text-left text-xs font-bold text-red-500 tracking-wider bg-gray-50 border-b">Trình độ</th>
                <th className="px-3 py-1 text-left text-xs font-bold text-red-500 tracking-wider bg-gray-50 border-b">Khoa / Phòng</th>
                <th className="px-3 py-1 text-left text-xs font-bold text-red-500 tracking-wider bg-gray-50 border-b">Chức vụ</th>
                <th className="px-3 py-1 text-left text-xs font-bold text-red-500 tracking-wider bg-gray-50 border-b">Chức danh</th>
                <th className="px-3 py-1 text-left text-xs font-bold text-red-500 tracking-wider bg-gray-50 border-b">Giảng viên</th>

                <th rowSpan={2} className="px-3 py-3 text-left text-xs font-bold text-red-500 tracking-wider bg-gray-50">Nơi sinh</th>
                <th rowSpan={2} className="px-3 py-3 text-left text-xs font-bold text-red-500 tracking-wider bg-gray-50">Nơi ở hiện nay</th>
                <th rowSpan={2} className="px-3 py-3 text-left text-xs font-bold text-red-500 tracking-wider bg-gray-50">SĐT</th>
                <th rowSpan={2} className="px-3 py-3 text-left text-xs font-bold text-red-500 tracking-wider bg-gray-50">Email</th>
                <th rowSpan={2} className="px-3 py-3 text-left text-xs font-bold text-red-500 tracking-wider bg-gray-50">Số CCCD</th>
                <th rowSpan={2} className="px-3 py-3 text-left text-xs font-bold text-red-500 tracking-wider bg-gray-50">Ngày cấp</th>
                <th rowSpan={2} className="px-3 py-3 text-left text-xs font-bold text-red-500 tracking-wider bg-gray-50">Nơi cấp</th>
                <th rowSpan={2} className="px-3 py-3 text-left text-xs font-bold text-red-500 tracking-wider bg-gray-50">Ngày thử việc</th>
                <th rowSpan={2} className="px-3 py-3 text-left text-xs font-bold text-red-500 tracking-wider bg-gray-50">Ngày chính thức</th>
              </tr>
              {/* Filter Row */}
              <tr>
                 <th className="px-1 py-1 bg-gray-50">
                    <select onChange={(e) => handleFilterChange('gioitinh', e.target.value)} className="w-full text-xs border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500">
                        <option value="">Tất cả</option>
                        <option value="Nam">Nam</option>
                        <option value="Nữ">Nữ</option>
                    </select>
                 </th>
                 <th className="px-1 py-1 bg-gray-50">
                    <select onChange={(e) => handleFilterChange('trinhdo', e.target.value)} className="w-full text-xs border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500">
                        <option value="">Tất cả</option>
                        {uniqueValues('ten_trinhdo').map((val, idx) => <option key={idx} value={val}>{val}</option>)}
                    </select>
                 </th>
                 <th className="px-1 py-1 bg-gray-50">
                    <select onChange={(e) => handleFilterChange('phongban', e.target.value)} className="w-full text-xs border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500">
                        <option value="">Tất cả</option>
                        {uniqueValues('ten_phongban').map((val, idx) => <option key={idx} value={val}>{val}</option>)}
                    </select>
                 </th>
                 <th className="px-1 py-1 bg-gray-50">
                    <select onChange={(e) => handleFilterChange('chucvu', e.target.value)} className="w-full text-xs border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500">
                        <option value="">Tất cả</option>
                        {uniqueValues('ten_chucvu').map((val, idx) => <option key={idx} value={val}>{val}</option>)}
                    </select>
                 </th>
                 <th className="px-1 py-1 bg-gray-50">
                    <select onChange={(e) => handleFilterChange('chucdanh', e.target.value)} className="w-full text-xs border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500">
                        <option value="">Tất cả</option>
                        {uniqueValues('ten_chucdanh').map((val, idx) => <option key={idx} value={val}>{val}</option>)}
                    </select>
                 </th>
                 <th className="px-1 py-1 bg-gray-50">
                    <select onChange={(e) => handleFilterChange('giangvien', e.target.value)} className="w-full text-xs border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500">
                        <option value="">Tất cả</option>
                        <option value="true">Có</option>
                        <option value="false">Không</option>
                    </select>
                 </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={20} className="px-6 py-10 text-center text-sm text-gray-500">Đang tải dữ liệu...</td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={20} className="px-6 py-10 text-center text-sm text-gray-500">Không tìm thấy nhân sự phù hợp.</td>
                </tr>
              ) : (
                filteredData.map((nv) => (
                  <tr key={nv.Id} className="hover:bg-blue-50 transition-colors">
                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium">
                        <div className="flex flex-col space-y-1">
                            <button onClick={() => setSelectedContact(nv)} className="text-blue-600 hover:text-blue-800 text-xs border border-blue-200 bg-blue-50 rounded px-2 py-1">
                                Liên hệ
                            </button>
                            <button onClick={() => handleOpenLecturerProfile(nv)} className="text-green-600 hover:text-green-800 text-xs border border-green-200 bg-green-50 rounded px-2 py-1">
                                HS Giảng viên
                            </button>
                        </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-center font-bold text-gray-600">{nv.vithu}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{nv.Id}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 font-medium">{nv.manv}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{nv.holot}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 font-bold">{nv.ten}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{formatDate(nv.ngaysinh)}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{nv.gioitinh ? 'Nam' : 'Nữ'}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{nv.ten_trinhdo}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{nv.ten_phongban}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{nv.ten_chucvu}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{nv.ten_chucdanh}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-center">
                        {nv.giangvien ? <span className="text-green-600">✓</span> : <span className="text-gray-300">-</span>}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{nv.noisinh}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 max-w-xs truncate" title={nv.noiohiennay}>{nv.noiohiennay}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{nv.sodtdd}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{nv.email}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{nv.socccd}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{formatDate(nv.ngaycap)}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{nv.noicap}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{formatDate(nv.ngaythuviec)}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{formatDate(nv.ngaychinhthuc)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Contact Info Modal */}
      {selectedContact && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900 bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden relative">
                <button 
                    onClick={() => setSelectedContact(null)}
                    className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 z-10"
                >
                    <span className="sr-only">Close</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                
                <div className="p-6">
                    <h3 className="text-xl font-bold text-center text-gray-900 mb-6 border-b pb-2">Thông tin Nhân sự</h3>
                    
                    <div className="flex flex-col items-center mb-6">
                        <div className="w-[120px] h-[160px] bg-gray-200 rounded border border-gray-300 overflow-hidden flex items-center justify-center shadow-md relative">
                            {selectedContact.hinhanh ? (
                                <img 
                                    src={getGoogleDriveImageUrl(selectedContact.hinhanh)} 
                                    alt="Avatar" 
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                        e.currentTarget.parentElement?.classList.add('bg-gray-100');
                                        // Force remove any old error span if exists (though react rerender might handle it, this is safe for DOM manip in onError)
                                        const parent = e.currentTarget.parentElement;
                                        if (parent && !parent.querySelector('.error-text')) {
                                            const span = document.createElement('span');
                                            span.className = 'error-text text-gray-400 text-xs text-center font-medium p-2';
                                            span.innerText = 'Error Image';
                                            parent.appendChild(span);
                                        }
                                    }}
                                />
                            ) : (
                                <span className="text-red-400 text-xs font-medium">Error Image</span>
                            )}
                        </div>
                        <h4 className="mt-3 text-lg font-bold text-blue-800">{selectedContact.holot} {selectedContact.ten}</h4>
                        <p className="text-sm text-red-500">{selectedContact.ten_chucvu} - {selectedContact.ten_phongban}</p>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-start">
                            <Phone className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
                            <div>
                                <p className="text-xs text-blue-500">Số điện thoại</p>
                                <p className="text-sm font-medium text-red-900">{selectedContact.sodtdd || 'Chưa cập nhật'}</p>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <Mail className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
                            <div>
                                <p className="text-xs text-blue-500">Email</p>
                                <p className="text-sm font-medium text-red-900">{selectedContact.email || 'Chưa cập nhật'}</p>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <MapPin className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
                            <div>
                                <p className="text-xs text-blue-500">Địa chỉ</p>
                                <p className="text-sm font-medium text-red-900">{selectedContact.noiohiennay || 'Chưa cập nhật'}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 text-center">
                    <button onClick={() => setSelectedContact(null)} className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:text-sm">
                        Đóng
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Lecturer Profile Modal */}
      {selectedLecturer && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900 bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden relative">
                 <button 
                    onClick={() => setSelectedLecturer(null)}
                    className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 z-10"
                >
                    <span className="sr-only">Close</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                <div className="p-6">
                    <h3 className="text-xl font-bold text-center text-blue-900 mb-6 border-b pb-2">Thông tin Giảng viên</h3>
                    
                    <div className="flex flex-col items-center mb-6">
                        {/* Image Section */}
                        <div className="w-[120px] h-[160px] bg-gray-200 rounded border border-gray-300 overflow-hidden flex items-center justify-center shadow-md relative mb-3">
                            {selectedLecturer.hinhanh ? (
                                <img 
                                    src={getGoogleDriveImageUrl(selectedLecturer.hinhanh)} 
                                    alt="Avatar" 
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                        e.currentTarget.parentElement?.classList.add('bg-gray-100');
                                        const parent = e.currentTarget.parentElement;
                                        if (parent && !parent.querySelector('.error-text')) {
                                            const span = document.createElement('span');
                                            span.className = 'error-text text-gray-400 text-xs text-center font-medium p-2';
                                            span.innerText = 'Error Image';
                                            parent.appendChild(span);
                                        }
                                    }}
                                />
                            ) : (
                                <span className="text-red-400 text-xs font-medium">Error Image</span>
                            )}
                        </div>

                        <h4 className="text-lg font-bold text-red-800 text-center">{selectedLecturer.holot} {selectedLecturer.ten}</h4>
                        <p className="text-sm text-blue-600 font-semibold text-center">{selectedLecturer.ten_chucvu}</p>
                        <p className="text-sm text-gray-600 text-center">{selectedLecturer.ten_phongban}</p>
                        <p className="text-xs text-gray-400 mt-1">Mã NV: {selectedLecturer.manv}</p>
                    </div>

                    <div className="space-y-4 bg-blue-50 p-4 rounded-lg">
                        <div className="flex justify-between items-center border-b border-blue-100 pb-2">
                            <span className="text-sm text-blue-600">Ngày QĐ Trợ giảng:</span>
                            <span className="text-sm font-bold text-red-900">{formatDate(selectedLecturer.ngayqdtrogiang) || '---'}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-blue-600">Ngày QĐ Giảng viên:</span>
                            <span className="text-sm font-bold text-red-900">{formatDate(selectedLecturer.ngayqdgiangvien) || '---'}</span>
                        </div>
                    </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 text-center">
                    <button onClick={() => setSelectedLecturer(null)} className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:text-sm">
                        Đóng
                    </button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};
