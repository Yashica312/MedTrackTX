export interface Patient {
  id: number;
  full_name: string;
  age: number;
  gender: string;
  phone: string;
  email?: string | null;
  address?: string | null;
  doctor_id?: number | null;
}

export interface PatientCreate {
  full_name: string;
  age: number;
  gender: string;
  phone: string;
  email?: string;
  address?: string;
  doctor_id?: number;
}

export interface PatientUpdate {
  full_name?: string;
  age?: number;
  gender?: string;
  phone?: string;
  email?: string;
  address?: string;
  doctor_id?: number;
}