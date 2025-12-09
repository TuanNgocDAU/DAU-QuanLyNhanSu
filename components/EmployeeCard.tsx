import React, { useState, useEffect } from 'react';
import { EmployeeAccount } from '../types';
import { LogOut, User, Mail } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface EmployeeCardProps {
  employee: EmployeeAccount;
  onLogout: () => void;
}

export const EmployeeCard: React.FC<EmployeeCardProps> = ({ employee, onLogout }) => {
  const [imageError, setImageError] = useState(false);

  // Reset error state when employee changes
  useEffect(() => {
    setImageError(false);
  }, [employee.duongdan]);

  // Data to encode in QR code
  const qrData = `Họ tên: ${employee.holot} ${employee.ten}
Trình độ: ${employee.trinhdo}
Chức vụ: ${employee.chucvu}
Đơn vị: ${employee.donvicongtac}
SĐT: ${employee.sodienthoai}
Email: ${employee.email}`;

  // Fallback image generator
  const fallbackImage = `https://ui-avatars.com/api/?name=${encodeURIComponent(employee.holot + ' ' + employee.ten)}&background=0D8ABC&color=fff&size=128`;

  // Determine which image source to use
  // We trim the string to ensure no accidental whitespace breaks the URL
  const imageUrl = (!imageError && employee.duongdan && employee.duongdan.trim() !== '') 
    ? employee.duongdan.trim() 
    : fallbackImage;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 relative">
        
      {/* Logout Button */}
      <div className="absolute top-4 right-4 z-20">
        <button 
          onClick={onLogout}
          className="flex items-center px-4 py-2 bg-white text-red-600 rounded-full shadow-md hover:bg-red-50 transition-colors text-sm font-medium"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Đăng Xuất
        </button>
      </div>

      <div className="bg-white w-full max-w-[400px] rounded-3xl shadow-2xl overflow-hidden border border-gray-200 relative">
        
        {/* Card Header */}
        <div className="bg-white border-b-4 border-blue-900 p-6 pt-8 text-center relative overflow-hidden h-40 flex flex-col justify-start">
          {/* Decorative circles - subtle blue on white */}
          <div className="absolute top-0 left-0 -mt-4 -ml-4 w-24 h-24 rounded-full bg-blue-50 opacity-60"></div>
          <div className="absolute bottom-0 right-0 -mb-4 -mr-4 w-32 h-32 rounded-full bg-blue-50 opacity-60"></div>

          <h1 className="text-sm font-bold uppercase tracking-widest text-blue-900 mb-1 relative z-10">Bộ Giáo Dục và Đào Tạo</h1>
          {/* Title: Single line, Red, Specific Casing */}
          <h2 className="text-lg font-bold text-red-600 whitespace-nowrap relative z-10 pb-2">Trường Đại học Kiến trúc Đà Nẵng</h2>
        </div>

        {/* Card Body */}
        <div className="flex flex-col items-center px-6 pb-8 relative z-10">
          
          {/* Photo Frame */}
          <div className="-mt-12 mb-6 p-1 bg-white shadow-xl rounded-md border border-gray-200">
             <div className="h-40 w-32 overflow-hidden rounded-sm bg-gray-100 border border-gray-100 relative">
               <img 
                 key={employee.duongdan} // Force re-render if URL changes in props
                 src={imageUrl} 
                 alt={`${employee.holot} ${employee.ten}`} 
                 className="h-full w-full object-cover"
                 onError={() => setImageError(true)}
                 referrerPolicy="no-referrer"
               />
             </div>
          </div>

          {/* Detailed Info Section with Icons */}
          <div className="w-full space-y-3 mb-6">
            
            {/* Name Block */}
            <div className="flex items-center p-3 bg-blue-50 rounded-xl border border-blue-100 hover:shadow-sm transition-shadow">
              <div className="flex-shrink-0 bg-blue-100 p-2.5 rounded-full text-blue-600 mr-4">
                <User className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-blue-500 uppercase tracking-wide mb-0.5">Họ và Tên</p>
                <h3 className="text-lg font-bold text-gray-800 truncate leading-tight">
                  {employee.holot} {employee.ten}
                </h3>
              </div>
            </div>

            {/* Email Block */}
            <div className="flex items-center p-3 bg-blue-50 rounded-xl border border-blue-100 hover:shadow-sm transition-shadow">
              <div className="flex-shrink-0 bg-blue-100 p-2.5 rounded-full text-blue-600 mr-4">
                <Mail className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-blue-500 uppercase tracking-wide mb-0.5">Email Liên Hệ</p>
                <p className="text-sm font-medium text-gray-700 truncate leading-tight">
                  {employee.email}
                </p>
              </div>
            </div>

          </div>

          {/* QR Code Section */}
          <div className="bg-white p-4 rounded-2xl w-full flex flex-col items-center border-2 border-dashed border-gray-200 relative">
             <div className="absolute -top-3 bg-white px-2 text-xs font-medium text-gray-400 uppercase tracking-wider">
                Mã QR Thông Tin
             </div>
             <div className="p-1">
                <QRCodeSVG 
                    value={qrData} 
                    size={130} 
                    level="M" 
                    includeMargin={true}
                    fgColor="#1e40af"
                />
             </div>
          </div>

          <div className="mt-4 text-center">
             <span className="inline-block px-3 py-1 bg-gray-100 text-gray-500 text-[10px] font-medium rounded-full uppercase tracking-wider">
               Thẻ Nhân Viên Điện Tử
             </span>
          </div>

        </div>
      </div>
    </div>
  );
};