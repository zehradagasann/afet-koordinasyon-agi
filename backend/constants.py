"""
Sistem genelinde kullanılan sabit string değerleri.
Magic string yerine bu sabitleri kullanın — yazım hatalarını önler ve
gelecekteki yeniden adlandırmaları kolaylaştırır.
"""


class VehicleStatus:
    """ReliefVehicle.vehicle_status için izinli değerler."""
    AVAILABLE = "available"   # Aracın müsait, atama bekliyor
    EN_ROUTE = "en_route"     # Araç bir kümeye doğru yolda
    ON_SITE = "on_site"       # Araç sahada, görevi yürütüyor
