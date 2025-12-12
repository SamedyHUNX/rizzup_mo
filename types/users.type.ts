export interface UserProfile {
  id: string;
  full_name: string;
  username: string;
  email?: string;
  gender: string;
  birthdate: string;
  bio?: string;
  avatar_url?: string;
  preferences?: any;
  location_lat?: number;
  location_lng?: number;
  last_active: string;
  is_verified: boolean;
  is_online?: boolean;
  created_at: string;
  updated_at: string;
}

export interface ResponseObject {
  success: boolean;
  message: string;
  isMatch?: boolean;
  data?: UserProfile[];
}
