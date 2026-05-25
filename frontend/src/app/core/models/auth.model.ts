export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface UpdateProfileData {
  bio?: string | null;
  cubeSetup?: string | null;
}

export interface ChangePasswordData {
  oldPassword: string;
  newPassword: string;
  newPasswordConfirm: string;
}

export interface AuthTokenResponse {
  access_token: string;
  token_type: string;
}
