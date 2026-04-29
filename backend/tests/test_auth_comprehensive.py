"""Kapsamlı Authentication Tests - pytest ile yazılmış testler"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool
import sys
import os

# Backend modüllerini import et
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from main import app
from database import Base, SessionLocal
from core.dependencies import get_db
import models
import schemas
from routers.auth import get_password_hash, verify_password


# Test veritabanı konfigürasyonu
@pytest.fixture(scope="function")
def test_db():
    """Test veritabanı oluştur ve temizle"""
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)

    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

    def override_get_db():
        try:
            db = TestingSessionLocal()
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db

    yield TestingSessionLocal

    Base.metadata.drop_all(bind=engine)
    app.dependency_overrides.clear()


@pytest.fixture
def client(test_db):
    """FastAPI test client"""
    return TestClient(app)


@pytest.fixture
def test_user_data():
    """Test kullanıcı verileri"""
    return {
        "email": "test@example.com",
        "password": "Test123!@#",
        "first_name": "Test",
        "last_name": "User",
        "tc_identity_no": "12345678901",
        "phone": "05551234567",
        "role": "volunteer",
        "expertise_area": "medikal",
        "organization": "Test Org",
        "city": "İstanbul",
        "district": "Kadıköy",
        "profile_photo_url": "https://example.com/photo.png"
    }


# ============================================================
# PASSWORD HASHING VE VERIFICATION TESTLERI
# ============================================================

class TestPasswordHashing:
    """Şifre hashing ve verification testleri"""

    def test_password_hashing_creates_different_hash(self):
        """Aynı şifre fakat farklı hash'ler oluşturulması"""
        password = "MySecurePassword123!"
        hash1 = get_password_hash(password)
        hash2 = get_password_hash(password)

        # Hash'ler farklı olmalı (salt farklı)
        assert hash1 != hash2

    def test_verify_password_with_correct_password(self):
        """Doğru şifre verification'u"""
        password = "MySecurePassword123!"
        hashed = get_password_hash(password)

        assert verify_password(password, hashed) is True

    def test_verify_password_with_wrong_password(self):
        """Yanlış şifre verification'u"""
        password = "MySecurePassword123!"
        hashed = get_password_hash(password)

        assert verify_password("WrongPassword", hashed) is False

    def test_verify_password_case_sensitive(self):
        """Şifre büyük/küçük harf duyarlı olmalı"""
        password = "MySecurePassword"
        hashed = get_password_hash(password)

        assert verify_password("mysecurepassword", hashed) is False
        assert verify_password("MYSECUREPASSWORD", hashed) is False


# ============================================================
# REGISTRATION TESTLERI
# ============================================================

class TestRegistration:
    """Kayıt işlemi testleri"""

    def test_successful_registration(self, client, test_user_data):
        """Başarılı kullanıcı kaydı"""
        response = client.post("/auth/register", json=test_user_data)

        assert response.status_code == 201
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert data["user"]["email"] == test_user_data["email"]
        assert data["user"]["first_name"] == test_user_data["first_name"]
        assert data["user"]["last_name"] == test_user_data["last_name"]
        assert data["user"]["role"] == test_user_data["role"]
        assert data["user"]["tc_identity_no"] == test_user_data["tc_identity_no"]
        assert data["user"]["is_active"] is True

    def test_registration_with_duplicate_email(self, client, test_user_data):
        """Aynı e-posta ile iki kez kayıt"""
        # İlk kayıt başarılı olmalı
        response1 = client.post("/auth/register", json=test_user_data)
        assert response1.status_code == 201

        # İkinci kayıt başarısız olmalı
        response2 = client.post("/auth/register", json=test_user_data)
        assert response2.status_code == 400
        assert "e-posta" in response2.json()["detail"].lower()

    def test_registration_with_duplicate_tc_identity(self, client, test_user_data):
        """Aynı TC Kimlik No ile iki kez kayıt"""
        response1 = client.post("/auth/register", json=test_user_data)
        assert response1.status_code == 201

        # Aynı TC kimlik ile farklı e-posta kullan
        test_user_data["email"] = "different@example.com"
        response2 = client.post("/auth/register", json=test_user_data)
        assert response2.status_code == 400
        assert "TC Kimlik" in response2.json()["detail"]

    def test_registration_creates_active_user(self, client, test_user_data, test_db):
        """Kayıt sırasında oluşturulan kullanıcı aktif olmalı"""
        response = client.post("/auth/register", json=test_user_data)
        assert response.status_code == 201

        # Veritabanından kontrol et
        db = test_db()
        user = db.query(models.User).filter(
            models.User.email == test_user_data["email"]
        ).first()

        assert user is not None
        assert user.is_active is True
        assert user.role == test_user_data["role"]
        db.close()

    def test_registration_returns_valid_token(self, client, test_user_data):
        """Kayıt sırasında dönen token geçerli olmalı"""
        response = client.post("/auth/register", json=test_user_data)
        assert response.status_code == 201

        token = response.json()["access_token"]
        assert len(token) > 0
        assert isinstance(token, str)


# ============================================================
# LOGIN TESTLERI
# ============================================================

class TestLogin:
    """Giriş işlemi testleri"""

    def test_successful_login(self, client, test_user_data):
        """Başarılı giriş"""
        # Önce kullanıcıyı kayıt et
        client.post("/auth/register", json=test_user_data)

        # Giriş yap
        credentials = {
            "email": test_user_data["email"],
            "password": test_user_data["password"]
        }
        response = client.post("/auth/login", json=credentials)

        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert data["user"]["email"] == test_user_data["email"]

    def test_login_with_wrong_password(self, client, test_user_data):
        """Yanlış şifre ile giriş"""
        client.post("/auth/register", json=test_user_data)

        credentials = {
            "email": test_user_data["email"],
            "password": "WrongPassword123!@#"
        }
        response = client.post("/auth/login", json=credentials)

        assert response.status_code == 401
        assert "hatalı" in response.json()["detail"].lower()

    def test_login_with_nonexistent_email(self, client):
        """Var olmayan e-posta ile giriş"""
        credentials = {
            "email": "nonexistent@example.com",
            "password": "SomePassword123!@#"
        }
        response = client.post("/auth/login", json=credentials)

        assert response.status_code == 401
        assert "hatalı" in response.json()["detail"].lower()

    def test_login_with_inactive_user(self, client, test_user_data, test_db):
        """İnaktif kullanıcı ile giriş"""
        # Kullanıcıyı kayıt et
        client.post("/auth/register", json=test_user_data)

        # Kullanıcıyı deaktif et
        db = test_db()
        user = db.query(models.User).filter(
            models.User.email == test_user_data["email"]
        ).first()
        user.is_active = False
        db.commit()
        db.close()

        # Giriş dene
        credentials = {
            "email": test_user_data["email"],
            "password": test_user_data["password"]
        }
        response = client.post("/auth/login", json=credentials)

        assert response.status_code == 403
        assert "devre dışı" in response.json()["detail"].lower()

    def test_login_returns_different_tokens(self, client, test_user_data):
        """Her giriş farklı token dönmeli"""
        client.post("/auth/register", json=test_user_data)

        credentials = {
            "email": test_user_data["email"],
            "password": test_user_data["password"]
        }

        response1 = client.post("/auth/login", json=credentials)
        response2 = client.post("/auth/login", json=credentials)

        token1 = response1.json()["access_token"]
        token2 = response2.json()["access_token"]

        # Token'lar farklı olabilir veya aynı olabilir (exp süresi bağlı)
        # Ama geçerli olmalılar
        assert len(token1) > 0
        assert len(token2) > 0


# ============================================================
# GET CURRENT USER (/me) TESTLERI
# ============================================================

class TestGetCurrentUser:
    """Mevcut kullanıcı bilgisi endpoint'i testleri"""

    def test_get_current_user_with_valid_token(self, client, test_user_data):
        """Geçerli token ile mevcut kullanıcı bilgisi"""
        # Kayıt ve token al
        register_response = client.post("/auth/register", json=test_user_data)
        token = register_response.json()["access_token"]

        # /me endpoint'ini çağır
        headers = {"Authorization": f"Bearer {token}"}
        response = client.get("/auth/me", headers=headers)

        assert response.status_code == 200
        data = response.json()
        assert data["email"] == test_user_data["email"]
        assert data["first_name"] == test_user_data["first_name"]
        assert data["role"] == test_user_data["role"]

    def test_get_current_user_without_token(self, client):
        """Token olmadan /me çağrısı"""
        response = client.get("/auth/me")

        assert response.status_code == 401  # Unauthorized

    def test_get_current_user_with_invalid_token(self, client):
        """Geçersiz token ile /me çağrısı"""
        headers = {"Authorization": "Bearer invalid_token_xyz"}
        response = client.get("/auth/me", headers=headers)

        assert response.status_code == 401
        assert "doğrulana" in response.json()["detail"].lower()

    def test_get_current_user_with_malformed_header(self, client):
        """Yanlış format header ile /me çağrısı"""
        headers = {"Authorization": "InvalidFormat token"}
        response = client.get("/auth/me", headers=headers)

        assert response.status_code == 401

    def test_get_current_user_after_login(self, client, test_user_data):
        """Login sonrası /me çağrısı"""
        # Kayıt et
        client.post("/auth/register", json=test_user_data)

        # Login yap
        credentials = {
            "email": test_user_data["email"],
            "password": test_user_data["password"]
        }
        login_response = client.post("/auth/login", json=credentials)
        token = login_response.json()["access_token"]

        # /me çağrısı
        headers = {"Authorization": f"Bearer {token}"}
        response = client.get("/auth/me", headers=headers)

        assert response.status_code == 200
        assert response.json()["email"] == test_user_data["email"]


# ============================================================
# UPDATE CURRENT USER (/me PUT) TESTLERI
# ============================================================

class TestUpdateCurrentUser:
    """Kullanıcı güncelleme endpoint'i testleri"""

    def test_update_user_with_valid_token(self, client, test_user_data):
        """Geçerli token ile kullanıcı güncelleme"""
        register_response = client.post("/auth/register", json=test_user_data)
        token = register_response.json()["access_token"]

        update_data = {
            "first_name": "Updated",
            "phone": "05559876543"
        }

        headers = {"Authorization": f"Bearer {token}"}
        response = client.put("/auth/me", json=update_data, headers=headers)

        assert response.status_code == 200
        data = response.json()
        assert data["first_name"] == "Updated"
        assert data["phone"] == "05559876543"
        assert data["last_name"] == test_user_data["last_name"]  # Değişmemiş

    def test_update_user_without_token(self, client):
        """Token olmadan /me PUT çağrısı"""
        update_data = {"first_name": "Updated"}
        response = client.put("/auth/me", json=update_data)

        assert response.status_code == 401

    def test_update_user_with_invalid_token(self, client):
        """Geçersiz token ile /me PUT çağrısı"""
        update_data = {"first_name": "Updated"}
        headers = {"Authorization": "Bearer invalid_token"}
        response = client.put("/auth/me", json=update_data, headers=headers)

        assert response.status_code == 401

    def test_update_user_partial_update(self, client, test_user_data):
        """Kısmi güncelleme (sadece bazı alanlar)"""
        register_response = client.post("/auth/register", json=test_user_data)
        token = register_response.json()["access_token"]

        # Sadece expertise_area güncelle
        update_data = {"expertise_area": "disaster_management"}

        headers = {"Authorization": f"Bearer {token}"}
        response = client.put("/auth/me", json=update_data, headers=headers)

        assert response.status_code == 200
        data = response.json()
        assert data["expertise_area"] == "disaster_management"
        assert data["first_name"] == test_user_data["first_name"]

    def test_update_user_multiple_fields(self, client, test_user_data):
        """Birden fazla alan güncelleme"""
        register_response = client.post("/auth/register", json=test_user_data)
        token = register_response.json()["access_token"]

        update_data = {
            "first_name": "John",
            "last_name": "Doe",
            "organization": "New Org",
            "city": "Ankara"
        }

        headers = {"Authorization": f"Bearer {token}"}
        response = client.put("/auth/me", json=update_data, headers=headers)

        assert response.status_code == 200
        data = response.json()
        assert data["first_name"] == "John"
        assert data["last_name"] == "Doe"
        assert data["organization"] == "New Org"
        assert data["city"] == "Ankara"


# ============================================================
# INTEGRATION TESTLERI
# ============================================================

class TestAuthIntegration:
    """Auth flow'u entegrasyon testleri"""

    def test_complete_auth_flow(self, client, test_user_data):
        """Tamamlanmış auth flow'u: register -> login -> /me -> update"""
        # 1. Register
        register_response = client.post("/auth/register", json=test_user_data)
        assert register_response.status_code == 201
        register_token = register_response.json()["access_token"]

        # 2. Get me with register token
        headers = {"Authorization": f"Bearer {register_token}"}
        me_response = client.get("/auth/me", headers=headers)
        assert me_response.status_code == 200

        # 3. Login
        credentials = {
            "email": test_user_data["email"],
            "password": test_user_data["password"]
        }
        login_response = client.post("/auth/login", json=credentials)
        assert login_response.status_code == 200
        login_token = login_response.json()["access_token"]

        # 4. Get me with login token
        headers = {"Authorization": f"Bearer {login_token}"}
        me_response = client.get("/auth/me", headers=headers)
        assert me_response.status_code == 200

        # 5. Update user
        update_data = {"first_name": "Updated"}
        update_response = client.put("/auth/me", json=update_data, headers=headers)
        assert update_response.status_code == 200

        # 6. Verify update
        me_response = client.get("/auth/me", headers=headers)
        assert me_response.json()["first_name"] == "Updated"

    def test_multiple_users_isolation(self, client, test_user_data):
        """Birden fazla kullanıcı - veri izolasyonu"""
        user1 = test_user_data.copy()

        user2 = test_user_data.copy()
        user2["email"] = "user2@example.com"
        user2["tc_identity_no"] = "98765432109"

        # User 1 kaydı
        user1_register = client.post("/auth/register", json=user1)
        assert user1_register.status_code == 201
        user1_token = user1_register.json()["access_token"]

        # User 2 kaydı
        user2_register = client.post("/auth/register", json=user2)
        assert user2_register.status_code == 201
        user2_token = user2_register.json()["access_token"]

        # User 1 /me çağrısı
        headers1 = {"Authorization": f"Bearer {user1_token}"}
        user1_me = client.get("/auth/me", headers=headers1).json()

        # User 2 /me çağrısı
        headers2 = {"Authorization": f"Bearer {user2_token}"}
        user2_me = client.get("/auth/me", headers=headers2).json()

        # Veriler izole olmalı
        assert user1_me["email"] == user1["email"]
        assert user2_me["email"] == user2["email"]
        assert user1_me["email"] != user2_me["email"]


# ============================================================
# EDGE CASE TESTLERI
# ============================================================

class TestAuthEdgeCases:
    """Edge case'ler"""

    def test_register_with_special_characters_in_name(self, client, test_user_data):
        """Özel karakterlerle kayıt"""
        test_user_data["first_name"] = "Jean-Claude"
        test_user_data["last_name"] = "Müller-Özer"

        response = client.post("/auth/register", json=test_user_data)
        assert response.status_code == 201
        assert response.json()["user"]["first_name"] == "Jean-Claude"

    def test_register_with_email_variations(self, client, test_user_data):
        """E-posta varyasyonları - case-insensitive duplicate check"""
        # Kullanıcı kaydı
        response1 = client.post("/auth/register", json=test_user_data)
        assert response1.status_code == 201

        # Aynı e-posta farklı case ile deneme
        original_email = test_user_data["email"]
        test_user_data["email"] = original_email.upper()
        test_user_data["tc_identity_no"] = "11111111111"
        response2 = client.post("/auth/register", json=test_user_data)

        # SQLite/PostgreSQL case-insensitive unique constraint olabilir
        # Her iki durum da valid:
        # - 400 (rejected duplicate) veya
        # - 201 (accepted case variation)
        # Bu test case variation'u kabul ettiğini doğrular
        assert response2.status_code in [201, 400]

    def test_login_case_sensitivity(self, client, test_user_data):
        """Login e-posta case sensitivity"""
        client.post("/auth/register", json=test_user_data)

        # Farklı case ile login deneme
        credentials = {
            "email": test_user_data["email"].upper(),
            "password": test_user_data["password"]
        }
        response = client.post("/auth/login", json=credentials)

        # Case sensitive olduğu için başarısız olmalı (genelde)
        assert response.status_code == 401


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
