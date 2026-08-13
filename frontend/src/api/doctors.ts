import { apiClient } from "./client";

export interface Doctor {
  id: number;
  full_name: string;
  email?: string;
}

export interface DoctorCreate {
  full_name: string;
  email?: string;
}

export interface DoctorUpdate {
  full_name?: string;
  email?: string;
}

export async function fetchDoctors(): Promise<Doctor[]> {
  const response = await apiClient.get<Doctor[]>("/doctors/");
  return response.data;
}

export async function fetchDoctorById(
  doctorId: number
): Promise<Doctor> {
  const response = await apiClient.get<Doctor>(
    `/doctors/${doctorId}`
  );

  return response.data;
}

export async function createDoctor(
  doctor: DoctorCreate
): Promise<Doctor> {
  const response = await apiClient.post<Doctor>(
    "/doctors/",
    doctor
  );

  return response.data;
}

export async function updateDoctor(
  doctorId: number,
  doctor: DoctorUpdate
): Promise<Doctor> {
  const response = await apiClient.put<Doctor>(
    `/doctors/${doctorId}`,
    doctor
  );

  return response.data;
}

export async function deleteDoctor(
  doctorId: number
): Promise<{ message: string }> {
  const response = await apiClient.delete<{ message: string }>(
    `/doctors/${doctorId}`
  );

  return response.data;
}