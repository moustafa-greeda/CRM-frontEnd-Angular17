export interface IEmployee {
  id?: number;
  empCode: string;
  name: string;
  email: string;
  phoneNumber: string;
  dateOfBirth?: string;
  hireDate?: string;
  departmentId: number;
  position: string;
  salary: number;
  address: string;
  gender: string;
  isActive: boolean;
  empUserId: string;
  file?: File;
  // Display fields (populated from API response)
  departmentName?: string;
}
