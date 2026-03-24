from pydantic import BaseModel
from datetime import datetime
from uuid import UUID

class RequestBase(BaseModel):
    latitude: float
    longitude: float
    need_type: str

class RequestCreate(RequestBase):
    pass

class RequestResponse(RequestBase):
    id: UUID
    created_at: datetime

    model_config = {"from_attributes": True}

class PrioritizedRequestResponse(RequestBase):
    id: UUID
    created_at: datetime
    dynamic_priority_score: float

    model_config = {"from_attributes": True}


class ClusterLocation(BaseModel):
    district: str | None = None
    neighborhood: str | None = None
    street: str | None = None
    full_address: str | None = None


class TaskPackageResponse(BaseModel):
    cluster_id: int
    need_type: str
    cluster_name: str
    center_latitude: float
    center_longitude: float
    location: ClusterLocation
    request_count: int
    average_priority_score: float
    priority_level: str
    request_ids: list[str]
