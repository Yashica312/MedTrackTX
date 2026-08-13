import { useQuery } from "@tanstack/react-query";

import {
  fetchDoctors,
  type Doctor,
} from "../api/doctors";

export function useDoctors() {
  return useQuery<Doctor[]>({
    queryKey: ["doctors"],
    queryFn: fetchDoctors,
  });
}