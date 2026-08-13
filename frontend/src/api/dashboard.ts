import { apiClient } from "./client";

export interface DashboardPatient {
  id: number;
  full_name: string;
  age: number;
  gender: string;
  phone?: string;
  email?: string;
  address?: string;
  doctor_id?: number;
}

export interface DashboardVisit {
  id: number;
  patient_id: number;
  visit_date?: string;
  symptoms?: string;
  doctor_notes?: string;
  created_at?: string;
}

export interface DashboardPrediction {
  id: number;
  image_id: number;
  predicted_class: string;
  confidence: number;
  risk_level: string;
  gradcam_path?: string;
  prediction_time?: string;
}

export interface RiskDistribution {
  low: number;
  moderate: number;
  high: number;
}

export interface DashboardData {
  total_patients: number;
  total_visits: number;
  total_doctors: number;

  total_ai_analyses: number;

  risk_distribution: RiskDistribution;

  recent_patients: DashboardPatient[];

  recent_visits: DashboardVisit[];

  recent_predictions: DashboardPrediction[];
}

export async function fetchDashboard(): Promise<DashboardData> {
  const response = await apiClient.get<DashboardData>(
    "/dashboard/"
  );

  return response.data;
}