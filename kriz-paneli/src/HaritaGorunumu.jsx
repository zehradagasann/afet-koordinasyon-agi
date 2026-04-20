import React from 'react';

export default function HaritaGorunumu() {
  return (
    // 'h-full' ve 'relative' kullanarak ana layout içine tam oturmasını sağlıyoruz
    <div className="relative w-full h-full bg-slate-950 overflow-hidden">
      
      {/* Arka Plan Harita Katmanı (Görsel Simülasyon) */}
      <div className="absolute inset-0 z-0">
        <div 
          className="w-full h-full grayscale opacity-40 bg-[url('https://api.mapbox.com/styles/v1/mapbox/dark-v11/static/28.9784,41.0082,12/1280x720?access_token=none')]" 
          data-alt="dark tactical map of Istanbul" 
          data-location="Istanbul"
        ></div>
        {/* Taktiksel Izgara (Grid) Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,109,236,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(18,109,236,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>
      </div>

      {/* Sol Panel: İstatistikler */}
      <div className="absolute top-6 left-6 z-20 flex flex-col gap-4 w-72">
        <div className="bg-slate-800/80 backdrop-blur-md p-5 rounded-xl border border-white/10 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Gerçek Zamanlı Veri</h3>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-[10px] font-bold text-green-500">CANLI</span>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <div className="flex flex-col">
                <span className="text-xs text-slate-400">Aktif İhbarlar</span>
                <span className="text-2xl font-bold tracking-tighter text-slate-100">303</span>
              </div>
              <span className="text-[10px] font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded">+12 S</span>
            </div>
            <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div className="w-3/4 h-full bg-red-600"></div>
            </div>
            <div className="flex justify-between items-end">
              <div className="flex flex-col">
                <span className="text-xs text-slate-400">Müdahale Edilenler</span>
                <span className="text-2xl font-bold tracking-tighter text-slate-100">42</span>
              </div>
              <span className="text-[10px] font-bold text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded">14% Y</span>
            </div>
            <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div className="w-1/3 h-full bg-blue-600"></div>
            </div>
          </div>
        </div>

        {/* İkincil İstatistik: Ekip Dağılımı */}
        <div className="bg-slate-800/80 backdrop-blur-md p-5 rounded-xl border border-white/10 shadow-sm">
          <h3 className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-3">Ekip Dağılımı</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Saha Robotları</span>
              <span className="text-xs font-mono font-bold text-slate-100">128</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">İHA / Drone</span>
              <span className="text-xs font-mono font-bold text-slate-100">45</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Mobil Komuta</span>
              <span className="text-xs font-mono font-bold text-slate-100">08</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sağ Panel: Harita Kontrolleri */}
      <div className="absolute top-6 right-6 z-20 flex flex-col gap-2">
        <div className="bg-slate-800/80 backdrop-blur-md p-1 rounded-xl border border-white/10 flex flex-col shadow-sm">
          <button className="p-2 hover:bg-white/5 text-slate-400 hover:text-white transition-colors rounded-lg"><span className="material-symbols-outlined">add</span></button>
          <div className="h-px bg-white/10 mx-2"></div>
          <button className="p-2 hover:bg-white/5 text-slate-400 hover:text-white transition-colors rounded-lg"><span className="material-symbols-outlined">remove</span></button>
        </div>
        <div className="bg-slate-800/80 backdrop-blur-md p-1 rounded-xl border border-white/10 flex flex-col shadow-sm">
          <button className="p-2 hover:bg-white/5 text-slate-400 hover:text-white transition-colors rounded-lg"><span className="material-symbols-outlined">layers</span></button>
          <button className="p-2 hover:bg-white/5 text-slate-400 hover:text-white transition-colors rounded-lg"><span className="material-symbols-outlined">explore</span></button>
        </div>
        <div className="bg-slate-800/80 backdrop-blur-md p-1 rounded-xl border border-white/10 flex flex-col shadow-sm">
          <button className="p-2 bg-blue-600/20 text-blue-500 transition-colors rounded-lg"><span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>my_location</span></button>
        </div>
      </div>

      {/* Etkileşimli Harita İşaretçileri (Simüle Edilmiş) */}
      <div className="absolute inset-0 pointer-events-none z-10">
        {/* Kırmızı Kümeler (Aktif İhbarlar) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-12 -translate-y-24 flex items-center justify-center">
          <div className="absolute w-12 h-12 bg-red-600/20 rounded-full animate-ping"></div>
          <div className="relative w-8 h-8 bg-red-600 border-2 border-white rounded-full flex items-center justify-center shadow-lg pointer-events-auto cursor-pointer">
            <span className="text-[10px] font-bold text-white">12</span>
          </div>
        </div>
        <div className="absolute top-[40%] left-[35%] flex items-center justify-center">
          <div className="relative w-6 h-6 bg-red-600/80 border border-white/50 rounded-full flex items-center justify-center shadow-lg pointer-events-auto cursor-pointer">
            <span className="material-symbols-outlined text-white text-xs">warning</span>
          </div>
        </div>

        {/* Mavi İşaretçiler (Kurtarma Ekipleri) */}
        <div className="absolute bottom-[40%] right-[40%] flex items-center justify-center">
          <div className="relative w-10 h-10 bg-blue-600/20 backdrop-blur-sm border-2 border-blue-500 rounded-xl flex flex-col items-center justify-center shadow-lg pointer-events-auto cursor-pointer">
            <span className="material-symbols-outlined text-blue-500 text-sm">support_agent</span>
            <span className="text-[8px] font-bold text-blue-500">UNIT-7</span>
          </div>
        </div>
        <div className="absolute top-[25%] right-[30%] flex items-center justify-center">
          <div className="relative w-8 h-8 bg-blue-600/30 border border-blue-500/50 rounded-full flex items-center justify-center shadow-lg pointer-events-auto cursor-pointer">
            <span className="material-symbols-outlined text-blue-500 text-xs">precision_manufacturing</span>
          </div>
        </div>
      </div>

      {/* Alt Panel: Son Raporlar */}
      <div className="absolute bottom-6 left-6 right-6 z-30 flex gap-4">
        <div className="flex-1 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex flex-col shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-500 text-sm">list_alt</span>
              <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-100">Son Gelen İhbar Akışı</h2>
            </div>
            <button className="text-[10px] font-bold text-slate-400 hover:text-white transition-colors flex items-center gap-1">
              TÜMÜNÜ GÖR <span className="material-symbols-outlined text-xs">arrow_forward</span>
            </button>
          </div>
          
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {/* Kart 1 */}
            <div className="min-w-[320px] bg-slate-800 p-3 rounded-xl border border-white/5 hover:border-red-500/30 transition-all cursor-pointer group">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-500/10 text-red-500 uppercase">Acil Durum</span>
                <span className="text-[10px] font-mono text-slate-400">09:42:15</span>
              </div>
              <h4 className="text-sm font-bold text-slate-100 mb-1 truncate">Kadıköy Sahil - Yapısal Çökme</h4>
              <p className="text-[11px] text-slate-400 line-clamp-2">İskele civarında kısmi çökme ihbarı alındı. Drone ünitesi 4 gönderildi.</p>
            </div>
            {/* Kart 2 */}
            <div className="min-w-[320px] bg-slate-800 p-3 rounded-xl border border-white/5 hover:border-blue-500/30 transition-all cursor-pointer group">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 uppercase">Bilgi</span>
                <span className="text-[10px] font-mono text-slate-400">09:40:02</span>
              </div>
              <h4 className="text-sm font-bold text-slate-100 mb-1 truncate">Beşiktaş - Trafik Yoğunluğu</h4>
              <p className="text-[11px] text-slate-400 line-clamp-2">Lojistik rotaları tıkalı. Alternatif güzergah 3 üzerinden yönlendirme yapıldı.</p>
            </div>
            {/* Kart 3 */}
            <div className="min-w-[320px] bg-slate-800 p-3 rounded-xl border border-white/5 hover:border-amber-500/30 transition-all cursor-pointer group">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 uppercase">Orta Seviye</span>
                <span className="text-[10px] font-mono text-slate-400">09:38:45</span>
              </div>
              <h4 className="text-sm font-bold text-slate-100 mb-1 truncate">Şişli - Yangın Kontrolü</h4>
              <p className="text-[11px] text-slate-400 line-clamp-2">Elektrik trafosu duman emisyonu. İtfaiye birimi 02 sahada.</p>
            </div>
          </div>
        </div>

        {/* Odaklanmış Aksiyon Kartı */}
        <div className="w-80 bg-blue-600/10 backdrop-blur-xl border border-blue-500/20 rounded-2xl p-5 flex flex-col justify-between shadow-xl">
          <div>
            <h3 className="text-xs font-bold text-blue-500 mb-1">Müdahale Talimatı</h3>
            <p className="text-[11px] text-slate-400">Sektör 4 için otonom İHA sürüsü hazır. Onay bekleniyor.</p>
          </div>
          <button className="w-full mt-3 bg-blue-600 text-white text-xs font-bold py-2.5 rounded-xl hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-sm">bolt</span>
            SÜRÜYÜ BAŞLAT
          </button>
        </div>
      </div>

    </div>
  );
}