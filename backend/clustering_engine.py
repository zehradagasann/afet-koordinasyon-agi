"""
Mekansal Kümeleme Motoru — DBSCAN ile aynı tip ve yakın talepleri kümeler.
- Birbirine 500 metre yakınlıktaki aynı tip talepleri tek küme haline getirir.
- Kümeleri görev paketlerine dönüştürür.
"""

import numpy as np
from sklearn.cluster import DBSCAN
from sqlalchemy.orm import Session

import models
from priority_engine import calculate_dynamic_priority
from geocoder import reverse_geocode

# ── Sabitler ──────────────────────────────────────────────────────────────────
CLUSTER_RADIUS_METERS = 500
EARTH_RADIUS_METERS = 6_371_000
# DBSCAN eps — haversine metriği radyan cinsinden çalışır
EPS_RADIANS = CLUSTER_RADIUS_METERS / EARTH_RADIUS_METERS  # ≈ 7.85e-5
MIN_SAMPLES = 2  # Bir küme oluşması için minimum talep sayısı

# Öncelik seviyeleri (0-100 skalası)
PRIORITY_LEVELS = [
    (75, "Kritik"),
    (50, "Yüksek"),
    (25, "Orta"),
    (0,  "Düşük"),
]

# İhtiyaç tipi etiketleri (Türkçe okunabilir)
NEED_TYPE_LABELS = {
    "su": "Su",
    "gida": "Gıda",
    "barinma": "Barınma",
    "medikal": "Medikal",
    "enkaz": "Enkaz Kaldırma",
    "yangin": "Yangın Söndürme",
    "arama_kurtarma": "Arama Kurtarma",
    "is_makinesi": "İş Makinesi",
    "ulasim": "Ulaşım",
}


def _get_priority_level(score: float) -> str:
    """Puan değerine göre öncelik seviyesi döner."""
    for threshold, level in PRIORITY_LEVELS:
        if score >= threshold:
            return level
    return "Düşük"


def _build_cluster_name(need_type: str, location: dict) -> str:
    """
    Küme adını adres bilgisinden üretir.
    Örn: 'Kadıköy Caferağa - Su Kümesi'
    """
    label = NEED_TYPE_LABELS.get(need_type.lower(), need_type.capitalize())

    parts = []
    if location.get("district"):
        parts.append(location["district"])
    if location.get("neighborhood"):
        parts.append(location["neighborhood"])

    location_str = " ".join(parts) if parts else "Bilinmeyen Bölge"
    return f"{location_str} - {label} Kümesi"


def generate_task_packages(db: Session, need_type_filter: str | None = None) -> list[dict]:
    """
    Tüm talepleri DBSCAN ile kümeler ve görev paketleri üretir.

    Args:
        db: SQLAlchemy oturumu
        need_type_filter: Opsiyonel — sadece belirli bir ihtiyaç tipini kümele

    Returns:
        Kümelenmiş görev paketleri listesi (puana göre sıralı)
    """
    # 1) Talepleri çek
    query = db.query(models.DisasterRequest)
    if need_type_filter:
        query = query.filter(models.DisasterRequest.need_type == need_type_filter.lower())
    all_requests = query.all()

    if not all_requests:
        return []

    # 2) İhtiyaç tipine göre grupla
    groups: dict[str, list] = {}
    for req in all_requests:
        key = req.need_type.lower()
        groups.setdefault(key, []).append(req)

    # 3) Her grup için DBSCAN uygula
    task_packages = []
    global_cluster_id = 0

    for need_type, requests in groups.items():
        coords = np.array([[req.latitude, req.longitude] for req in requests])
        # Radyan cinsine çevir (haversine metriği için)
        coords_rad = np.radians(coords)

        if len(requests) < MIN_SAMPLES:
            # Yetersiz talep — her birini tekli küme olarak ekle
            for req in requests:
                global_cluster_id += 1
                score = calculate_dynamic_priority(req.need_type, req.created_at)
                location = reverse_geocode(req.latitude, req.longitude)
                task_packages.append({
                    "cluster_id": global_cluster_id,
                    "need_type": need_type,
                    "cluster_name": _build_cluster_name(need_type, location),
                    "center_latitude": round(req.latitude, 6),
                    "center_longitude": round(req.longitude, 6),
                    "location": location,
                    "request_count": 1,
                    "average_priority_score": score,
                    "priority_level": _get_priority_level(score),
                    "request_ids": [str(req.id)],
                })
            continue

        dbscan = DBSCAN(
            eps=EPS_RADIANS,
            min_samples=MIN_SAMPLES,
            metric="haversine",
            algorithm="ball_tree",
        )
        labels = dbscan.fit_predict(coords_rad)

        # Küme etiketlerine göre grupla
        cluster_map: dict[int, list[int]] = {}
        for idx, label in enumerate(labels):
            cluster_map.setdefault(label, []).append(idx)

        for label, indices in cluster_map.items():
            global_cluster_id += 1
            cluster_requests = [requests[i] for i in indices]

            # Merkez koordinat (ortalama)
            center_lat = float(np.mean([r.latitude for r in cluster_requests]))
            center_lon = float(np.mean([r.longitude for r in cluster_requests]))

            # Öncelik puanları
            scores = [
                calculate_dynamic_priority(r.need_type, r.created_at)
                for r in cluster_requests
            ]
            avg_score = round(sum(scores) / len(scores), 1)

            # Ters geocoding
            location = reverse_geocode(center_lat, center_lon)
            cluster_name = _build_cluster_name(need_type, location)

            # Gürültü noktaları (label=-1) — adında belirt
            if label == -1:
                cluster_name = f"{cluster_name} (Dağınık)"

            task_packages.append({
                "cluster_id": global_cluster_id,
                "need_type": need_type,
                "cluster_name": cluster_name,
                "center_latitude": round(center_lat, 6),
                "center_longitude": round(center_lon, 6),
                "location": location,
                "request_count": len(cluster_requests),
                "average_priority_score": avg_score,
                "priority_level": _get_priority_level(avg_score),
                "request_ids": [str(r.id) for r in cluster_requests],
            })

    # 4) Puana göre sırala (yüksekten düşüğe)
    task_packages.sort(key=lambda p: -p["average_priority_score"])

    return task_packages
