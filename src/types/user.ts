export interface UserData {
  id: string;
  name: string;
  role: 'student' | 'teacher' | 'admin';
  email: string; // From profiles
  phone_no: string | null;
  description: string | null;
  avatar_url: string | null;
}

export interface BaseUser {
  id: string;
  name: string;
  avatarUrl: string | null;
  role?: 'student' | 'teacher'; // Optional: helps the card style itself
  local_student_id?: number;
  present?: boolean;
  ack?: boolean;
}
