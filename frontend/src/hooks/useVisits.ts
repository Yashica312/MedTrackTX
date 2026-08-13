import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createVisit,
  deleteVisit,
  fetchVisitById,
  fetchVisits,
  updateVisit,
} from "../api/visits";

import type {
  VisitCreate,
  VisitUpdate,
} from "../api/visits";


// ============================================================
// GET ALL VISITS
// ============================================================

export function useVisits() {
  return useQuery({
    queryKey: ["visits"],
    queryFn: fetchVisits,
  });
}


// ============================================================
// GET SINGLE VISIT
// ============================================================

export function useVisit(
  visitId: number
) {
  return useQuery({
    queryKey: [
      "visits",
      visitId,
    ],

    queryFn: () =>
      fetchVisitById(
        visitId
      ),

    enabled:
      Boolean(visitId),
  });
}


// ============================================================
// CREATE VISIT
// ============================================================

export function useCreateVisit() {

  const queryClient =
    useQueryClient();

  return useMutation({

    mutationFn: (
      visit: VisitCreate
    ) =>
      createVisit(
        visit
      ),

    onSuccess: () => {

      queryClient.invalidateQueries({
        queryKey: ["visits"],
      });

      queryClient.invalidateQueries({
        queryKey: ["patients"],
      });

    },

  });
}


// ============================================================
// UPDATE VISIT
// ============================================================

export function useUpdateVisit() {

  const queryClient =
    useQueryClient();

  return useMutation({

    mutationFn: ({
      visitId,
      visit,
    }: {
      visitId: number;
      visit: VisitUpdate;
    }) =>
      updateVisit(
        visitId,
        visit
      ),

    onSuccess: (
      data
    ) => {

      queryClient.invalidateQueries({
        queryKey: ["visits"],
      });

      queryClient.setQueryData(
        ["visits", data.id],
        data
      );

    },

  });
}


// ============================================================
// DELETE VISIT
// ============================================================

export function useDeleteVisit() {

  const queryClient =
    useQueryClient();

  return useMutation({

    mutationFn: (
      visitId: number
    ) =>
      deleteVisit(
        visitId
      ),

    onSuccess: () => {

      queryClient.invalidateQueries({
        queryKey: ["visits"],
      });

    },

  });
}