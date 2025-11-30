export interface User {
  id: string;
  userName: string;
  fullName: string;
  isActive?: boolean;
  email?: string;
  roleName?: string;
  userTypeName?: string;
  userType?: string;
}

export enum UserRole {
  Admin = 'Admin',
  TeleSales = 'TeleSales',
  Sales = 'Sales',
  Accountant = 'Accountant',
  Tech = 'Tech',
  Customer = 'Customer',
}
