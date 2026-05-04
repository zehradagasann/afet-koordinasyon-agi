// ─── Auth ──────────────────────────────────────────────────────────────────
// Backend kaynak: backend/schemas.py UserRegister, UserResponse, AuthResponse

export type UserRole = "citizen" | "volunteer" | "coordinator" | "admin";

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  tc_identity_no: string;
  phone: string;
  role: UserRole | string;
  expertise_area: string | null;
  organization: string | null;
  city: string;
  district: string;
  profile_photo_url: string | null;
  is_active: boolean;
  created_at: string;
}

export interface AuthTokens {
  access_token: string;
  token_type: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  tc_identity_no: string;
  phone: string;
  role: UserRole;
  expertise_area?: string;
  organization?: string;
  city: string;
  district: string;
  profile_photo_url?: string;
}

export interface AuthResponse {
  user: User;
  access_token: string;
  token_type: string;
}

// ─── Location ──────────────────────────────────────────────────────────────

export interface Location {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: number;
}

// ─── Request / Talep ───────────────────────────────────────────────────────

export type NeedType =
  | "shelter"
  | "food"
  | "medical"
  | "water"
  | "clothing"
  | "hygiene"
  | "heating"
  | "rescue"
  | "other";

export type RequestStatus =
  | "pending"    // Beklemede
  | "active"     // Aktif — ekip yolda
  | "assigned"   // Atandı — araç görevlendirildi
  | "resolved"   // Çözüldü
  | "cancelled"; // İptal edildi

export interface DisasterRequest {
  id: string;
  user_id: string;
  latitude: number;
  longitude: number;
  need_type: NeedType;
  person_count: number;
  description?: string;
  status: RequestStatus;
  is_verified: boolean;
  photo_urls?: string[];
  audio_url?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateRequestBody {
  latitude: number;
  longitude: number;
  need_type: NeedType;
  person_count: number;
  description?: string;
}

// ─── API ───────────────────────────────────────────────────────────────────

export interface ApiError {
  detail: string;
  status_code?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
}

// ─── UI ────────────────────────────────────────────────────────────────────

export type AlertSeverity = "info" | "warning" | "danger";

export interface AlertNotification {
  id: string;
  title: string;
  message: string;
  severity: AlertSeverity;
  created_at: string;
  read: boolean;
}

export interface VehicleOverrideAlert {
  vehicle_id: string;
  vehicle_type: string;
  vehicle_lat: number;
  vehicle_lon: number;
  current_cluster_id: string;
  current_cluster_name: string;
  current_cluster_score: number;
  current_need_type: string;
  new_cluster_id: string;
  new_cluster_name: string;
  new_cluster_score: number;
  new_need_type: string;
  new_cluster_lat: number;
  new_cluster_lon: number;
  score_difference: number;
}

// ─── Cluster & Vehicle ─────────────────────────────────────────────────────

export interface Cluster {
  cluster_id: string;
  need_type: string;
  cluster_name: string;
  center_latitude: number;
  center_longitude: number;
  request_count: number;
  total_persons_affected: number;
  average_priority_score: number;
  priority_level: "low" | "medium" | "high" | "critical";
  status: "active" | "resolved" | "en_route";
}

export interface Vehicle {
  id: string;
  vehicle_type: string;
  capacity: string;
  latitude: number;
  longitude: number;
  vehicle_status: "available" | "en_route" | "on_site" | "maintenance";
  assigned_cluster_id?: string;
  tent_count: number;
  food_count: number;
  water_count: number;
  medical_count: number;
  blanket_count: number;
}

// ─── Navigation ────────────────────────────────────────────────────────────

export type RootStackParamList = {
  "(auth)": undefined;
  "(app)": undefined;
};

export type AuthStackParamList = {
  login: undefined;
  register: undefined;
};

export type AppStackParamList = {
  index: undefined;
  "request/location": undefined;
  "request/persons": undefined;
  "request/needs": undefined;
  "request/detail": undefined;
  "request/confirm": undefined;
  "requests/list": undefined;
  "requests/[id]": { id: string };
  "status/[id]": { id: string };
};
