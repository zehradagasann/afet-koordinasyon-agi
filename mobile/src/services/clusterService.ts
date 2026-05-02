import { api } from "./api";
import type { Cluster, VehicleOverrideAlert } from "@/src/types";

const BASE = "/requests/task-packages";

export const clusterService = {
  async getOverrideAlerts(): Promise<VehicleOverrideAlert[]> {
    const response = await api.get<VehicleOverrideAlert[]>(
      `${BASE}/override-alerts`
    );
    return response.data;
  },

  async getAll(): Promise<Cluster[]> {
    const response = await api.get<Cluster[]>(BASE);
    return response.data;
  },

  async getById(id: string): Promise<Cluster> {
    const response = await api.get<Cluster>(`${BASE}/${id}`);
    return response.data;
  },

  async executeOverride(vehicleId: string, newClusterId: string) {
    const response = await api.post(`${BASE}/execute-override`, {
      vehicle_id: vehicleId,
      new_cluster_id: newClusterId,
    });
    return response.data;
  },

  async completeMission(clusterId: string) {
    const response = await api.post(`${BASE}/${clusterId}/complete`);
    return response.data;
  },
};
