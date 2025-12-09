import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { EmployeeAccount } from '../types';
import { 
  Users, Plus, Pencil, Trash2, Search, X, Save, LogOut, FileDown, // Added FileDown for Excel export
  FolderCog, Building2, BookMarked, FileText, Wallet, HeartPulse,
  GraduationCap, Briefcase, Award, Trophy, BarChart2, ListTodo, KeyRound, AlertCircle,
  TrendingUp, Gem, UserCheck, Calendar, ChevronDown // New icons for sub-menus and expand/collapse
} from 'lucide-react';
import { DanhMucChucVuManagement } from './DanhMucChucVuManagement'; // Import the new component
import { DanhMucTrinhDoManagement } from './DanhMucTrinhDoManagement'; // Import the new DanhMucTrinhDoManagement component
import { DanhMucPhongBanManagement } from './DanhMucPhongBanManagement'; // Import the new DanhMucPhongBanManagement component

interface AdminDashboardProps {
  onLogout: () => void;
}

const EmptyEmployee: EmployeeAccount = {
  taikhoan: '',
  matkhau: '',
  holot: '',
  ten: '',
  ngaysinh: '',
  trinhdo: '',
  chucvu: '',
  donvicongtac: '',
  sodienthoai: '',
  email: '',
  duongdan: '',
  thoihan: ''
};

// New component for Change Password Modal
const ChangePasswordModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu mới và xác nhận mật khẩu không khớp.');
      setLoading(false);
      return;
    }

    // --- Placeholder for actual password change logic ---
    // In a real application, changing the password for the 'anon' role
    // directly like this is not standard for Supabase.
    // You would typically use Supabase Auth for authenticated users
    // or a custom Edge Function/RPC for specific admin accounts.
    // For this demonstration, we'll simulate a success/failure.
    setTimeout(() => {
      if (oldPassword === 'admin_password') { // Dummy check
        setSuccess('Mật khẩu đã được thay đổi thành công!');
        // Optionally, close modal after a delay
        // setTimeout(onClose, 2000);
      } else {
        setError('Mật khẩu cũ không đúng.');
      }
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900 bg-opacity-50">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full">
          <form onSubmit={handleChangePassword}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="flex justify-between items-center mb-5 border-b pb-2">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Đổi Mật Khẩu Admin</h3>
                <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-500">
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Mật khẩu cũ</label>
                  <input type="password" required value={oldPassword} onChange={e => setOldPassword(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Mật khẩu mới</label>
                  <input type="password" required value={newPassword} onChange={e => setNewPassword(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Xác nhận mật khẩu mới</label>
                  <input type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded mt-4 flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
                  <p className="text-sm text-red-700 font-medium">{error}</p>
                </div>
              )}
              {success && (
                <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded mt-4 flex items-center">
                  <span className="text-sm text-green-700 font-medium">{success}</span>
                </div>
              )}

            </div>
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button type="submit" disabled={loading} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50">
                {loading ? 'Đang xử lý...' : 'Lưu Thay Đổi'}
              </button>
              <button type="button" onClick={onClose} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                Hủy Bỏ
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};


export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [employees, setEmployees] = useState<EmployeeAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState<EmployeeAccount>(EmptyEmployee);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeMenuItem, setActiveMenuItem] = useState('hoSoNhanSu'); // Default active menu item
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [openSubMenu, setOpenSubMenu] = useState<string | null>(null); // State to track which sub-menu is open


  // Fetch Employees
  const fetchEmployees = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('ThongTin').select('*');
    if (error) {
      alert('Lỗi khi tải dữ liệu: ' + error.message);
    } else {
      setEmployees(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    // Only fetch employees if 'hoSoNhanSu' is the active item (or default)
    if (activeMenuItem === 'hoSoNhanSu') {
      fetchEmployees();
    }
  }, [activeMenuItem]);

  const handleDelete = async (taikhoan: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa nhân viên này?')) {
      const { error } = await supabase.from('ThongTin').delete().eq('taikhoan', taikhoan);
      if (error) {
        alert('Xóa thất bại: ' + error.message);
      } else {
        fetchEmployees();
      }
    }
  };

  const handleOpenAdd = () => {
    setCurrentEmployee(EmptyEmployee);
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (emp: EmployeeAccount) => {
    setCurrentEmployee(emp);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) {
      const { error } = await supabase
        .from('ThongTin')
        .update(currentEmployee)
        .eq('taikhoan', currentEmployee.taikhoan);
      
      if (error) alert('Cập nhật thất bại: ' + error.message);
      else {
        setIsModalOpen(false);
        fetchEmployees();
      }
    } else {
      // Add new
      const { error } = await supabase.from('ThongTin').insert([currentEmployee]);
      if (error) alert('Thêm mới thất bại: ' + error.message);
      else {
        setIsModalOpen(false);
        fetchEmployees();
      }
    }
  };

  const filteredEmployees = employees.filter(emp => 
    emp.ten.toLowerCase().includes(searchTerm.toLowerCase()) || 
    emp.holot.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.taikhoan.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const menuItems = [
    { id: 'hoSoNhanSu', label: 'Hồ sơ nhân sự', icon: FolderCog },
    { id: 'khoaPhong', label: 'Khoa/Phòng', icon: Building2 },
    { id: 'toBoMon', label: 'Tổ Bộ môn', icon: BookMarked },
    { id: 'hopDongLaoDong', label: 'Hợp đồng Lao động', icon: FileText },
    { id: 'luong', label: 'Lương', icon: Wallet },
    { id: 'baoHiem', label: 'Bảo hiểm', icon: HeartPulse },
    { id: 'daoTao', label: 'Đào tạo', icon: GraduationCap },
    { id: 'quaTrinhCongTac', label: 'Quá trình công tác', icon: Briefcase },
    { id: 'thiDua', label: 'Thi đua', icon: Award },
    { id: 'khenThuong', label: 'Khen thưởng', icon: Trophy },
    { id: 'thongKe', label: 'Thống kê', icon: BarChart2 },
    { 
      id: 'danhMuc', 
      label: 'Danh mục', 
      icon: ListTodo,
      children: [
        { id: 'danhMuc-trinhDo', label: 'Trình độ', icon: TrendingUp },
        { id: 'danhMuc-chucDanh', label: 'Chức danh', icon: Gem },
        { id: 'danhMuc-chucVu', label: 'Chức vụ', icon: UserCheck },
        { id: 'danhMuc-khoaPhong', label: 'Khoa, Phòng', icon: Building2 }, // Updated icon for Khoa, Phòng
        { id: 'danhMuc-namHoc', label: 'Năm học', icon: Calendar },
      ]
    },
  ];

  console.log('Active Menu Item:', activeMenuItem); // Debug log

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-blue-900 text-white flex flex-col shadow-lg">
        <div className="p-6 text-center border-b border-blue-800">
          <h1 className="text-xl font-bold uppercase tracking-wider text-blue-200 mb-1">Quản lý</h1>
          <h2 className="text-2xl font-extrabold text-white">NHÂN SỰ</h2>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            // Determine if the item itself is active OR if one of its children is active
            const isActive = activeMenuItem === item.id || item.children?.some(child => child.id === activeMenuItem);
            const isSubMenuOpen = openSubMenu === item.id; // State to control sub-menu visibility

            return (
              <div key={item.id}>
                {item.children ? ( // Item has children (is a parent menu item)
                  <>
                    <button
                      onClick={() => {
                        setActiveMenuItem(item.id); // Set parent as active
                        setOpenSubMenu(isSubMenuOpen ? null : item.id); // Toggle sub-menu
                      }}
                      className={`flex items-center justify-between w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200
                        ${isActive ? 'bg-blue-700 text-white shadow-md' : 'text-blue-200 hover:bg-blue-800 hover:text-white'}`}
                    >
                      <div className="flex items-center">
                        <Icon className="h-5 w-5 mr-3" />
                        <span>{item.label}</span>
                      </div>
                      {item.children && ( // Arrow icon for expandable items
                        <ChevronDown className={`h-4 w-4 transition-transform ${isSubMenuOpen ? 'rotate-180' : ''}`} />
                      )}
                    </button>
                    {isSubMenuOpen && ( // Render children if sub-menu is open
                      <div className="ml-6 mt-1 space-y-1">
                        {item.children.map((child) => {
                          const ChildIcon = child.icon;
                          const isChildActive = activeMenuItem === child.id;
                          return (
                            <button
                              key={child.id}
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent parent from toggling again
                                setActiveMenuItem(child.id);
                              }}
                              className={`flex items-center w-full px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-200
                                ${isChildActive ? 'bg-blue-600 text-white' : 'text-blue-300 hover:bg-blue-700 hover:text-white'}`}
                            >
                              <ChildIcon className="h-4 w-4 mr-2" />
                              <span>{child.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </>
                ) : ( // Regular menu item (no children)
                  <button
                    onClick={() => {
                      setActiveMenuItem(item.id);
                      setOpenSubMenu(null); // Close any open sub-menus when a non-child item is clicked
                    }}
                    className={`flex items-center w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200
                      ${isActive ? 'bg-blue-700 text-white shadow-md' : 'text-blue-200 hover:bg-blue-800 hover:text-white'}`}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    <span>{item.label}</span>
                  </button>
                )}
              </div>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Global Header */}
        <header className="bg-white shadow-md z-10">
          <div className="flex items-center justify-between h-16 px-6 max-w-full">
            {/* Left titles */}
            <div className="flex flex-col">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-900">Bộ Giáo Dục và Đào Tạo</span>
              <span className="text-lg font-bold text-red-600 whitespace-nowrap">Trường Đại học Kiến trúc Đà Nẵng</span>
            </div>
            {/* Right action buttons */}
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setIsChangePasswordModalOpen(true)}
                className="flex items-center px-4 py-2 text-sm font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 rounded-md transition-colors"
              >
                <KeyRound className="h-4 w-4 mr-2" />
                Đổi mật khẩu
              </button>
              <button 
                onClick={onLogout}
                className="flex items-center px-4 py-2 text-sm font-medium bg-red-100 text-red-800 hover:bg-red-200 rounded-md transition-colors"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Đăng Xuất
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          {activeMenuItem === 'hoSoNhanSu' ? (
            <div className="max-w-7xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Quản Lý Hồ Sơ Nhân Sự</h2>
              
              {/* Actions Bar */}
              <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <div className="relative w-full sm:w-96">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Tìm kiếm theo tên hoặc tài khoản..."
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <button
                  onClick={handleOpenAdd}
                  className="w-full sm:w-auto flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm Nhân Viên
                </button>
              </div>

              {/* Table */}
              <div className="bg-white shadow overflow-hidden rounded-lg border border-gray-200">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nhân Viên</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thông Tin Liên Hệ</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Công Việc</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tài Khoản</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thao Tác</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {loading ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-500">Đang tải dữ liệu...</td>
                        </tr>
                      ) : filteredEmployees.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-500">Không tìm thấy nhân viên nào.</td>
                        </tr>
                      ) : (
                        filteredEmployees.map((emp, idx) => (
                          <tr key={idx} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  <img className="h-10 w-10 rounded-full object-cover" src={emp.duongdan} alt="" onError={(e) => (e.currentTarget.src = 'https://ui-avatars.com/api/?name=User&background=random')} />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{emp.holot} {emp.ten}</div>
                                  <div className="text-sm text-gray-500">{emp.ngaysinh}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{emp.email}</div>
                              <div className="text-sm text-gray-500">{emp.sodienthoai}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{emp.chucvu}</div>
                              <div className="text-sm text-gray-500">{emp.donvicongtac}</div>
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                {emp.trinhdo}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{emp.taikhoan}</div>
                              <div className="text-xs text-red-500">Hết hạn: {emp.thoihan}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button onClick={() => handleOpenEdit(emp)} className="text-indigo-600 hover:text-indigo-900 mr-4">
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button onClick={() => handleDelete(emp.taikhoan)} className="text-red-600 hover:text-red-900">
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
            </div>
          ) : activeMenuItem === 'danhMuc-chucVu' ? (
            <DanhMucChucVuManagement />
          ) : activeMenuItem === 'danhMuc-trinhDo' ? (
            <DanhMucTrinhDoManagement />
          ) : activeMenuItem === 'danhMuc-khoaPhong' ? ( // New condition for Khoa, Phòng management
            <DanhMucPhongBanManagement />
          ) : activeMenuItem.startsWith('danhMuc-') && activeMenuItem !== 'danhMuc' ? (
            // Generic placeholder for other Danh mục sub-items, excluding the parent 'danhMuc' itself
            <div className="flex items-center justify-center h-full text-gray-500 text-xl">
              <p>Chức năng "{menuItems.find(item => item.id === 'danhMuc')?.children?.find(child => child.id === activeMenuItem)?.label}" đang được phát triển...</p>
            </div>
          ) : activeMenuItem === 'danhMuc' ? (
             <div className="flex items-center justify-center h-full text-gray-500 text-xl">
                <p>Vui lòng chọn một mục con trong "Danh mục".</p>
             </div>
          ) : (
            // Placeholder for top-level menu items other than hoSoNhanSu
            <div className="flex items-center justify-center h-full text-gray-500 text-xl">
              <p>Chức năng này đang được phát triển...</p>
            </div>
          )}
        </main>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900 bg-opacity-50">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <form onSubmit={handleSave}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex justify-between items-center mb-5 border-b pb-2">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {isEditing ? 'Hiệu Chỉnh Thông Tin Nhân Viên' : 'Thêm Mới Nhân Viên'}
                    </h3>
                    <button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Basic Info */}
                    <div className="col-span-1">
                       <label className="block text-sm font-medium text-gray-700">Tài khoản</label>
                       <input type="text" required disabled={isEditing} value={currentEmployee.taikhoan} onChange={e => setCurrentEmployee({...currentEmployee, taikhoan: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100" />
                    </div>
                    <div className="col-span-1">
                       <label className="block text-sm font-medium text-gray-700">Mật khẩu</label>
                       <input type="text" required value={currentEmployee.matkhau} onChange={e => setCurrentEmployee({...currentEmployee, matkhau: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                    </div>
                    <div className="col-span-1">
                       <label className="block text-sm font-medium text-gray-700">Họ lót</label>
                       <input type="text" required value={currentEmployee.holot} onChange={e => setCurrentEmployee({...currentEmployee, holot: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                    </div>
                    <div className="col-span-1">
                       <label className="block text-sm font-medium text-gray-700">Tên</label>
                       <input type="text" required value={currentEmployee.ten} onChange={e => setCurrentEmployee({...currentEmployee, ten: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                    </div>
                    <div className="col-span-1">
                       <label className="block text-sm font-medium text-gray-700">Ngày sinh (YYYY-MM-DD)</label>
                       <input type="date" required value={currentEmployee.ngaysinh} onChange={e => setCurrentEmployee({...currentEmployee, ngaysinh: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                    </div>
                    <div className="col-span-1">
                       <label className="block text-sm font-medium text-gray-700">Thời hạn (YYYY-MM-DD)</label>
                       <input type="date" required value={currentEmployee.thoihan} onChange={e => setCurrentEmployee({...currentEmployee, thoihan: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                    </div>
                    
                    {/* Job Info */}
                    <div className="col-span-1">
                       <label className="block text-sm font-medium text-gray-700">Trình độ</label>
                       <input type="text" required value={currentEmployee.trinhdo} onChange={e => setCurrentEmployee({...currentEmployee, trinhdo: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                    </div>
                    <div className="col-span-1">
                       <label className="block text-sm font-medium text-gray-700">Chức vụ</label>
                       <input type="text" required value={currentEmployee.chucvu} onChange={e => setCurrentEmployee({...currentEmployee, chucvu: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                    </div>
                    <div className="col-span-2">
                       <label className="block text-sm font-medium text-gray-700">Đơn vị công tác</label>
                       <input type="text" required value={currentEmployee.donvicongtac} onChange={e => setCurrentEmployee({...currentEmployee, donvicongtac: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                    </div>

                    {/* Contact Info */}
                    <div className="col-span-1">
                       <label className="block text-sm font-medium text-gray-700">Số điện thoại</label>
                       <input type="text" required value={currentEmployee.sodienthoai} onChange={e => setCurrentEmployee({...currentEmployee, sodienthoai: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                    </div>
                    <div className="col-span-1">
                       <label className="block text-sm font-medium text-gray-700">Email</label>
                       <input type="email" required value={currentEmployee.email} onChange={e => setCurrentEmployee({...currentEmployee, email: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                    </div>
                    <div className="col-span-2">
                       <label className="block text-sm font-medium text-gray-700">Đường dẫn ảnh</label>
                       <div className="mt-1 flex items-center space-x-4">
                           <div className="h-20 w-16 overflow-hidden rounded bg-gray-100 border border-gray-300 flex-shrink-0">
                               <img 
                                   src={currentEmployee.duongdan} 
                                   alt="Preview" 
                                   className="h-full w-full object-cover"
                                   onError={(e) => (e.currentTarget.src = 'https://ui-avatars.com/api/?name=Preview&background=e5e7eb&color=6b7280')}
                               />
                           </div>
                           <input type="text" placeholder="https://..." required value={currentEmployee.duongdan} onChange={e => setCurrentEmployee({...currentEmployee, duongdan: e.target.value})} className="flex-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                       </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm">
                    <Save className="h-4 w-4 mr-2" />
                    Lưu Thông Tin
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

      {isChangePasswordModalOpen && (
        <ChangePasswordModal onClose={() => setIsChangePasswordModalOpen(false)} />
      )}
    </div>
  );
};