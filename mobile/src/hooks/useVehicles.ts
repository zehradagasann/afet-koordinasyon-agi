import { useQuery } from "@tanstack/react-query";
import { vehicleService } from "@/src/services/vehicleService";

export const vehicleKeys = {
  all: ["vehicles"] as const,
};

export function useVehicles() {
  return useQuery({
    queryKey: vehicleKeys.all,
    queryFn: vehicleService.getAll,
  });
}
