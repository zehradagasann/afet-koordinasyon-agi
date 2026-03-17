from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from database import engine, SessionLocal
from typing import List
import models
import schemas
from priority_engine import calculate_dynamic_priority

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def read_root():
    return {"message": "Afet Koordinasyon API çalışıyor"}

@app.post("/talep-gonder", response_model=schemas.RequestResponse)
def create_request(request_data: schemas.RequestCreate, db: Session = Depends(get_db)):
    db_request = models.DisasterRequest(**request_data.dict())
    db.add(db_request)
    db.commit()
    db.refresh(db_request)
    return db_request

@app.get("/talepler/oncelikli", response_model=List[schemas.PrioritizedRequestResponse])
def get_prioritized_requests(db: Session = Depends(get_db)):
    all_requests = db.query(models.DisasterRequest).all()

    results = []
    for req in all_requests:
        score = calculate_dynamic_priority(req.need_type, req.created_at)

        results.append({
            "id": req.id,
            "latitude": req.latitude,
            "longitude": req.longitude,
            "need_type": req.need_type,
            "created_at": req.created_at,
            "dynamic_priority_score": score
        })

    # 1. En yüksek dinamik puandan en düşüğe sırala.
    # 2. Eğer puanlar eşitse (Örn: ikisi de 1000 olduysa), en eski tarihli olanı (ilk bekleyeni) öne al.
    results.sort(key=lambda x: (-x["dynamic_priority_score"], x["created_at"]))
    
    return results
from pydantic import BaseModel

class VehicleCreate(BaseModel):
    latitude: float
    longitude: float
    vehicle_type: str
    capacity: str


@app.post("/arac-ekle")
def create_vehicle(vehicle: VehicleCreate, db: Session = Depends(get_db)):
    new_vehicle = models.ReliefVehicle(
        latitude=vehicle.latitude,
        longitude=vehicle.longitude,
        vehicle_type=vehicle.vehicle_type,
        capacity=vehicle.capacity
    )

    db.add(new_vehicle)
    db.commit()
    db.refresh(new_vehicle)

    return new_vehicle
@app.get("/araclar")
def get_vehicles(db: Session = Depends(get_db)):
    vehicles = db.query(models.ReliefVehicle).all()
    return vehicles

from math import sqrt

@app.get("/yakin-araclar")
def get_nearby_vehicles(lat: float, lon: float, db: Session = Depends(get_db)):
    vehicles = db.query(models.ReliefVehicle).all()

    nearby = []

    for v in vehicles:
        distance = sqrt((v.latitude - lat)**2 + (v.longitude - lon)**2)

        if distance < 0.1:  # yaklaşık 5-10 km gibi
            nearby.append(v)

    return nearby

from sqlalchemy import text

@app.get("/yakin-araclar-sql")
def get_nearby_sql(lat: float, lon: float, db: Session = Depends(get_db)):

    query = text("""
        SELECT * FROM relief_vehicles
    """)

    result = db.execute(query)

    vehicles = []

    for row in result:
      vehicles.append(dict(row._mapping))

    return vehicles
from sqlalchemy import text

@app.get("/yakin-araclar-postgis")
def get_nearby_postgis(lat: float, lon: float, db: Session = Depends(get_db)):

    query = text("""
        SELECT *
        FROM relief_vehicles
        WHERE ST_DWithin(
            location,
            ST_SetSRID(ST_MakePoint(:lon, :lat), 4326),
            5000
        )
    """)

    result = db.execute(query, {"lat": lat, "lon": lon})

    vehicles = []
    for row in result:
        vehicles.append(dict(row._mapping))

    return vehicles
