import 'leaflet/dist/leaflet.css';
import { useState, useEffect, useRef } from 'react'; // Tüm React hook'ları tek satırda
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// İkon tanımı burada kalsın...
const kirmiziPin = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

export default function Dashboard() {
  const mapRef = useRef(null);
  const [ihbarlar, setIhbarlar] = useState([]);

useEffect(() => {
    const canliVerileriGetir = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/requests/prioritized');
        if (!response.ok) throw new Error('Veri alınamadı!');
        const data = await response.json();
        setIhbarlar(data); 
      } catch (error) {
        console.error("Veri çekilemedi:", error);
      }
    };
    canliVerileriGetir();
    const interval = setInterval(canliVerileriGetir, 3000);
    return () => clearInterval(interval);
  }, []);

  const konumaGit = (lat, lng) => {
    if (mapRef.current) {
      mapRef.current.flyTo([lat, lng], 13, { duration: 1.5 });
    }
  };

  // Harita gri alan hatasını çözmek için boyutları zorla yeniler
  useEffect(() => {
    if (mapRef.current) {
      setTimeout(() => {
        mapRef.current.invalidateSize();
      }, 400);
    }
  }, [ihbarlar]);

  
const acilGorevler = ihbarlar.filter(i => i.dynamic_priority_score >= 80); // 80 üstü acil olsun
const normalIhbarlar = ihbarlar.filter(i => i.dynamic_priority_score < 80);
  

  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-8">
      {/* İstatistik Kartı */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          <p className="text-slate-500 dark:text-slate-400 font-medium">Aktif İhbarlar</p>
          <h3 className="text-3xl font-bold mt-1 text-slate-900 dark:text-white">{ihbarlar.length}</h3> 
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* HARİTA ALANI */}
        <div className="xl:col-span-2 space-y-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Harita Canlı İzleme</h3>
          <div className="relative h-[450px] w-full rounded-2xl overflow-hidden shadow-inner">
            <MapContainer 
              ref={mapRef}
              center={[39.0, 35.0]} 
              zoom={6} 
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
              {ihbarlar.map((ihbar) => (
                <Marker key={ihbar.id} position={[ihbar.latitude, ihbar.longitude]} icon={kirmiziPin}>
                  <Popup>
                    <b>Tür:</b> {ihbar.need_type} <br/>
                    <b>Puan:</b> {ihbar.dynamic_priority_score}
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>

        {/* SAĞ TARAF: GÖREV KARTLARI VE AKIŞ */}
        <div className="space-y-8">
          {/* ACİL GÖREV KARTLARI */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-red-600 flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              Acil Görevler
            </h3>
            <div className="grid gap-4">
              {acilGorevler.slice(0, 3).map((ihbar) => (
                <div 
                  key={ihbar.id}
                  onClick={() => konumaGit(ihbar.latitude, ihbar.longitude)}
                  className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-600 p-4 rounded-r-xl shadow-md cursor-pointer hover:scale-[1.02] transition-transform"
                >
                  <h4 className="font-black text-red-800 dark:text-red-400 uppercase text-xs">🚨 {ihbar.need_type.replace('_', ' ')}</h4>
                  <p className="text-[11px] text-red-700 dark:text-red-300 mt-1">Konum {ihbar.latitude.toFixed(2)}, {ihbar.longitude.toFixed(2)} - Ekip Bekleniyor</p>
                </div>
              ))}
            </div>
          </div>

          {/* DOĞRULANMAMIŞ İHBARLAR */}
          <div className="space-y-4 opacity-50">
            <h3 className="text-sm font-bold text-slate-500 italic text-slate-900 dark:text-white">Doğrulanmamış İhbarlar</h3>
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 max-h-[300px] overflow-y-auto">
              {normalIhbarlar.map((ihbar) => (
                <div key={ihbar.id} onClick={() => konumaGit(ihbar.latitude, ihbar.longitude)} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer flex justify-between items-center">
                  <span className="text-xs text-slate-600 dark:text-slate-400">📍 {ihbar.need_type}</span>
                  <span className="text-[10px] bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded text-slate-900 dark:text-white">Şüpheli</span>
                </div>
              ))}
            </div>
          </div>
        </div> {/* Sağ taraf div sonu */}
      </div> {/* Grid div sonu */}
    </div> // Ana div sonu
  ); // Return sonu
} // Dashboard fonksiyon sonu