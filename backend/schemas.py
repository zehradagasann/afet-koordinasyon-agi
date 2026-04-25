from pydantic import BaseModel, Field
from datetime import datetime
from uuid import UUID
from models import RequestStatus, ClusterStatus


class RequestCreate(BaseModel):
    latitude: float
    longitude: float
    need_type: str
    person_count: int = Field(default=1, ge=1)
    description: str | None = None


class RequestResponse(RequestCreate):
    id: UUID
    status: RequestStatus
    created_at: datetime
    is_verified: bool
    model_config = {"from_attributes": True}


class PrioritizedRequestResponse(RequestResponse):
    dynamic_priority_score: float


class StatusUpdate(BaseModel):
    status: RequestStatus


class ClusterLocation(BaseModel):
    district: str | None = None
    neighborhood: str | None = None
    street: str | None = None
    full_address: str | None = None


class StatusSummary(BaseModel):
    pending: int
    assigned: int
    resolved: int


class TaskPackageResponse(BaseModel):
    cluster_id: UUID
    need_type: str
    cluster_name: str
    center_latitude: float
    center_longitude: float
    location: ClusterLocation
    request_count: int
    total_persons_affected: int
    average_priority_score: float
    priority_level: str
    status_summary: StatusSummary
    is_noise_cluster: bool
    status: ClusterStatus
    generated_at: datetime

    model_config = {"from_attributes": True}


class AssignVehicleRequest(BaseModel):
    vehicle_id: UUID
    cluster_id: UUID


class VehicleCreate(BaseModel):
    latitude: float
    longitude: float
    vehicle_type: str
    capacity: str
    base_speed_kmh: int = 60


class VehicleUpdate(BaseModel):
    tent_count: int | None = None
    food_count: int | None = None
    water_count: int | None = None
    medical_count: int | None = None
    blanket_count: int | None = None
    base_speed_kmh: int | None = None


class VehicleResponse(BaseModel):
    id: UUID
    latitude: float
    longitude: float
    vehicle_type: str
    capacity: str
    base_speed_kmh: int
    tent_count: int
    food_count: int
    water_count: int
    medical_count: int
    blanket_count: int
    created_at: datetime
    vehicle_status: str = "available"  # available | en_route | on_site
    assigned_cluster_id: UUID | None = None

    model_config = {"from_attributes": True}


# Vehicle Recommendation Schemas

class VehicleRecommendationDetails(BaseModel):
    distance_km: float
    eta_minutes: int
    available_stock: int
    required_quantity: int
    stock_score: float
    distance_score: float
    speed_score: float
    urgency_score: float
    total_score: float


class VehicleRecommendationResponse(BaseModel):
    vehicle_id: UUID
    vehicle_type: str
    capacity: str
    latitude: float
    longitude: float
    base_speed_kmh: int
    score: float
    details: VehicleRecommendationDetails
    recommendation_text: str  # AI tarafından oluşturulan açıklama


# Sprint 5.5 — Override (Dinamik Rota Kaydırma) Şemaları

class OverrideAlertResponse(BaseModel):
    vehicle_id: UUID
    vehicle_type: str
    vehicle_lat: float
    vehicle_lon: float
    current_cluster_id: UUID
    current_cluster_name: str
    current_cluster_score: float
    current_need_type: str
    new_cluster_id: UUID
    new_cluster_name: str
    new_cluster_score: float
    new_need_type: str
    new_cluster_lat: float
    new_cluster_lon: float
    score_difference: float
    distance_to_new_km: float
    distance_to_current_km: float
    reason: str


class ExecuteOverrideRequest(BaseModel):
    vehicle_id: UUID
    new_cluster_id: UUID


# Sprint 5.6 — Kalibrasyon / Senaryo Test Şemaları

class PriorityScenarioRequest(BaseModel):
    need_type: str
    wait_hours: float = Field(default=0, ge=0, description="Talep oluştuktan sonra geçen süre (saat)")
    temperature_celsius: float | None = None
    vehicles_within_radius: int | None = None
    is_raining: bool = False
    is_night: bool = False


class AppliedBonus(BaseModel):
    name: str
    value: float
    detail: str


class PriorityScenarioResponse(BaseModel):
    need_type: str
    base_score: float
    context_bonus: float
    applied_bonuses: list[AppliedBonus]
    final_score: float



# Authentication Schemas

class UserRegister(BaseModel):
    email: str
    password: str
    first_name: str
    last_name: str
    tc_identity_no: str
    phone: str
    role: str
    expertise_area: str | None = None
    organization: str | None = None
    city: str
    district: str
    profile_photo_url: str | None = None


class UserLogin(BaseModel):
    email: str
    password: str


class UserUpdate(BaseModel):
    first_name: str | None = None
    last_name: str | None = None
    phone: str | None = None
    expertise_area: str | None = None
    organization: str | None = None
    city: str | None = None
    district: str | None = None
    profile_photo_url: str | None = None


class UserResponse(BaseModel):
    id: UUID
    email: str
    first_name: str
    last_name: str
    tc_identity_no: str
    phone: str
    role: str
    expertise_area: str | None
    organization: str | None
    city: str
    district: str
    profile_photo_url: str | None
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class AuthResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse
