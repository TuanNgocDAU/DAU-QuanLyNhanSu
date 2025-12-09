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

export type UserType = 'admin' | 'employee' | null;

export interface UserSession {
  type: UserType;
  adminData?: AdminAccount;
  employeeData?: EmployeeAccount;
}