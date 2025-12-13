
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { EmployeeAccount, NhanVien, TrinhDo } from '../types';
import { 
  Users, Plus, Pencil, Trash2, Search, X, Save, LogOut, FileDown,
  FolderCog, Building2, BookMarked, FileText, Wallet, HeartPulse,
  GraduationCap, Briefcase, Award, Trophy, BarChart2, ListTodo, KeyRound, AlertCircle,
  TrendingUp, Gem, UserCheck, Calendar, ChevronDown, LayoutGrid, PieChart
} from 'lucide-react';
import { DanhMucChucVuManagement } from './DanhMucChucVuManagement'; 
import { DanhMucTrinhDoManagement } from './DanhMucTrinhDoManagement';
import { DanhMucPhongBanManagement } from './DanhMucPhongBanManagement';
import { DanhMucChucDanhManagement } from './DanhMucChucDanhManagement';
import { DanhMucNamHocManagement } from './DanhMucNamHocManagement';
import { HoSoNhanSuManagement } from './HoSoNhanSuManagement';

interface AdminDashboardProps {
  onLogout: () => void;
}

// --- COMPONENTS ---

// 1. Dashboard Statistics Component
const DashboardOverview: React.FC = () => {
  const [stats, setStats] = useState({
    total: 0,
    male: 0,
    female: 0,
    lecturers: 0,
    education: {
      tienSi: 0,
      thacSi: 0,
      daiHoc: 0,
      caoDang: 0,
      khac: 0
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const [nvRes, tdRes] = await Promise.all([
          supabase.from('DanhSachNhanVien').select('*').eq('danghiviec', false),
          supabase.from('DanhMucTrinhDo').select('*')
        ]);

        if (nvRes.data && tdRes.data) {
          const employees = nvRes.data as NhanVien[];
          const trinhDos = tdRes.data as TrinhDo[];

          let male = 0;
          let female = 0;
          let lecturers = 0;
          const eduCount = { tienSi: 0, thacSi: 0, daiHoc: 0, caoDang: 0, khac: 0 };

          employees.forEach(emp => {
            // Gender
            if (emp.gioitinh) male++; else female++;
            
            // Lecturer
            if (emp.giangvien) lecturers++;

            // Education
            // Find the text value of the degree based on the ID/Code stored in employee record
            const td = trinhDos.find(t => t.matrinhdo === emp.trinhdo);
            const trinhDoName = (td?.giatri || '').toLowerCase();

            if (trinhDoName.includes('tiến sĩ') || trinhDoName.includes('ts')) {
              eduCount.tienSi++;
            } else if (trinhDoName.includes('thạc sĩ') || trinhDoName.includes('ths')) {
              eduCount.thacSi++;
            } else if (trinhDoName.includes('đại học') || trinhDoName.includes('đh') || trinhDoName.includes('cử nhân') || trinhDoName.includes('kỹ sư') || trinhDoName.includes('kiến trúc sư')) {
              eduCount.daiHoc++;
            } else if (trinhDoName.includes('cao đẳng') || trinhDoName.includes('cđ')) {
              eduCount.caoDang++;
            } else {
              // Includes Trung cấp, THPT, THCS, and others
              eduCount.khac++;
            }
          });

          setStats({
            total: employees.length,
            male,
            female,
            lecturers,
            education: eduCount
          });
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-full text-blue-600">Đang tải dữ liệu thống kê...</div>;
  }

  const lecturerRatio = stats.total > 0 ? ((stats.lecturers / stats.total) * 100).toFixed(1) : '0';

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-blue-800 border-b border-blue-200 pb-4">
        Hệ thống Quản lý Nhân sự
      </h2>

      {/* Top Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Employees */}
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-600 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-red-500 ">Tổng số</p>
            <p className="text-3xl font-bold text-blue-700 mt-1">{stats.total}</p>
          </div>
          <div className="p-3 bg-blue-100 rounded-full text-blue-600">
            <Users className="h-8 w-8" />
          </div>
        </div>

        {/* Gender Stats */}
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
           <div className="flex justify-between items-start mb-2">
              <p className="text-sm font-bold text-blue-500 ">Giới tính</p>
              <Users className="h-5 w-5 text-green-500" />
           </div>
           <div className="flex justify-between items-end">
              <div className="text-center">
                 <span className="block text-2xl font-bold text-gray-800">{stats.male}</span>
                 <span className="text-xs text-red-500">Nam</span>
              </div>
              <div className="h-8 w-px bg-gray-200 mx-2"></div>
              <div className="text-center">
                 <span className="block text-2xl font-bold text-red-800">{stats.female}</span>
                 <span className="text-xs text-green-500">Nữ</span>
              </div>
           </div>
        </div>

        {/* Lecturer Ratio */}
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-orange-500">
          <div className="flex justify-between items-center mb-1">
             <p className="text-sm font-bold text-red-500 ">Tỉ lệ Giảng viên</p>
             <PieChart className="h-6 w-6 text-blue-500" />
          </div>
          <div className="flex items-baseline">
            <p className="text-3xl font-bold text-blue-600">{lecturerRatio}%</p>
            <span className="ml-2 text-sm text-red-500">({stats.lecturers} người)</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
            <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${lecturerRatio}%` }}></div>
          </div>
        </div>

        {/* Quick Stat Placeholder (e.g., Active Departments - Mockup) */}
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500 flex items-center justify-between">
           <div>
            <p className="text-sm font-bold text-gray-500 ">Trạng thái</p>
            <p className="text-lg font-bold text-green-600 mt-1">Hoạt động tốt</p>
            <p className="text-xs text-red-400">Dữ liệu được cập nhật</p>
          </div>
          <div className="p-3 bg-purple-100 rounded-full text-purple-600">
            <HeartPulse className="h-8 w-8" />
          </div>
        </div>
      </div>

      {/* Education Stats Detail */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-bold text-red-800 flex items-center">
            <GraduationCap className="h-5 w-5 mr-2 text-blue-600" />
            Thống kê Trình độ
          </h3>
        </div>
        <div className="p-6">
           <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* PhD */}
              <div className="bg-blue-50 rounded-lg p-4 text-center hover:bg-blue-100 transition-colors">
                 <div className="text-2xl font-bold text-blue-800">{stats.education.tienSi}</div>
                 <div className="text-sm font-medium text-blue-600 mt-1">Tiến sĩ</div>
              </div>
              {/* Masters */}
              <div className="bg-indigo-50 rounded-lg p-4 text-center hover:bg-indigo-100 transition-colors">
                 <div className="text-2xl font-bold text-indigo-800">{stats.education.thacSi}</div>
                 <div className="text-sm font-medium text-indigo-600 mt-1">Thạc sĩ</div>
              </div>
              {/* University */}
              <div className="bg-teal-50 rounded-lg p-4 text-center hover:bg-teal-100 transition-colors">
                 <div className="text-2xl font-bold text-teal-800">{stats.education.daiHoc}</div>
                 <div className="text-sm font-medium text-teal-600 mt-1">Đại học</div>
              </div>
              {/* College */}
              <div className="bg-yellow-50 rounded-lg p-4 text-center hover:bg-yellow-100 transition-colors">
                 <div className="text-2xl font-bold text-yellow-800">{stats.education.caoDang}</div>
                 <div className="text-sm font-medium text-yellow-600 mt-1">Cao đẳng</div>
              </div>
              {/* Others */}
              <div className="bg-gray-50 rounded-lg p-4 text-center hover:bg-gray-100 transition-colors">
                 <div className="text-2xl font-bold text-gray-800">{stats.education.khac}</div>
                 <div className="text-sm font-medium text-red-600 mt-1">Khác (Trung cấp, PT...)</div>
              </div>
           </div>

           {/* Simple Visualization Bar */}
           <div className="mt-8">
              <div className="flex text-xs text-gray-500 mb-2 justify-between">
                 <span>Phân bố trình độ</span>
                 <span>100%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 flex overflow-hidden">
                 {stats.total > 0 && (
                   <>
                     <div className="bg-blue-600 h-4" title={`Tiến sĩ: ${stats.education.tienSi}`} style={{ width: `${(stats.education.tienSi / stats.total) * 100}%` }}></div>
                     <div className="bg-indigo-500 h-4" title={`Thạc sĩ: ${stats.education.thacSi}`} style={{ width: `${(stats.education.thacSi / stats.total) * 100}%` }}></div>
                     <div className="bg-teal-500 h-4" title={`Đại học: ${stats.education.daiHoc}`} style={{ width: `${(stats.education.daiHoc / stats.total) * 100}%` }}></div>
                     <div className="bg-yellow-500 h-4" title={`Cao đẳng: ${stats.education.caoDang}`} style={{ width: `${(stats.education.caoDang / stats.total) * 100}%` }}></div>
                     <div className="bg-gray-400 h-4" title={`Khác: ${stats.education.khac}`} style={{ width: `${(stats.education.khac / stats.total) * 100}%` }}></div>
                   </>
                 )}
              </div>
              <div className="flex flex-wrap gap-4 mt-3 justify-center text-xs">
                 <div className="flex items-center"><div className="w-3 h-3 bg-blue-600 rounded-full mr-1"></div>Tiến sĩ</div>
                 <div className="flex items-center"><div className="w-3 h-3 bg-indigo-500 rounded-full mr-1"></div>Thạc sĩ</div>
                 <div className="flex items-center"><div className="w-3 h-3 bg-teal-500 rounded-full mr-1"></div>Đại học</div>
                 <div className="flex items-center"><div className="w-3 h-3 bg-yellow-500 rounded-full mr-1"></div>Cao đẳng</div>
                 <div className="flex items-center"><div className="w-3 h-3 bg-gray-400 rounded-full mr-1"></div>Khác</div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};


// 2. Change Password Modal (Existing)
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
    setTimeout(() => {
      if (oldPassword === 'admin_password') { // Dummy check
        setSuccess('Mật khẩu đã được thay đổi thành công!');
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

// 3. Main Admin Dashboard
export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [activeMenuItem, setActiveMenuItem] = useState('dashboard'); // Default to Dashboard (Statistics)
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [openSubMenus, setOpenSubMenus] = useState<Record<string, boolean>>({}); // Track multiple open submenus

  // Recursively define menu items
  const menuStructure = [
    {
      id: 'heThong',
      label: 'Hệ thống',
      icon: LayoutGrid,
      children: [
        { id: 'hoSoNhanSu', label: 'Hồ sơ Nhân sự', icon: FolderCog },
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
            { id: 'danhMuc-khoaPhong', label: 'Khoa, Phòng', icon: Building2 },
            { id: 'danhMuc-namHoc', label: 'Năm học', icon: Calendar },
          ]
        },
      ]
    }
  ];

  const toggleSubMenu = (id: string) => {
    setOpenSubMenus(prev => ({ ...prev, [id]: !prev[id] }));
    
    // If clicking "Hệ thống" (the top level), we also want to show the Dashboard stats
    if (id === 'heThong') {
        setActiveMenuItem('dashboard');
    }
  };

  const renderMenuItem = (item: any, depth = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isOpen = openSubMenus[item.id];
    const isActive = activeMenuItem === item.id;
    
    // Indentation based on depth
    const paddingLeft = `${(depth + 1) * 1}rem`; 

    return (
      <div key={item.id}>
        <button
          onClick={() => {
            if (hasChildren) {
              toggleSubMenu(item.id);
            } else {
              setActiveMenuItem(item.id);
            }
          }}
          className={`flex items-center justify-between w-full py-2 pr-4 rounded-lg text-sm font-medium transition-colors duration-200 mb-1
            ${isActive && !hasChildren ? 'bg-blue-700 text-white shadow-md' : 'text-blue-200 hover:bg-blue-800 hover:text-white'}
          `}
          style={{ paddingLeft: depth === 0 ? '1rem' : paddingLeft }}
        >
          <div className="flex items-center">
            {item.icon && <item.icon className={`h-5 w-5 mr-3 ${depth > 0 ? 'h-4 w-4' : ''}`} />}
            <span>{item.label}</span>
          </div>
          {hasChildren && (
            <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          )}
        </button>

        {/* Render Children */}
        {hasChildren && isOpen && (
          <div className="space-y-1">
            {item.children.map((child: any) => renderMenuItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* Sidebar */}
      <aside className="w-72 bg-blue-900 text-white flex flex-col shadow-lg overflow-y-auto flex-shrink-0">
        <div className="p-6 text-center border-b border-blue-800 flex-shrink-0 cursor-pointer" onClick={() => setActiveMenuItem('dashboard')}>
          <h1 className="text-xl font-bold uppercase tracking-wider text-blue-200 mb-1">Quản lý</h1>
          <h2 className="text-2xl font-extrabold text-white">NHÂN SỰ</h2>
        </div>
        <nav className="flex-1 px-4 py-6">
          {menuStructure.map(item => renderMenuItem(item))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Global Header */}
        <header className="bg-white shadow-md z-10 flex-shrink-0">
          <div className="flex items-center justify-between h-16 px-6">
            {/* Left titles */}
            <div className="flex flex-col overflow-hidden">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-900 truncate">Bộ Giáo Dục và Đào Tạo</span>
              <span className="text-lg font-bold text-red-600 whitespace-nowrap truncate">Trường Đại học Kiến trúc Đà Nẵng</span>
            </div>
            {/* Right action buttons */}
            <div className="flex items-center space-x-4 flex-shrink-0">
              <button 
                onClick={() => setIsChangePasswordModalOpen(true)}
                className="flex items-center px-4 py-2 text-sm font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 rounded-md transition-colors whitespace-nowrap"
              >
                <KeyRound className="h-4 w-4 mr-2" />
                Đổi mật khẩu
              </button>
              <button 
                onClick={onLogout}
                className="flex items-center px-4 py-2 text-sm font-medium bg-red-100 text-red-800 hover:bg-red-200 rounded-md transition-colors whitespace-nowrap"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Đăng Xuất
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          {activeMenuItem === 'dashboard' ? (
             <DashboardOverview />
          ) : activeMenuItem === 'hoSoNhanSu' ? (
            <HoSoNhanSuManagement />
          ) : activeMenuItem === 'danhMuc-chucVu' ? (
            <DanhMucChucVuManagement />
          ) : activeMenuItem === 'danhMuc-trinhDo' ? (
            <DanhMucTrinhDoManagement />
          ) : activeMenuItem === 'danhMuc-khoaPhong' ? (
            <DanhMucPhongBanManagement />
          ) : activeMenuItem === 'danhMuc-chucDanh' ? (
            <DanhMucChucDanhManagement />
          ) : activeMenuItem === 'danhMuc-namHoc' ? (
            <DanhMucNamHocManagement />
          ) : (
            // Placeholder for developed items
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
               <div className="bg-white p-8 rounded-lg shadow-sm text-center">
                 <h3 className="text-xl font-bold text-gray-700 mb-2">Tính năng đang phát triển</h3>
                 <p>Vui lòng quay lại sau.</p>
               </div>
            </div>
          )}
        </main>
      </div>

      {isChangePasswordModalOpen && (
        <ChangePasswordModal onClose={() => setIsChangePasswordModalOpen(false)} />
      )}
    </div>
  );
};
