import sys
import os

#YOL AYARI
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


import json
import time
from datetime import datetime
from database import SessionLocal
import models


def backup():
    db = SessionLocal()
    try:
        def serialize(obj_list):
            result = []
            for obj in obj_list:
                data = obj.__dict__.copy()
                data.pop('_sa_instance_state', None)
                result.append(data)
            return result

        requests = db.query(models.DisasterRequest).all()
        vehicles = db.query(models.ReliefVehicle).all()

        data = {
            "requests": serialize(requests),
            "vehicles": serialize(vehicles),
        }

        os.makedirs("backups", exist_ok=True)
        filename = f"backups/backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"

        with open(filename, "w", encoding="utf-8") as f:
            json.dump(data, f, default=str, indent=4)

        print(f"[{datetime.now().strftime('%H:%M:%S')}] Backup alındı: {filename}")
    
    except Exception as e:
        print(f"Hata oluştu: {e}")
    
    finally:
        db.close()

# 4. ÇALIŞTIRMA BLOĞU
if __name__ == "__main__":
    print("Backup sistemi başlatıldı... (Her 6 saatte bir yedek alınacak)") 
    while True:
        backup()
        time.sleep(21600) #6 saatte bir 