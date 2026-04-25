// Backend ile birebir uyumlu durum sabitleri.
// Magic string yerine bu sabitleri kullan — yazım hatasını önler.

// Cluster.status: backend ClusterStatus enum'u ile aynı string'ler
export const CLUSTER_STATUS = {
  ACTIVE: 'active',       // küme oluştu, henüz araç atanmadı
  EN_ROUTE: 'en_route',   // araç görevlendirildi, yolda (UI: "YOLDA")
  RESOLVED: 'resolved',   // görev tamamlandı
};

// ReliefVehicle.vehicle_status
export const VEHICLE_STATUS = {
  AVAILABLE: 'available', // müsait
  EN_ROUTE: 'en_route',   // yolda
  ON_SITE: 'on_site',     // sahada
};
