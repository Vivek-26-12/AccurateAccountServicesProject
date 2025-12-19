// In your type definitions
export interface NewClientForm {
  client_id: number;
  auth_id: number;
  username: string;
  password: string;
  company_name: string;
  contact_person: string;
  email: string;
  gstin?: string;
  pan_number?: string;
  profile_pic?: string;
  contacts: {
    contact_name: string;
    phone: string;
    email: string;
  }[];
}