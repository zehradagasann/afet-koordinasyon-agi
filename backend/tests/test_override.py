import pytest
from uuid import uuid4
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Base, Cluster, ReliefVehicle, ClusterStatus
from constants import VehicleStatus
from services.override_detector import detect_override_opportunities

# In-memory SQLite for isolated testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="function")
def db_session():
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    yield session
    session.close()
    Base.metadata.drop_all(bind=engine)


def test_override_detector_critical_preempt(db_session):
    """
    Test 1: Mevcut küme preempt edilebilir (Gıda), Yeni küme Kritik (Medikal).
    Bunun override olarak önerilmesi gerekir.
    """
    # 1. Eski (Mevcut) Küme
    old_cluster_id = uuid4()
    old_cluster = Cluster(
        id=old_cluster_id,
        need_type="gida",
        cluster_name="Gıda Kümesi",
        center_latitude=41.0,
        center_longitude=29.0,
        request_count=5,
        total_persons_affected=50,
        average_priority_score=40.0,
        priority_level="Orta",
        status=ClusterStatus.en_route
    )
    
    # 2. Araç (Eski Kümeye Yolda)
    vehicle = ReliefVehicle(
        id=uuid4(),
        vehicle_type="Panelvan",
        latitude=41.01,
        longitude=29.01,
        vehicle_status=VehicleStatus.EN_ROUTE,
        assigned_cluster_id=old_cluster_id
    )
    
    # 3. Yeni Kritik Küme (Medikal)
    new_cluster_id = uuid4()
    new_cluster = Cluster(
        id=new_cluster_id,
        need_type="medikal",
        cluster_name="Medikal Acil",
        center_latitude=41.02,
        center_longitude=29.02,
        request_count=10,
        total_persons_affected=10,
        average_priority_score=95.0,
        priority_level="Kritik",
        status=ClusterStatus.active
    )
    
    db_session.add_all([old_cluster, vehicle, new_cluster])
    db_session.commit()
    
    # Servisi çalıştır
    overrides = detect_override_opportunities(db_session)
    
    assert len(overrides) == 1
    assert overrides[0]["vehicle_id"] == str(vehicle.id)
    assert overrides[0]["new_cluster_id"] == str(new_cluster.id)
    assert "Kritik ihtiyaç" in overrides[0]["reason"]
    assert overrides[0]["score_difference"] == 55.0


def test_override_detector_score_threshold(db_session):
    """
    Test 2: İkisi de barınma ama puan farkı > 20 olduğu için override önermeli.
    """
    old_cluster_id = uuid4()
    old_cluster = Cluster(
        id=old_cluster_id,
        need_type="barinma",
        cluster_name="Eski Barınma",
        center_latitude=41.0,
        center_longitude=29.0,
        request_count=5,
        total_persons_affected=20,
        average_priority_score=30.0,
        priority_level="Orta",
        status=ClusterStatus.en_route
    )
    
    vehicle = ReliefVehicle(
        id=uuid4(),
        vehicle_type="Kamyon",
        latitude=41.01,
        longitude=29.01,
        vehicle_status=VehicleStatus.EN_ROUTE,
        assigned_cluster_id=old_cluster_id
    )
    
    new_cluster_id = uuid4()
    new_cluster = Cluster(
        id=new_cluster_id,
        need_type="barinma",
        cluster_name="Yeni Barınma (Acil)",
        center_latitude=41.02,
        center_longitude=29.02,
        request_count=50,
        total_persons_affected=200,
        average_priority_score=60.0, # Fark: 30 > 20 threshold
        priority_level="Yüksek",
        status=ClusterStatus.active
    )
    
    db_session.add_all([old_cluster, vehicle, new_cluster])
    db_session.commit()
    
    overrides = detect_override_opportunities(db_session)
    
    assert len(overrides) == 1
    assert overrides[0]["vehicle_id"] == str(vehicle.id)
    assert "30.0 puan daha kritik" in overrides[0]["reason"]


def test_override_detector_too_far(db_session):
    """
    Test 3: Yeni küme çok yüksek puanlı olsa bile araçtan 50 km uzaktaysa önerilmemeli.
    """
    old_cluster_id = uuid4()
    old_cluster = Cluster(
        id=old_cluster_id,
        need_type="su",
        cluster_name="Su",
        center_latitude=41.0,
        center_longitude=29.0,
        request_count=1,
        total_persons_affected=5,
        average_priority_score=10.0,
        priority_level="Düşük",
        status=ClusterStatus.en_route
    )
    
    vehicle = ReliefVehicle(
        id=uuid4(),
        vehicle_type="Kamyon",
        latitude=41.0,
        longitude=29.0,
        vehicle_status=VehicleStatus.EN_ROUTE,
        assigned_cluster_id=old_cluster_id
    )
    
    new_cluster_id = uuid4()
    new_cluster = Cluster(
        id=new_cluster_id,
        need_type="medikal",
        cluster_name="Uzak Medikal",
        center_latitude=42.0, # ~111 km uzakta
        center_longitude=29.0,
        request_count=100,
        total_persons_affected=100,
        average_priority_score=99.0,
        priority_level="Kritik",
        status=ClusterStatus.active
    )
    
    db_session.add_all([old_cluster, vehicle, new_cluster])
    db_session.commit()
    
    overrides = detect_override_opportunities(db_session)
    
    # 50 km threshold'u aştığı için boş dönmeli
    assert len(overrides) == 0
