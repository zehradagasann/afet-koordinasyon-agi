import React from 'react';

const Ekipler = () => {
  return (
    <div className="text-on-surface p-8 w-full">
      <div className="max-w-7xl mx-auto">
        
        {/* Page Header Section */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-on-surface mb-2">Saha Ekipleri</h1>
            <p className="text-slate-400 max-w-lg">Otonom ve insanlı müdahale birimlerinin gerçek zamanlı operasyonel durumu.</p>
          </div>
          <div className="flex gap-3">
            <button className="bg-surface-container hover:bg-surface-container-high text-slate-300 px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 border border-slate-800 transition-all">
              <span className="material-symbols-outlined text-sm">filter_alt</span> Filtrele
            </button>
            <button className="bg-primary hover:opacity-90 text-white px-6 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all">
              <span className="material-symbols-outlined text-sm">add</span> Yeni Ekip Tanımla
            </button>
          </div>
        </div>

        {/* Team Grid (Bento Style) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Team Card: Team-Alpha */}
          <div className="bg-surface-container rounded-xl p-6 border border-outline-variant shadow-sm hover:border-primary/50 transition-all group">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>precision_manufacturing</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-on-surface">Team-Alpha</h3>
                  <span className="text-[10px] uppercase tracking-widest text-slate-500">Arama Kurtarma (Drone Birimi)</span>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full border border-primary/20">Active</span>
            </div>
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Bileşenler</span>
                <span className="text-slate-200">4x Quadrotor, 1x Mobil Komuta</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-primary h-full w-[85%]"></div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">Mevcut Görev</span>
                <span className="text-xs font-semibold text-blue-400">Sektör 7 - Termal Tarama</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-surface-container-low p-3 rounded-lg border border-slate-800/50">
                <p className="text-[10px] text-slate-500 uppercase mb-1">Batarya Seviyesi</p>
                <p className="text-sm font-bold text-on-surface">82%</p>
              </div>
              <div className="bg-surface-container-low p-3 rounded-lg border border-slate-800/50">
                <p className="text-[10px] text-slate-500 uppercase mb-1">Sinyal Gücü</p>
                <p className="text-sm font-bold text-on-surface">Excellent</p>
              </div>
            </div>
          </div>

          {/* Team Card: Sky-Watcher 01 */}
          <div className="bg-surface-container rounded-xl p-6 border border-outline-variant shadow-sm hover:border-tertiary/50 transition-all">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-tertiary/10 rounded-xl flex items-center justify-center text-tertiary">
                  <span className="material-symbols-outlined text-2xl">flight</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-on-surface">Sky-Watcher 01</h3>
                  <span className="text-[10px] uppercase tracking-widest text-slate-500">Yüksek İrtifa Gözlem</span>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-tertiary/10 text-tertiary text-[10px] font-black uppercase tracking-widest rounded-full border border-tertiary/20">On Route</span>
            </div>
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Bileşenler</span>
                <span className="text-slate-200">1x Fixed Wing VTOL</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-tertiary h-full w-[42%]"></div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">Mevcut Görev</span>
                <span className="text-xs font-semibold text-on-surface">Lojistik Koridoru Analizi</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-surface-container-low p-3 rounded-lg border border-slate-800/50">
                <p className="text-[10px] text-slate-500 uppercase mb-1">Tahmini Varış</p>
                <p className="text-sm font-bold text-on-surface">04:12 dk</p>
              </div>
              <div className="bg-surface-container-low p-3 rounded-lg border border-slate-800/50">
                <p className="text-[10px] text-slate-500 uppercase mb-1">Hız</p>
                <p className="text-sm font-bold text-on-surface">120 km/h</p>
              </div>
            </div>
          </div>

          {/* Team Card: Titan-X */}
          <div className="bg-surface-container rounded-xl p-6 border border-outline-variant shadow-sm hover:border-slate-600 transition-all opacity-75 grayscale-[50%]">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-700/20 rounded-xl flex items-center justify-center text-slate-400">
                  <span className="material-symbols-outlined text-2xl">construction</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-on-surface">Titan-X</h3>
                  <span className="text-[10px] uppercase tracking-widest text-slate-500">Ağır Yük & Enkaz Kaldırma</span>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-slate-800 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-slate-700">Maintenance</span>
            </div>
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Bileşenler</span>
                <span className="text-slate-200">2x Hexapod Walker</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-slate-600 h-full w-[100%]"></div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">Mevcut Görev</span>
                <span className="text-xs font-semibold text-slate-500">Periyodik Kalibrasyon</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-surface-container-low p-3 rounded-lg border border-slate-800/50">
                <p className="text-[10px] text-slate-500 uppercase mb-1">Hizmete Dönüş</p>
                <p className="text-sm font-bold text-on-surface">22:00 UTC</p>
              </div>
              <div className="bg-surface-container-low p-3 rounded-lg border border-slate-800/50">
                <p className="text-[10px] text-slate-500 uppercase mb-1">Teknisyen</p>
                <p className="text-sm font-bold text-on-surface">M. Aydın</p>
              </div>
            </div>
          </div>

          {/* Team Card: Rover-Squad */}
          <div className="bg-surface-container rounded-xl p-6 border border-outline-variant shadow-sm hover:border-primary/50 transition-all">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-2xl">settings_input_antenna</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-on-surface">Rover-Squad</h3>
                  <span className="text-[10px] uppercase tracking-widest text-slate-500">Zemin İletişim Rölesi</span>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full border border-primary/20">Active</span>
            </div>
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Bileşenler</span>
                <span className="text-slate-200">6x UGV Rover</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-primary h-full w-[98%]"></div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">Mevcut Görev</span>
                <span className="text-xs font-semibold text-blue-400">Ön Hat Mesh Ağı Kurulumu</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-surface-container-low p-3 rounded-lg border border-slate-800/50">
                <p className="text-[10px] text-slate-500 uppercase mb-1">Bandwidth</p>
                <p className="text-sm font-bold text-on-surface">450 Mbps</p>
              </div>
              <div className="bg-surface-container-low p-3 rounded-lg border border-slate-800/50">
                <p className="text-[10px] text-slate-500 uppercase mb-1">Kapsama</p>
                <p className="text-sm font-bold text-on-surface">1.2 km²</p>
              </div>
            </div>
          </div>

          {/* Team Card: Med-Link 4 */}
          <div className="bg-surface-container rounded-xl p-6 border border-outline-variant shadow-sm hover:border-primary/50 transition-all">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-2xl">medical_services</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-on-surface">Med-Link 4</h3>
                  <span className="text-[10px] uppercase tracking-widest text-slate-500">Tıbbi Tahliye & İlk Yardım</span>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full border border-primary/20">Active</span>
            </div>
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Bileşenler</span>
                <span className="text-slate-200">2x Med-Drone, 1x İnsanlı Ambulans</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-primary h-full w-[65%]"></div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">Mevcut Görev</span>
                <span className="text-xs font-semibold text-blue-400">Vaka #442 Tahliyesi</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-surface-container-low p-3 rounded-lg border border-slate-800/50">
                <p className="text-[10px] text-slate-500 uppercase mb-1">İlaç Stoğu</p>
                <p className="text-sm font-bold text-on-surface">Full</p>
              </div>
              <div className="bg-surface-container-low p-3 rounded-lg border border-slate-800/50">
                <p className="text-[10px] text-slate-500 uppercase mb-1">Med-Kits</p>
                <p className="text-sm font-bold text-on-surface">12 Unites</p>
              </div>
            </div>
          </div>

          {/* Visual Data Component */}
          <div className="bg-surface-container rounded-xl border border-outline-variant shadow-sm overflow-hidden flex flex-col min-h-[280px]">
            <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">Ekip Dağılım Haritası</h4>
              <span className="text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded">Live Map</span>
            </div>
            <div className="flex-1 relative bg-slate-800">
              <img 
                className="w-full h-full object-cover opacity-60" 
                alt="top-down satellite view of a city grid" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDrMOrDh5AQDEtiO9Spj4JmhL69H_x0qNVyDLWB0-d742vHwi6Rdg9uLdQH9em4zoVhdzT-6YBmtOpJXPkxriqJLKKAX-9hIq9vHH3MSG5Y2G71zXsIGfV2HK9bTJxYx63ogvMrW8xtPJpubhvk2N7c3cuarWwqWZiIk1a5L6EJG_OUxwUBhKoE9CqbTIxPKJmoMDfVBf6MGMdQuSa3Y14hBtYShv_ocCtzDL3R3Do5WDYtVdsbUFcP4AnWnfxribMOa-YhCTjDxJPO" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-surface-container to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">Merkez Koordinat</p>
                  <p className="text-sm font-mono text-on-surface">41.0082° N, 28.9784° E</p>
                </div>
                <button className="p-2 bg-primary rounded-lg shadow-lg">
                  <span className="material-symbols-outlined text-white text-base">fullscreen</span>
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Footer Summary Stats */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 pb-12">
          <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800/50">
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Toplam Birim</p>
            <p className="text-2xl font-black text-on-surface">24</p>
          </div>
          <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800/50">
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Aktif Görev</p>
            <p className="text-2xl font-black text-blue-500">18</p>
          </div>
          <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800/50">
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Bakımda</p>
            <p className="text-2xl font-black text-slate-400">3</p>
          </div>
          <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800/50">
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Kritik Uyarı</p>
            <p className="text-2xl font-black text-tertiary">1</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Ekipler;