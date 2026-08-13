import { apiClient } from "./client";

export interface Visit {
  id: number;
  patient_id: number;
  doctor_id: number;
  visit_date: string;
  symptoms?: string;
  notes?: string;
  created_at?: string;
}

export interface VisitCreate {
  patient_id: number;
  doctor_id: number;
  visit_date: string;
  symptoms?: string;
  notes?: string;
}

export interface VisitUpdate {
  patient_id?: number;
  doctor_id?: number;
  visit_date?: string;
  symptoms?: string;
  notes?: string;
}

export async function fetchVisits(): Promise<Visit[]> {
  const response = await apiClient.get<Visit[]>("/visits/");
  return response.data;
}

export async function fetchVisitById(
  visitId: number
): Promise<Visit> {
  const response = await apiClient.get<Visit>(
    `/visits/${visitId}`
  );

  return response.data;
}

export async function createVisit(
  visit: VisitCreate
): Promise<Visit> {
  const response = await apiClient.post<Visit>(
    "/visits/",
    visit
  );

  return response.data;
}

export async function updateVisit(
  visitId: number,
  visit: VisitUpdate
): Promise<Visit> {
  const response = await apiClient.put<Visit>(
    `/visits/${visitId}`,
    visit
  );

  return response.data;
}

export async function deleteVisit(
  visitId: number
): Promise<{ message: string }> {
  const response = await apiClient.delete<{ message: string }>(
    `/visits/${visitId}`
  );

  return response.data;
}