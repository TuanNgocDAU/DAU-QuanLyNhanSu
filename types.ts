
export interface AdminAccount {
  taikhoan: string;
  matkhau: string;
}

export interface EmployeeAccount {
  id?: number; // Supabase adds this by default usually, but we focus on mapped columns
  taikhoan: string;
  matkhau: string;
  holot: string;
  ten: string;
  ngaysinh: string; // YYYY-MM-DD
  trinhdo: string;
  chucvu: string;
  donvicongtac: string;
  sodienthoai: string;
  email: string;
  duongdan: string; // Image URL
  thoihan: string; // YYYY-MM-DD
}

// New Interface for DanhSachNhanVien
export interface NhanVien {
  Id: number;
  manv: string;
  holot: string;
  ten: string;
  gioitinh: boolean;
  ngaysinh: string;
  noisinh: string;
  nguyenquan: string;
  noiohiennay: string;
  sodtdd: string;
  trinhdo: string; // Mã trình độ
  chucdanh: string; // Mã chức danh
  ngaychinhthuc: string;
  phongban: string; // Mã phòng ban
  chucvu: string; // Mã chức vụ
  socccd: string;
  ngaycap: string;
  noicap: string;
  danghiviec: boolean;
  email: string;
  giangvien: boolean;
  vithu: number;
  ngaythuviec: string;
  ngayqdtrogiang: string;
  ngayqdgiangvien: string;
  thoigiannghiviec: string;
  hinhanh: string;
  matkhau: string;
  hieuluc: string;
  
  // Optional fields for display after join
  ten_trinhdo?: string;
  ten_phongban?: string;
  ten_chucvu?: string;
  ten_chucdanh?: string;
}

export interface ChucVu {
  id: number;
  machucvu: string;
  giatri: string;
}

export interface TrinhDo {
  id: number;
  matrinhdo: string;
  giatri: string;
  ghichu: string;
}

export interface PhongBan {
  id: number;
  maphongban: string;
  giatri: string;
  sapxep: number; // Sắp xếp, assuming it's a number
}

export interface ChucDanh {
  id: number;
  machucdanh: string;
  giatri: string;
  ghichu: string;
}

export interface NamHoc {
  id: number;
  manamhoc: string; // Changed from namhoc
  giatri: string;    // Changed from ghichu
  macdinh: boolean;  // Added new field
}

export type UserType = 'admin' | 'employee' | null;

export interface UserSession {
  type: UserType;
  adminData?: AdminAccount;
  employeeData?: EmployeeAccount;
}
