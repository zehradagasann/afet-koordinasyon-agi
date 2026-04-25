"""
Dinamik Rota Kaydırma (Override) Tespit Servisi — Sprint 5.5

Yolda olan araçlar için, varış noktasından daha kritik bir küme oluştuğunda
yetkiliye "Aracı Oraya Kaydır" uyarısı üretir.
"""
from typing import List, Dict
from sqlalchemy.orm import Session

from models import ReliefVehicle, Cluster, ClusterStatus
from constants import VehicleStatus
from services.vehicle_recommendation import calculate_haversine_distance


# ---------------------------------------------------------------------------
# Override Politika Parametreleri
# ---------------------------------------------------------------------------

# Yeni küme, mevcut hedeften en az bu kadar puan üstündeyse override önerilir
OVERRIDE_SCORE_THRESHOLD = 20.0

# Bu tipler her zaman önceliklendirilir (kanama, enkaz altı vb.)
OVERRIDE_CRITICAL_TYPES = {"medikal", "arama_kurtarma"}

# Bu tipler, kritik bir tip için preempt edilebilir
OVERRIDABLE_TYPES = {"barinma", "gida", "su", "ulasim", "is_makinesi", "enkaz"}

# Aracın çok uzak bir kümeye kaydırılmasını engelle (km)
MAX_REDIRECT_DISTANCE_KM = 50.0


def _build_override_payload(
    vehicle: ReliefVehicle,
    current_cluster: Cluster,
    new_cluster: Cluster,
    reason: str,
) -> Dict:
    """Override önerisi için yanıt yapısı."""
    dist_to_new = calculate_haversine_distance(
        vehicle.latitude, vehicle.longitude,
        new_cluster.center_latitude, new_cluster.center_longitude,
    )
    dist_to_current = calculate_haversine_distance(
        vehicle.latitude, vehicle.longitude,
        current_cluster.center_latitude, current_cluster.center_longitude,
    )
    score_diff = (
        new_cluster.average_priority_score - current_cluster.average_priority_score
    )

    return {
        "vehicle_id": str(vehicle.id),
        "vehicle_type": vehicle.vehicle_type,
        "vehicle_lat": vehicle.latitude,
        "vehicle_lon": vehicle.longitude,
        "current_cluster_id": str(current_cluster.id),
        "current_cluster_name": current_cluster.cluster_name,
        "current_cluster_score": round(current_cluster.average_priority_score, 1),
        "current_need_type": current_cluster.need_type,
        "new_cluster_id": str(new_cluster.id),
        "new_cluster_name": new_cluster.cluster_name,
        "new_cluster_score": round(new_cluster.average_priority_score, 1),
        "new_need_type": new_cluster.need_type,
        "new_cluster_lat": new_cluster.center_latitude,
        "new_cluster_lon": new_cluster.center_longitude,
        "score_difference": round(score_diff, 1),
        "distance_to_new_km": round(dist_to_new, 2),
        "distance_to_current_km": round(dist_to_current, 2),
        "reason": reason,
    }


def detect_override_opportunities(db: Session) -> List[Dict]:
    """
    Yolda olan tüm araçlar için override fırsatı taraması yapar.

    Kriterler (OR ilişkisi):
    1. Yeni küme tipi kritik (medikal/arama_kurtarma) ve mevcut hedef preempt edilebilir
    2. Yeni kümenin puanı, mevcut hedeften en az OVERRIDE_SCORE_THRESHOLD puan yüksek

    Returns:
        Override önerileri listesi (her araç için en güçlü öneri).
    """
    en_route_vehicles = (
        db.query(ReliefVehicle)
        .filter(
            ReliefVehicle.vehicle_status == VehicleStatus.EN_ROUTE,
            ReliefVehicle.assigned_cluster_id.isnot(None),
        )
        .all()
    )

    if not en_route_vehicles:
        return []

    active_clusters = (
        db.query(Cluster)
        .filter(Cluster.status == ClusterStatus.active)
        .all()
    )

    if not active_clusters:
        return []

    overrides: List[Dict] = []

    for vehicle in en_route_vehicles:
        current_cluster = (
            db.query(Cluster)
            .filter(Cluster.id == vehicle.assigned_cluster_id)
            .first()
        )
        if not current_cluster:
            continue

        candidate_overrides: List[Dict] = []

        for new_cluster in active_clusters:
            if new_cluster.id == vehicle.assigned_cluster_id:
                continue

            # Çok uzak kümeleri eleme
            dist_to_new = calculate_haversine_distance(
                vehicle.latitude, vehicle.longitude,
                new_cluster.center_latitude, new_cluster.center_longitude,
            )
            if dist_to_new > MAX_REDIRECT_DISTANCE_KM:
                continue

            score_diff = (
                new_cluster.average_priority_score
                - current_cluster.average_priority_score
            )

            type_upgrade = (
                new_cluster.need_type in OVERRIDE_CRITICAL_TYPES
                and current_cluster.need_type in OVERRIDABLE_TYPES
            )
            score_upgrade = score_diff >= OVERRIDE_SCORE_THRESHOLD

            if not (type_upgrade or score_upgrade):
                continue

            if type_upgrade and score_upgrade:
                reason = (
                    f"Kritik ihtiyaç ({new_cluster.need_type}) tespit edildi "
                    f"ve puan farkı +{round(score_diff, 1)}"
                )
            elif type_upgrade:
                reason = (
                    f"Kritik ihtiyaç tipi ({new_cluster.need_type}) "
                    f"mevcut görevi öne geçer"
                )
            else:
                reason = f"Yeni küme {round(score_diff, 1)} puan daha kritik"

            candidate_overrides.append(
                _build_override_payload(
                    vehicle, current_cluster, new_cluster, reason
                )
            )

        # Her araç için en yüksek puanlı override'ı seç
        if candidate_overrides:
            candidate_overrides.sort(
                key=lambda c: c["new_cluster_score"], reverse=True
            )
            overrides.append(candidate_overrides[0])

    return overrides
