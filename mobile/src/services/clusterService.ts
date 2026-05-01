import { api } from "./api";
import type { VehicleOverrideAlert } from "@/src/types";

const BASE = "/requests/task-packages";

export const clusterService = {
  async getOverrideAlerts(): Promise<VehicleOverrideAlert[]> {
    const response = await api.get<VehicleOverrideAlert[]>(
      `${BASE}/override-alerts`
    );
    return response.data;
  },
};
