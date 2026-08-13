import { apiClient } from "./client";

export interface HealthResponse {
  status: string;
  [key: string]: unknown;
}

export async function getHealth(): Promise<HealthResponse> {
  const response = await apiClient.get<HealthResponse>("/health");
  return response.data;
}