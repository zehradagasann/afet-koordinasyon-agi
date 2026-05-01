import NetInfo from "@react-native-community/netinfo";
import { useCallback, useEffect } from "react";
import { AppError } from "@/src/services/api";
import { requestService } from "@/src/services/requestService";
import {
  useUIStore,
  type PendingRequest,
} from "@/src/stores/uiStore";

function isNetworkAvailable(
  state: Awaited<ReturnType<typeof NetInfo.fetch>>
): boolean {
  if (!state.isConnected) return false;
  if (state.isInternetReachable === false) return false;
  return true;
}

export function usePendingRequestSync() {
  const pendingRequests = useUIStore((state) => state.pendingRequests);
  const isSyncing = useUIStore((state) => state.isSyncingPending);
  const removePending = useUIStore((state) => state.removePendingRequest);
  const setSyncing = useUIStore((state) => state.setSyncingPending);

  const flushQueue = useCallback(async () => {
    if (isSyncing) return;
    if (!pendingRequests.length) return;

    const networkState = await NetInfo.fetch();
    if (!isNetworkAvailable(networkState)) return;

    setSyncing(true);
    try {
      const queue = [...pendingRequests] as PendingRequest[];
      for (const item of queue) {
        try {
          const created = await requestService.create({
            latitude: item.latitude,
            longitude: item.longitude,
            need_type: item.needType,
            person_count: item.personCount,
            description: item.description,
          });

          for (const uri of item.photoUris) {
            await requestService.uploadPhoto(created.id, uri);
          }

          removePending(item.id);
        } catch (error) {
          if (error instanceof AppError) {
            if (error.isNetworkError) {
              // Bağlantı hâlâ yok → tekrar denemek için berh.
              break;
            }
          }
          // Diğer hatalarda (ör. validation) queue'yu temizleyelim ki takılmasın.
          removePending(item.id);
        }
      }
    } finally {
      setSyncing(false);
    }
  }, [isSyncing, pendingRequests, removePending, setSyncing]);

  useEffect(() => {
    flushQueue();
  }, [flushQueue]);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (isNetworkAvailable(state)) {
        flushQueue();
      }
    });
    return unsubscribe;
  }, [flushQueue]);
}
