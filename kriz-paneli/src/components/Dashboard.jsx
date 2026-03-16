import 'leaflet/dist/leaflet.css';
import { useState, useEffect } from 'react';
// 1. YENİ: Harita kütüphanelerini ve CSS dosyasını içeri aktarıyoruz
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// 2. YENİ: Harita üzerinde duracak o havalı, yanıp sönen kırmızı pinimizin tasarımı
const kirmiziPin = L.divIcon({
  className: 'custom-icon',
  html: `<div class="w-4 h-4 bg-red-500 rounded-full ring-4 ring-red-500/30 animate-pulse"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8]
});

export default function Dashboard() {
  
  // Hafızamız (Bilal'in örnek verisi)
  const [ihbarlar, setIhbarlar] = useState([
    {
      "latitude": 41.01,
      "longitude": 29.02,
      "need_type": "arama_kurtarma",
      "id": "uuid-formatinda-id",
      "created_at": "2026-03-12T08:00:00.000000",
      "dynamic_priority_score": 85.5
    }
  ]);

  // Kurye (Şimdilik dinleniyor)
  useEffect(() => {
    // Bilal dükkanı açınca burayı aktif edeceğiz
  }, []);

  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-8">
      
      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          <p className="text-slate-500 dark:text-slate-400 font-medium">Aktif İhbarlar</p>
          <h3 className="text-3xl font-bold mt-1">{ihbarlar.length}</h3> 
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* 3. YENİ: HARİTA ALANI */}
        <div className="xl:col-span-2 space-y-4">
          <h3 className="text-lg font-bold">Harita Canlı İzleme</h3>
          
          {/* Harita Çerçevesi (z-0 veriyoruz ki menülerin üstüne çıkmasın) */}
          <div className="relative h-[400px] w-full rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-0 shadow-inner">
            
            {/* MapContainer: Türkiye merkezli (39.0, 35.0) başlatıyoruz */}
         // Dashboard.jsx içinde MapContainer'ı bul ve şu hale getir:
<MapContainer 
  center={[41.01, 29.02]} 
  zoom={8} 
  style={{ height: '100%', width: '100%' }}
  whenReady={(mapInstance) => { 
    setTimeout(() => {
      mapInstance.target.invalidateSize();
    }, 100);
  }}
>

              
              {/* Haritanın Görünümü (Karanlık temaya uygun şık bir harita) */}
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://carto.com/">CARTO</a>'
              />

              {/* Hafızadaki tüm ihbarları haritaya PİN olarak çakıyoruz! */}
              {ihbarlar.map((ihbar) => (
                <Marker 
                  key={ihbar.id} 
                  position={[ihbar.latitude, ihbar.longitude]} 
                  icon={kirmiziPin}
                >
                  {/* Pine tıklanınca açılacak minik bilgi kutusu */}
                  <Popup>
                    <b>Tür:</b> {ihbar.need_type.replace('_', ' ')} <br/>
                    <b>Aciliyet Puanı:</b> {ihbar.dynamic_priority_score}
                  </Popup>
                </Marker>
              ))}

            </MapContainer>

          </div>
        </div>

        {/* Canlı İhbar Akışı */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold">Canlı İhbar Akışı</h3>
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
            
            {ihbarlar.map((ihbar) => (
              <div key={ihbar.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <p className="text-sm font-bold text-slate-900 dark:text-white capitalize">
                        {ihbar.need_type.replace('_', ' ')}
                      </p>
                      <span className="text-[10px] text-slate-500">
                        {new Date(ihbar.created_at).toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      📍 Konum: {ihbar.latitude.toFixed(4)}, {ihbar.longitude.toFixed(4)}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-[10px] bg-red-500/10 text-red-500 px-2 py-0.5 rounded-full font-bold">
                        🔥 Aciliyet Puanı: {ihbar.dynamic_priority_score}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

          </div>
        </div>
      </div>

    </div>
  );
}