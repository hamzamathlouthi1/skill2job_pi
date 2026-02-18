export interface Partner {
  id?: number;
  employerId?: number;   // ✅ optionnel
  companyName: string;
  industry: string;
  companyEmail: string;
  phone: string;
  address: string;
  website?: string;
  description?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}
