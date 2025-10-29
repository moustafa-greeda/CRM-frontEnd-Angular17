export interface IUser {
  id: number;
  name: string;
  email: string;
  role: string;
  permissions?: string[];
  avatar?: string;
  department?: string;
  employeeId?: number;
}

export interface IAuthState {
  isAuthenticated: boolean;
  user: IUser | null;
  token: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
  lastLoginTime: Date | null;
}

export interface ILoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface ILoginResponse {
  succeeded: boolean;
  data: {
    user: IUser;
    token: string;
    refreshToken: string;
    expiresIn: number;
  };
  message: string;
  validationErrors: any[];
}

export interface IRegisterRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role?: string;
}

export interface IAuthError {
  message: string;
  code: string;
  details?: any;
}
