import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { requestService } from "@/src/services/requestService";
import type { CreateRequestBody, DisasterRequest } from "@/src/types";

// ─── Query Keys ────────────────────────────────────────────────────────────

export const requestKeys = {
  all: ["requests"] as const,
  detail: (id: string) => ["requests", id] as const,
};

// ─── useRequests ───────────────────────────────────────────────────────────

/**
 * Fetch all user requests (sorted by backend priority).
 * Returns TanStack Query result with auto-caching.
 */
export function useRequests() {
  return useQuery({
    queryKey: requestKeys.all,
    queryFn: requestService.getAll,
  });
}

// ─── useRequestDetail ──────────────────────────────────────────────────────

/**
 * Fetch a single request by ID.
 * Falls back to client-side filter (backend detail endpoint WIP).
 */
export function useRequestDetail(id: string) {
  return useQuery({
    queryKey: requestKeys.detail(id),
    queryFn: () => requestService.getById(id),
    enabled: !!id,
  });
}

// ─── useCreateRequest ──────────────────────────────────────────────────────

/**
 * Mutation hook to create a new disaster request.
 * Automatically invalidates the requests list cache on success.
 */
export function useCreateRequest() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRequestBody) => requestService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: requestKeys.all });
    },
  });
}

// ─── useUploadPhoto ────────────────────────────────────────────────────────

/**
 * Mutation hook to upload a photo for a given request.
 * Currently a stub (backend endpoint WIP); resolves with local URI.
 */
export function useUploadPhoto() {
  return useMutation({
    mutationFn: ({ requestId, photoUri }: { requestId: string; photoUri: string }) =>
      requestService.uploadPhoto(requestId, photoUri),
  });
}
