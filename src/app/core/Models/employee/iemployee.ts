// export interface IEmployee {
//   id?: number;
//   name: string;
//   phoneNumber: string; // API expects phoneNumber
//   email: string;
//   position: string; // API expects position instead of jobTitle
//   dateOfBirth: string; // API expects dateOfBirth instead of birthDate
//   hireDate: string; // API expects hireDate instead of joinDate
//   departmentId: number;
//   salary: number; // API expects number, not string
//   gender: string;
//   isActive: boolean;
//   file?: File; // API expects file instead of profileImage
//   address?: string;
//   empUserId?: string; // API expects empUserId
//   empCode?: string;
//   // Display fields (populated from API response)
//   departmentName?: string;
// }

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
