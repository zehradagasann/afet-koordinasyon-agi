import { api } from "./api";
import type { Vehicle } from "@/src/types";

const BASE = "/vehicles";

export const vehicleService = {
  async getAll(): Promise<Vehicle[]> {
    const response = await api.get<Vehicle[]>(BASE);
    return response.data;
  },

  async getById(id: string): Promise<Vehicle> {
    const response = await api.get<Vehicle>(`${BASE}/${id}`);
    return response.data;
  },
};
