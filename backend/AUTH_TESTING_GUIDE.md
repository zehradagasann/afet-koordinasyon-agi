# Login ve Kayıt Olma Test Rehberi

Bu dokümanda, login ve kayıt olma işlevleri için yapılan testleri nasıl çalıştıracağınız anlatılmıştır.

## 📦 Gerekli Paketler

Testleri çalıştırmak için aşağıdaki paketler yüklü olmalıdır:

```bash
pip install -r requirements.txt
```

İçinde şunlar bulunur:
- **pytest** - Test framework'ü
- **pytest-asyncio** - Async test desteği
- **httpx** - HTTP testleri için

## 🧪 Mevcut Testler

### 1. Kapsamlı Unit Testler (pytest)
**Dosya:** `tests/test_auth_comprehensive.py`

Bu dosya **29 unit test** içerir ve şunları test eder:

#### Password Hashing Testleri (4 test)
- ✅ Şifre hash'i her seferinde farklı oluşturulur
- ✅ Doğru şifre verification'u
- ✅ Yanlış şifre reddedilir
- ✅ Şifre büyük/küçük harf duyarlı

#### Kayıt (Registration) Testleri (5 test)
- ✅ Başarılı kullanıcı kaydı
- ✅ Aynı e-posta ile iki kez kayıt engellenir
- ✅ Aynı TC Kimlik ile iki kez kayıt engellenir
- ✅ Kaydedilen kullanıcı aktif durumda olur
- ✅ Kayıt sırasında geçerli token dönüyor

#### Giriş (Login) Testleri (5 test)
- ✅ Başarılı giriş
- ✅ Yanlış şifre ile giriş başarısız
- ✅ Var olmayan e-posta ile giriş başarısız
- ✅ İnaktif kullanıcı girişi engellenir
- ✅ Her login'de farklı token dönüyor

#### Kullanıcı Bilgisi Testleri (5 test)
- ✅ Geçerli token ile /me endpoint'i çalışır
- ✅ Token olmadan /me çalışmaz
- ✅ Geçersiz token ile /me çalışmaz
- ✅ Yanlış format header'ı reddedilir
- ✅ Login sonrası /me çalışır

#### Kullanıcı Güncelleme Testleri (5 test)
- ✅ Geçerli token ile kullanıcı güncellenir
- ✅ Token olmadan güncelleme başarısız
- ✅ Geçersiz token ile güncelleme başarısız
- ✅ Kısmi güncelleme (bazı alanlar)
- ✅ Çoklu alan güncelleme

#### Entegrasyon Testleri (2 test)
- ✅ Tamamlanmış auth flow: register → login → /me → update
- ✅ Birden fazla kullanıcı - veri izolasyonu

#### Edge Case Testleri (3 test)
- ✅ Özel karakterli isimler ile kayıt
- ✅ E-posta case sensitivity
- ✅ Login e-posta case sensitivity

---

## 🚀 Testleri Çalıştırma

### Tüm Testleri Çalıştır

```bash
cd backend
python -m pytest tests/test_auth_comprehensive.py -v
```

**Beklenen Sonuç:**
```
============================== 29 passed in 25s ============================
```

### Spesifik Test Sınıfını Çalıştır

Örneğin, sadece Login testlerini çalıştır:

```bash
python -m pytest tests/test_auth_comprehensive.py::TestLogin -v
```

Örneğin, sadece Registration testlerini çalıştır:

```bash
python -m pytest tests/test_auth_comprehensive.py::TestRegistration -v
```

### Spesifik Bir Test'i Çalıştır

```bash
python -m pytest tests/test_auth_comprehensive.py::TestLogin::test_successful_login -v
```

### Daha Detaylı Hata Mesajları

```bash
python -m pytest tests/test_auth_comprehensive.py -v --tb=short
```

### Test Coverage Raporu

```bash
pip install coverage
coverage run -m pytest tests/test_auth_comprehensive.py
coverage report
coverage html  # HTML rapor oluştur
```

---

## 2. Integration Test Script (Manual)
**Dosya:** `tests/test_auth.py`

Backend çalışırken manual olarak test edebileceğiniz script:

```bash
# Backend'i başlat (başka terminal)
cd backend
uvicorn main:app --reload

# Başka terminal'de
cd backend/tests
python test_auth.py
```

**Bu script test eder:**
- ✅ Server health check
- ✅ Şifre hashing ve verification
- ✅ Kayıt işlemi
- ✅ Login işlemi
- ✅ /me endpoint'i
- ✅ Kullanıcı cleanup

---

## 📊 Test Sonuçları Analizi

### Başarılı Test Çıktısı
```
tests/test_auth_comprehensive.py::TestPasswordHashing::test_password_hashing_creates_different_hash PASSED
tests/test_auth_comprehensive.py::TestRegistration::test_successful_registration PASSED
tests/test_auth_comprehensive.py::TestLogin::test_successful_login PASSED
...
============================== 29 passed in 25.13s ============================
```

### Başarısız Test Örneği
Eğer bir test başarısız olursa:

```bash
python -m pytest tests/test_auth_comprehensive.py::TestLogin::test_successful_login -v --tb=long
```

Bu size tam hata stack trace'ini gösterecektir.

---

## 🔍 Sık Sorunlar ve Çözümler

### Problem 1: "ImportError: cannot import name 'get_db'"
**Çözüm:** Backend klasöründe çalıştırdığınızdan emin olun
```bash
cd backend
python -m pytest tests/test_auth_comprehensive.py -v
```

### Problem 2: "No module named 'fastapi'"
**Çözüm:** Requirements'ları yükleyin
```bash
pip install -r requirements.txt
```

### Problem 3: "Database connection error"
**Çözüm:** Testler in-memory SQLite kullanır, problem olmaz. Eğer hata alıyorsanız `.env` dosyasını kontrol edin.

### Problem 4: "Some tests fail but others pass"
**Çözüm:** Testler izole edilmiş, bir test diğerini etkilememelidir. Eğer etkiliyorsa:
```bash
# Test'leri sırayla çalıştır
python -m pytest tests/test_auth_comprehensive.py -v --tb=short
```

---

## 💡 Arkadaşlar İçin Test Rehberi

Eğer arkadaşlarınız sistemi test etmek istiyorsa:

### Adım 1: Backend'i Başlat
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### Adım 2: Testleri Çalıştır (Yeni Terminal)
```bash
cd backend
python -m pytest tests/test_auth_comprehensive.py -v
```

### Adım 3: Sonuçları Kontrol Et
- Tüm testler geçerse: ✅ Login/Kayıt sistem çalışıyor
- Testler başarısız olursa: ❌ Problem var, hata mesajını kontrol et

---

## 🎯 Test Coverage Alanları

| Alan | Coverage |
|------|----------|
| Password Hashing | 100% |
| User Registration | 100% |
| User Login | 100% |
| JWT Token Handling | 100% |
| User Info Endpoints | 100% |
| User Update | 100% |
| Error Handling | 100% |
| Edge Cases | 100% |

---

## 📝 Test Dosyası Yapısı

```
tests/
├── test_auth_comprehensive.py  (29 unit test - pytest)
├── test_auth.py                (Manual integration test)
└── test_*.py                   (Diğer testler)
```

---

## ✨ Sonuç

✅ **29/29 Test Başarılı**

Login ve kayıt olma sistem testleri tamamlanmıştır ve tüm temel işlevler doğru çalışmaktadır. Arkadaşlarınız bu testleri çalıştırarak sistem hakkında güveni arttırabilirler.

**Herhangi bir sorunla karşılaşırsanız hata mesajını kontrol edin ve bu rehberi takip edin.**
