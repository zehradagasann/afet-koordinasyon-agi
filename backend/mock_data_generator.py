import random
import time
from sqlalchemy.orm import Session
from database import SessionLocal
import models

# Istanbul geographic bounds (approximate bounding box)
LAT_MIN, LAT_MAX = 40.8, 41.3
LON_MIN, LON_MAX = 28.6, 29.5

KATEGORILER = ["enkaz", "yangin", "medikal", "gida", "barinma", "su", "is_makinesi", "arama_kurtarma", "ulasim"]
ACILIYETLER = ["dusuk", "orta", "yuksek", "kritik"]

def generate_mock_data(num_records: int = 500):
    db: Session = SessionLocal()
    
    try:
        print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] Generating {num_records} mock records for Istanbul...")
        
        talepler = []
        for _ in range(num_records):
            talep = models.AfetzedeTalep(
                need_type=random.choice(KATEGORILER),
                latitude=round(random.uniform(LAT_MIN, LAT_MAX), 6),
                longitude=round(random.uniform(LON_MIN, LON_MAX), 6)
            )
            talepler.append(talep)
            
        db.add_all(talepler)
        db.commit()
        print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] Successfully inserted {num_records} records into the database.")
        
    except Exception as e:
        db.rollback()
        print(f"Error generating mock data: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    generate_mock_data()
