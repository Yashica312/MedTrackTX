import { apiClient } from "./client";

export interface Visit {
  id: number;
  patient_id: number;
  visit_date: string;
  symptoms?: string | null;
  doctor_notes?: string | null;
  created_at?: string;
}

export interface VisitCreate {
  patient_id: number;
  visit_date: string;
  symptoms?: string;
  doctor_notes?: string;
}

export interface VisitUpdate {
  visit_date?: string;
  symptoms?: string;
  doctor_notes?: string;
}


// ============================================================
// GET ALL VISITS
// ============================================================

export async function fetchVisits(): Promise<Visit[]> {
  const response = await apiClient.get<Visit[]>(
    "/visits/"
  );

  return response.data;
}


// ============================================================
// GET SINGLE VISIT
// ============================================================

export async function fetchVisitById(
  visitId: number
): Promise<Visit> {
  const response = await apiClient.get<Visit>(
    `/visits/${visitId}`
  );

  return response.data;
}


// ============================================================
// CREATE VISIT
// ============================================================

export async function createVisit(
  visit: VisitCreate
): Promise<Visit> {
  const response = await apiClient.post<Visit>(
    "/visits/",
    visit
  );

  return response.data;
}


// ============================================================
// UPDATE VISIT
// ============================================================

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


// ============================================================
// DELETE VISIT
// ============================================================

export async function deleteVisit(
  visitId: number
): Promise<{ message: string }> {
  const response =
    await apiClient.delete<{
      message: string;
    }>(
      `/visits/${visitId}`
    );

  return response.data;
}