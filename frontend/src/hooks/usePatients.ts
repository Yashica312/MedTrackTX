import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createPatient,
  deletePatient,
  fetchPatients,
  updatePatient,
  type Patient,
  type PatientCreate,
  type PatientUpdate,
} from "../api/patients";

export function usePatients() {
  return useQuery<Patient[]>({
    queryKey: ["patients"],
    queryFn: fetchPatients,
  });
}

export function useCreatePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (patient: PatientCreate) =>
      createPatient(patient),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["patients"],
      });
    },
  });
}

export function useUpdatePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      patientId,
      patient,
    }: {
      patientId: number;
      patient: PatientUpdate;
    }) => updatePatient(patientId, patient),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["patients"],
      });
    },
  });
}

export function useDeletePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (patientId: number) =>
      deletePatient(patientId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["patients"],
      });
    },
  });
}