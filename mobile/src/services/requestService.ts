import { api, AppError } from "./api";
import type { CreateRequestBody, DisasterRequest } from "@/src/types";

/**
 * Backend mount: `app.include_router(requests_router.router, prefix="/api/ihbarlar")`.
 * Mevcut endpoints:
 *   POST   /api/ihbarlar              create
 *   GET    /api/ihbarlar/prioritized  tum talepler (oncelik sirali)
 *   PATCH  /api/ihbarlar/{id}/status  durum guncelle
 *   GET    /api/ihbarlar/dogrulanmamis
 *   GET    /api/ihbarlar/istatistikler
 *
 * NOT: Backend'de su an "GET /api/ihbarlar" (list) ve "GET /api/ihbarlar/{id}" (detail)
 * endpoint'leri yok. Mobil tarafta `prioritized` listesini cekip client-side filter yapiyoruz.
 * Photo upload endpoint'i de henuz yok; gracefully no-op donduruyoruz.
 */

const BASE = "/api/ihbarlar";

export const requestService = {
  async create(data: CreateRequestBody): Promise<DisasterRequest> {
    const response = await api.post<DisasterRequest>(BASE, data);
    return response.data;
  },

  /** Giriş yapan kullanıcıya ait talepleri döndürür (GET /api/ihbarlar/mine). */
  async getMyRequests(): Promise<DisasterRequest[]> {
    const response = await api.get<DisasterRequest[]>(`${BASE}/mine`);
    return response.data;
  },

  /**
   * Backend `GET /api/ihbarlar` yok; `prioritized` endpoint'inden tum
   * talepleri cekiyoruz. Bu listede dynamic_priority_score var ama
   * DisasterRequest interface'i icin gereksiz alani yok sayiyoruz.
   */
  async getAll(): Promise<DisasterRequest[]> {
    const response = await api.get<DisasterRequest[]>(`${BASE}/prioritized`);
    return response.data;
  },

  async getPrioritized(): Promise<DisasterRequest[]> {
    const response = await api.get<DisasterRequest[]>(`${BASE}/prioritized`);
    return response.data;
  },

  /**
   * Backend'de detail endpoint'i yok; listeden filtreleyerek bulan
   * client-side fallback. Bulunamazsa 404 firlatir.
   */
  async getById(id: string): Promise<DisasterRequest> {
    const all = await this.getAll();
    const found = all.find((r) => r.id === id);
    if (!found) {
      throw new AppError("Talep bulunamadı", 404);
    }
    return found;
  },

  /**
   * Photo upload endpoint'i backend'de henuz hazir degil. URI'ler
   * lokalde tutuluyor; backend hazir oldugunda burayi gercek upload'a
   * cevir. Simdilik basarili gibi davraniyoruz ki UI akisi kirilmasin.
   */
  async uploadPhoto(_requestId: string, photoUri: string): Promise<string> {
    if (__DEV__) {
      console.log("[requestService] uploadPhoto skipped (backend WIP):", photoUri);
    }
    return photoUri;
  },
};
