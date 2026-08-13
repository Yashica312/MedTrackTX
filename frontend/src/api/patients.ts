import { apiClient } from "./client";

export interface Patient {
  id: number;
  full_name: string;
  age: number;
  gender: string;
  phone: string;
  email?: string;
  doctor_id: number;
}

export interface PatientCreate {
  full_name: string;
  age: number;
  gender: string;
  phone: string;
  email?: string;
}

export interface PatientUpdate {
  full_name?: string;
  age?: number;
  gender?: string;
  phone?: string;
  email?: string;
}

export async function fetchPatients(): Promise<Patient[]> {
  const response = await apiClient.get<Patient[]>(
    "/patients/"
  );

  return response.data;
}

export async function fetchPatientById(
  patientId: number
): Promise<Patient> {
  const response = await apiClient.get<Patient>(
    `/patients/${patientId}`
  );

  return response.data;
}

export async function createPatient(
  patient: PatientCreate
): Promise<Patient> {
  const response = await apiClient.post<Patient>(
    "/patients/",
    patient
  );

  return response.data;
}

export async function updatePatient(
  patientId: number,
  patient: PatientUpdate
): Promise<Patient> {
  const response = await apiClient.put<Patient>(
    `/patients/${patientId}`,
    patient
  );

  return response.data;
}

export async function deletePatient(
  patientId: number
): Promise<{ message: string }> {
  const response = await apiClient.delete<{
    message: string;
  }>(
    `/patients/${patientId}`
  );

  return response.data;
}