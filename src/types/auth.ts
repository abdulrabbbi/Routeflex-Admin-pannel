export interface AuthRoutePayload {
  email: string;
  password: string;
}

export interface ProfilePayload {
  firstName?: string;
  lastName?: string;
  email?: string;
  profilePicture?: File | null;
}

export interface UpdatePasswordPayload {
  currentPassword: string;
  newPassword: string;
  passwordConfirm: string;
}

export interface PreferencesPayload {
  language: string;
  theme: string;
  twoFactor: boolean;
}
