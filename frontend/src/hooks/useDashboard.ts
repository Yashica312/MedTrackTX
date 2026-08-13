import { useQuery } from "@tanstack/react-query";

import {
  fetchDashboard,
  type DashboardData,
} from "../api/dashboard";

export function useDashboard() {
  return useQuery<DashboardData>({
    queryKey: ["dashboard"],
    queryFn: fetchDashboard,
  });
}