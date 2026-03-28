import 'leaflet/dist/leaflet.css';
import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

const kirmiziPin = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const NEED_TYPE_LABELS = {
  arama_kurtarma: 'Arama Kurtarma',
  medikal: 'Medikal',
  yangin: 'Yangın',
  enkaz: 'Enkaz',
  su: 'Su',
  barinma: 'Barınma',
  gida: 'Gıda',
  is_makinesi: 'İş Makinesi',
  ulasim: 'Ulaşım',
};

export default function Dashboard() {
  const mapRef = useRef(null);
  const [ihbarlar, setIhbarlar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/requests/prioritized');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        setIhbarlar(data);
        setLoading(false);
      } catch (e) {
        setError(e.message);
        setLoading(false);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (mapRef.current) {
      setTimeout(() => mapRef.current.invalidateSize(), 400);
    }
  }, [ihbarlar]);

  const konumaGit = (lat, lng) => {
    if (mapRef.current) {
      mapRef.current.flyTo([lat, lng], 13, { duration: 1.5 });
    }
  };

  const verified = ihbarlar.filter(i => i.is_verified).length;
  const acilGorevler = ihbarlar.filter(i => i.dynamic_priority_score >= 80);
  const normalIhbarlar = ihbarlar.filter(i => i.dynamic_priority_score < 80);

  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-8">

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          <p className="text-slate-500 dark:text-slate-400 font-medium">Aktif İhbarlar</p>
          <h3 className="text-3xl font-bold mt-1">{loading ? '...' : ihbarlar.length}</h3>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          <p className="text-slate-500 dark:text-slate-400 font-medium">Doğrulanmış</p>
          <h3 className="text-3xl font-bold mt-1 text-green-500">{loading ? '...' : verified}</h3>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          <p className="text-slate-500 dark:text-slate-400 font-medium">Doğrulanmamış</p>
          <h3 className="text-3xl font-bold mt-1 text-yellow-500">{loading ? '...' : ihbarlar.length - verified}</h3>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          <p className="text-slate-500 dark:text-slate-400 font-medium">En Yüksek Puan</p>
          <h3 className="text-3xl font-bold mt-1 text-red-500">
            {loading ? '...' : ihbarlar.length > 0 ? ihbarlar[0].dynamic_priority_score : '-'}
          </h3>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm">
          Backend bağlantı hatası: {error}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

        {/* Harita */}
        <div className="xl:col-span-2 space-y-4">
          <h3 className="text-lg font-bold">Harita Canlı İzleme</h3>
          <div className="relative h-[450px] w-full rounded-2xl overflow-hidden shadow-inner">
            <MapContainer
              ref={mapRef}
              center={[39.0, 35.0]}
              zoom={6}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://carto.com/">CARTO</a>'
              />
              {ihbarlar.map((ihbar) => (
                <Marker key={ihbar.id} position={[ihbar.latitude, ihbar.longitude]} icon={kirmiziPin}>
                  <Popup>
                    <b>Tür:</b> {NEED_TYPE_LABELS[ihbar.need_type] || ihbar.need_type}<br />
                    <b>Aciliyet:</b> {ihbar.dynamic_priority_score}<br />
                    <b>Doğrulandı:</b> {ihbar.is_verified ? 'Evet' : 'Hayır'}
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>

        {/* Sağ Panel */}
        <div className="space-y-6">

          {/* Acil Görevler */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-red-600 flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              Acil Görevler
            </h3>
            <div className="grid gap-3">
              {acilGorevler.slice(0, 3).map((ihbar) => (
                <div
                  key={ihbar.id}
                  onClick={() => konumaGit(ihbar.latitude, ihbar.longitude)}
                  className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-600 p-4 rounded-r-xl shadow-md cursor-pointer hover:scale-[1.02] transition-transform"
                >
                  <h4 className="font-black text-red-800 dark:text-red-400 uppercase text-xs">
                    🚨 {(NEED_TYPE_LABELS[ihbar.need_type] || ihbar.need_type).toUpperCase()}
                  </h4>
                  <p className="text-[11px] text-red-700 dark:text-red-300 mt-1">
                    📍 {ihbar.latitude.toFixed(3)}, {ihbar.longitude.toFixed(3)} — Puan: {ihbar.dynamic_priority_score}
                  </p>
                </div>
              ))}
              {acilGorevler.length === 0 && !loading && (
                <p className="text-sm text-slate-400">Acil görev yok.</p>
              )}
            </div>
          </div>

          {/* Normal İhbarlar */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400">Diğer İhbarlar</h3>
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-y-auto max-h-[280px] divide-y divide-slate-100 dark:divide-slate-800">
              {loading && <div className="p-4 text-center text-slate-400 text-sm">Yükleniyor...</div>}
              {normalIhbarlar.slice(0, 50).map((ihbar) => (
                <div
                  key={ihbar.id}
                  onClick={() => konumaGit(ihbar.latitude, ihbar.longitude)}
                  className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer flex justify-between items-center"
                >
                  <span className="text-xs text-slate-600 dark:text-slate-400">
                    📍 {NEED_TYPE_LABELS[ihbar.need_type] || ihbar.need_type}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${ihbar.is_verified ? 'bg-green-500/10 text-green-500' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>
                    {ihbar.is_verified ? '✓ Doğrulandı' : 'Şüpheli'}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
