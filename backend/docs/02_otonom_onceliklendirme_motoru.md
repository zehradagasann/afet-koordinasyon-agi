# Afet ve Acil Durum Yönetiminde Otonom Önceliklendirme Motoru

> **Not:** Bu dokümantasyon, literatür taraması ve algoritmik analiz süreçleri kapsamında **Gemini Deep Research** kullanılarak oluşturulmuştur.

## 1. Triyaj Sistemleri ve Veri Odaklı Acil Durum Yönetimi
Afet lojistiğinde basit bir FIFO (İlk Giren İlk Çıkar) mantığı kullanmak ölümcül sonuçlar doğurur. Otonom önceliklendirme motoru; sahadan gelen ihbarları vakanın fizyolojik aciliyetine, insan hayatı üzerindeki tehdit potansiyeline ve müdahalenin zaman duyarlılığına göre dinamik bir matematiksel skora dönüştürür. Sistem ESI, START, SALT ve NATO triyaj standartlarını temel alır.

## 2. İlk 72 Saat Doktrini ve Çok Kriterli Karar Verme (AHP)
FEMA, WFP ve BM standartlarına göre afetin ilk 72 saati hayat kurtarmak için en kritik penceredir. İnsan fizyolojisinin susuzluğa ve travmaya (Crush Sendromu) dayanma sınırları baz alınarak ihbarlar Çok Kriterli Karar Verme (MCDM) ve Analitik Hiyerarşi Prosesi (AHP) kullanılarak ağırlıklandırılmıştır. 

AHP yöntemindeki Tutarlılık Oranı (CR) şu şekilde denetlenir:
$$CR = \frac{CI}{RI}$$

## 3. Statik Taban Puanlama ve Kategorik Ağırlıklandırma Matrisi
AHP analizleri sonucunda sistemde bulunan ihbar kategorileri için Başlangıç Taban Puanı ($S_{base}$) ve Aciliyet Ağırlık Katsayısı ($C_i$) belirlenmiştir:

| Kategori (need_type) | Açıklama ve Bilimsel Aciliyet Gerekçesi | Başlangıç Puanı ($S_{base}$) | Ağırlık Katsayısı ($C_i$) |
| :--- | :--- | :--- | :--- |
| **arama_kurtarma** | Doğrudan insan hayatını kurtarmaya yönelik en kritik faaliyet. (ESI Seviye 1) | 100 | %25 (0.25) |
| **medikal** | Ağır travma, kanama vakaları. | 95 | %20 (0.20) |
| **yangin** | Çevresel asimetrik tehdit potansiyeli. | 90 | %15 (0.15) |
| **enkaz** | Lojistik müdahale yollarını tıkar, potansiyel yaşam alanı. | 80 | %12 (0.12) |
| **su** | Susuzluk tolerans sınırı ortalama 72 saat (WASH). | 60 | %9 (0.09) |
| **barinma** | Hipotermi riski taşır, çadır/battaniye ihtiyacı. | 50 | %7 (0.07) |
| **gida** | Fizyolojik açlık toleransı nispeten yüksektir. | 40 | %6 (0.06) |
| **is_makinesi** | Lojistik ve operasyonel hızlandırıcı donanım. | 35 | %4 (0.04) |
| **ulasim** | Operasyon ekiplerinin intikali ve hasta tahliyesi. | 25 | %2 (0.02) |

## 4. Zaman Sönümleme (Time Decay) ve Dinamik Puanlama Formülü
Sürekli yüksek puanlı ihbarların gelmesi, düşük öncelikli vakaların sistemde ölüme terk edilmesine ("kuyruk açlığı" / queue starvation) yol açabilir. Bunu önlemek için "Dinamik Öncelik Skorlaması" (DPS) kullanılır. 

**Doğrusal Sönümleme Formülü:**
$$P(t) = S_{base} + \left[ \left( \frac{t_{wait}}{t_{max}} \right)^k \times C_i \right] + \sum R_{risk}$$

*(Burada $t_{wait}$ beklenen süreyi, $t_{max}$ tolere edilebilir maksimum süreyi, $C_i$ kategori ağırlığını, $R_{risk}$ ekstra demografik riskleri belirtir.)*

Durumun katlanarak kötüleştiği varsayıldığında **Üstel (Exponential) Sönümleme Formülü** kullanılır:
$$P(t) = S_{base} + e^{\lambda \times t_{wait}} \times C_i$$

## 5. Sistem Mimarisi ve JSON Çıktı Modeli
Puanlamalar arka planda asenkron (Cron Job / Worker) veya doğrudan PostGIS Index üzerinden çalışarak anlık JSON çıktısına dönüştürülür.

```json
{
  "status": "success",
  "metadata": {
    "total_pending_requests": 14500,
    "last_calculated_at": "2026-03-13T14:55:00Z",
    "algorithm_version": "v1.2-DPS-Linear"
  },
  "data": [
    {
      "id": "REQ-1093",
      "need_type": "medikal",
      "base_score": 95,
      "time_waiting_hours": 0.5,
      "dynamic_priority_score": 97.5,
      "urgency_level": "ECHO"
    },
    {
      "id": "REQ-8441",
      "need_type": "barinma",
      "base_score": 50,
      "time_waiting_hours": 48.2,
      "dynamic_priority_score": 85.4,
      "urgency_level": "DELTA"
    }
  ]
}
