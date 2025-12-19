export interface NewUserForm {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  username: string;
  password: string;
  role: 'admin' | 'employee' | 'client';
  profileImage?: string; // this line is required for image
}
