from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from models import Base
from routers import vehicles

SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def _build_app() -> FastAPI:
    app = FastAPI()
    app.include_router(vehicles.router)

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[vehicles.get_db] = override_get_db
    return app


def test_create_vehicle_accepts_identifier_and_initial_stock():
    Base.metadata.create_all(bind=engine)
    app = _build_app()
    client = TestClient(app)

    try:
        payload = {
            "latitude": 41.0082,
            "longitude": 28.9784,
            "vehicle_type": "Kamyon",
            "plate_number": "34 ABC 123",
            "capacity": "10 Ton",
            "base_speed_kmh": 65,
            "tent_count": 25,
            "food_count": 40,
            "water_count": 120,
            "medical_count": 12,
            "blanket_count": 30,
        }

        response = client.post("/api/vehicles/", json=payload)

        assert response.status_code == 201
        body = response.json()
        assert body["vehicle_type"] == "Kamyon"
        assert body["plate_number"] == "34 ABC 123"
        assert body["base_speed_kmh"] == 65
        assert body["tent_count"] == 25
        assert body["food_count"] == 40
        assert body["water_count"] == 120
        assert body["medical_count"] == 12
        assert body["blanket_count"] == 30
    finally:
        client.close()
        app.dependency_overrides.clear()
        Base.metadata.drop_all(bind=engine)


def test_partial_vehicle_update_preserves_unsent_fields():
    Base.metadata.create_all(bind=engine)
    app = _build_app()
    client = TestClient(app)

    try:
        create_payload = {
            "latitude": 41.0082,
            "longitude": 28.9784,
            "vehicle_type": "Ambulans",
            "plate_number": "06 RESQ 06",
            "capacity": "Tam Donanımlı",
            "base_speed_kmh": 80,
            "tent_count": 3,
            "food_count": 5,
            "water_count": 20,
            "medical_count": 15,
            "blanket_count": 8,
        }
        create_response = client.post("/api/vehicles/", json=create_payload)
        assert create_response.status_code == 201
        vehicle_id = create_response.json()["id"]

        update_response = client.put(
            f"/api/vehicles/{vehicle_id}",
            json={"tent_count": 10},
        )

        assert update_response.status_code == 200
        body = update_response.json()
        assert body["tent_count"] == 10
        assert body["food_count"] == 5
        assert body["water_count"] == 20
        assert body["medical_count"] == 15
        assert body["blanket_count"] == 8
        assert body["plate_number"] == "06 RESQ 06"
    finally:
        client.close()
        app.dependency_overrides.clear()
        Base.metadata.drop_all(bind=engine)
