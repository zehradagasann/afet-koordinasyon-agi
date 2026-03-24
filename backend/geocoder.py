"""
Ters Geocoding Modülü — Enlem/Boylam → Mahalle, Cadde, İlçe bilgisi
Nominatim (OpenStreetMap) üzerinden ücretsiz ters geocoding yapar.
"""

from functools import lru_cache
from geopy.geocoders import Nominatim
from geopy.extra.rate_limiter import RateLimiter

geolocator = Nominatim(user_agent="afet-koordinasyon-agi/1.0", timeout=5)
_reverse = RateLimiter(geolocator.reverse, min_delay_seconds=1.1, max_retries=1)

# Koordinatları 2 ondalık haneye yuvarlayarak cache hit oranını artır
# 2 ondalık ≈ ~1.1 km hassasiyet — küme merkezi için yeterli ve cache hit artar
_PRECISION = 2


@lru_cache(maxsize=2048)
def _cached_reverse(lat_round: float, lon_round: float) -> dict | None:
    """Yuvarlanmış koordinat ile ters geocoding sorgusunu cache'le."""
    try:
        location = _reverse(
            f"{lat_round}, {lon_round}",
            language="tr",
            exactly_one=True,
        )
        if location and location.raw and "address" in location.raw:
            return location.raw["address"]
    except Exception as e:
        print(f"[Geocoder] Ters geocoding hatası ({lat_round}, {lon_round}): {e}")
    return None


def reverse_geocode(lat: float, lon: float) -> dict:
    """
    Verilen enlem/boylam için adres bilgisi döner.

    Returns:
        {
            "district": "Kadıköy",
            "neighborhood": "Caferağa Mah.",
            "street": "Moda Cd.",
            "full_address": "Moda Cd., Caferağa Mah., Kadıköy, İstanbul"
        }
    """
    lat_r = round(lat, _PRECISION)
    lon_r = round(lon, _PRECISION)

    address = _cached_reverse(lat_r, lon_r)

    result = {
        "district": None,
        "neighborhood": None,
        "street": None,
        "full_address": None,
    }

    if not address:
        return result

    # Nominatim Türkiye yanıtlarında kullanılan alan isimleri
    result["district"] = (
        address.get("town")
        or address.get("county")
        or address.get("city_district")
        or address.get("suburb")
    )
    result["neighborhood"] = (
        address.get("neighbourhood")
        or address.get("quarter")
        or address.get("suburb")
    )
    result["street"] = (
        address.get("road")
        or address.get("pedestrian")
        or address.get("footway")
    )

    # Tam adres metnini oluştur
    parts = [
        p for p in [result["street"], result["neighborhood"], result["district"]]
        if p
    ]
    result["full_address"] = ", ".join(parts) if parts else address.get("display_name")

    return result
