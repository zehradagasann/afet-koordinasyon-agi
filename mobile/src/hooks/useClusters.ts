import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { clusterService } from "@/src/services/clusterService";

export const clusterKeys = {
  all: ["clusters"] as const,
  overrideAlerts: ["override-alerts"] as const,
};

export function useClusters() {
  return useQuery({
    queryKey: clusterKeys.all,
    queryFn: clusterService.getAll,
  });
}

export function useOverrideAlerts() {
  return useQuery({
    queryKey: clusterKeys.overrideAlerts,
    queryFn: clusterService.getOverrideAlerts,
  });
}

export function useExecuteOverride() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ vehicleId, newClusterId }: { vehicleId: string; newClusterId: string }) =>
      clusterService.executeOverride(vehicleId, newClusterId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: clusterKeys.overrideAlerts });
      qc.invalidateQueries({ queryKey: clusterKeys.all });
    },
  });
}

export function useCompleteMission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (clusterId: string) => clusterService.completeMission(clusterId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: clusterKeys.all });
    },
  });
}
