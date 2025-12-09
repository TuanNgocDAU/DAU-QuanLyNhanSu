import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { UserSession, AdminAccount, EmployeeAccount } from '../types';
import { Lock, User, LogIn, AlertCircle } from 'lucide-react';

interface LoginFormProps {
  onLoginSuccess: (session: UserSession) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // 1. Check Admin Table (QuanLy)
      const { data: adminData, error: adminError } = await supabase
        .from('QuanLy')
        .select('*')
        .eq('taikhoan', username)
        .maybeSingle(); // Use maybeSingle to avoid 406 error if not found

      if (adminData) {
        // Found in Admin table
        const admin = adminData as AdminAccount;
        if (admin.matkhau === password) {
          onLoginSuccess({ type: 'admin', adminData: admin });
          return;
        } else {
          setError('b. Mật khẩu không đúng');
          setLoading(false);
          return;
        }
      }

      // 2. If not admin, check Employee Table (ThongTin)
      const { data: empData, error: empError } = await supabase
        .from('ThongTin')
        .select('*')
        .eq('taikhoan', username)
        .maybeSingle();

      if (empData) {
        // Found in Employee table
        const employee = empData as EmployeeAccount;
        
        // Check password
        if (employee.matkhau !== password) {
          setError('b. Mật khẩu không đúng');
          setLoading(false);
          return;
        }

        // Check expiry
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const expiryDate = new Date(employee.thoihan);
        
        if (today.getTime() > expiryDate.getTime()) {
            // Expired
            setError('c. Tài khoản hết hạn sử dụng');
            setLoading(false);
            return;
        }

        // Valid Employee
        onLoginSuccess({ type: 'employee', employeeData: employee });
        return;
      }

      // 3. Not found in either table
      setError('a. Tài khoản không hợp lệ');

    } catch (err) {
      console.error(err);
      setError('Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        {/* Header Section */}
        <div className="bg-blue-900 text-white p-6 text-center">
          <h1 className="text-xl font-bold uppercase tracking-wider mb-1">Bộ Giáo Dục và Đào Tạo</h1>
          <h2 className="text-lg font-medium text-blue-200">Trường Đại học Kiến trúc Đà Nẵng</h2>
        </div>

        <div className="p-8">
          <h3 className="text-2xl font-semibold text-gray-800 text-center mb-6">Đăng Nhập Hệ Thống</h3>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tài khoản</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Nhập tài khoản"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Nhập mật khẩu"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded flex items-start">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-800 hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
            >
              {loading ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <>
                  <LogIn className="h-5 w-5 mr-2" />
                  Đăng Nhập
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};