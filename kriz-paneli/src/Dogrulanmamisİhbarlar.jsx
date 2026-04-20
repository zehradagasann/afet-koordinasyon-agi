import React from 'react';

const Dogrulanmamisİhbarlar = () => {
  return (
    <div className="text-on-surface p-8 w-full relative">
      <div className="max-w-7xl mx-auto">
        
        {/* Dashboard Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-on-surface">Doğrulanmamış İhbarlar</h1>
            <p className="text-slate-400 mt-2 max-w-2xl">
              Saha ekiplerinden veya vatandaşlardan gelen, henüz onaylanmamış kritik veriler. Doğrulama işlemi için detayları inceleyiniz.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-surface-container p-1 rounded-xl">
              <button className="px-4 py-2 bg-primary rounded-lg text-xs font-bold uppercase tracking-wider text-white">
                Tümü
              </button>
              <button className="px-4 py-2 hover:bg-surface-container-high rounded-lg text-xs font-bold uppercase tracking-wider text-slate-400">
                Yüksek Öncelik
              </button>
            </div>
            <button className="bg-surface-container-high p-2.5 rounded-xl border border-slate-700/30 hover:bg-slate-800 transition-colors">
              <span className="material-symbols-outlined text-slate-300">filter_list</span>
            </button>
          </div>
        </div>

        {/* Reports Bento Grid / List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Report Card 1 */}
          <div className="bg-surface-container border border-slate-700/20 rounded-xl p-6 hover:shadow-sm transition-all relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 -mr-8 -mt-8 rounded-full blur-2xl"></div>
            <div className="flex justify-between items-start mb-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/20">
                  <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest block mb-1">İhbar ID: #RQ-4892</span>
                  <h3 className="text-lg font-bold text-on-surface">Şüpheli Paket</h3>
                </div>
              </div>
              <span className="px-3 py-1 bg-red-500/10 text-red-500 text-[10px] font-bold uppercase tracking-tighter rounded-full border border-red-500/20">
                Yüksek Öncelik
              </span>
            </div>
            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-slate-400 text-lg">location_on</span>
                <span className="text-sm font-medium text-slate-300">Beşiktaş / Ortaköy, Çırağan Caddesi No:12</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-slate-400 text-lg">description</span>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Toplu taşıma durağının arkasında bırakılmış, üzerinde kablo düzenekleri görünen sahipsiz siyah sırt çantası ihbarı.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-slate-400 text-lg">schedule</span>
                <span className="text-xs text-slate-400">İhbar Saati: <span className="text-on-surface font-mono">14:22:45</span> (12 dk. önce)</span>
              </div>
            </div>
            <div className="flex items-center gap-3 pt-6 border-t border-slate-700/30">
              <button className="flex-1 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all">
                <span className="material-symbols-outlined text-lg">check_circle</span> Doğrula
              </button>
              <button className="flex-1 py-2.5 bg-surface-container-high hover:bg-red-500/10 hover:text-red-500 text-slate-300 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all border border-slate-700/30">
                <span className="material-symbols-outlined text-lg">cancel</span> Reddet
              </button>
              <button className="p-2.5 bg-surface-container-high hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700/30" title="Detay">
                <span className="material-symbols-outlined text-lg">open_in_new</span>
              </button>
            </div>
          </div>

          {/* Report Card 2 */}
          <div className="bg-surface-container border border-slate-700/20 rounded-xl p-6 hover:shadow-sm transition-all relative overflow-hidden group">
            <div className="flex justify-between items-start mb-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20">
                  <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>electric_bolt</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest block mb-1">İhbar ID: #RQ-4901</span>
                  <h3 className="text-lg font-bold text-on-surface">Sokak Lambası Arızası</h3>
                </div>
              </div>
              <span className="px-3 py-1 bg-blue-500/10 text-blue-500 text-[10px] font-bold uppercase tracking-tighter rounded-full border border-blue-500/20">
                Düşük Öncelik
              </span>
            </div>
            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-slate-400 text-lg">location_on</span>
                <span className="text-sm font-medium text-slate-300">Kadıköy / Moda, Caferağa Mahallesi</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-slate-400 text-lg">description</span>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Moda sahil yolu üzerindeki 3 adet aydınlatma direği yanmıyor, bölge tamamen karanlıkta kalmış durumda.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-slate-400 text-lg">schedule</span>
                <span className="text-xs text-slate-400">İhbar Saati: <span className="text-on-surface font-mono">14:15:10</span> (19 dk. önce)</span>
              </div>
            </div>
            <div className="flex items-center gap-3 pt-6 border-t border-slate-700/30">
              <button className="flex-1 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all">
                <span className="material-symbols-outlined text-lg">check_circle</span> Doğrula
              </button>
              <button className="flex-1 py-2.5 bg-surface-container-high hover:bg-red-500/10 hover:text-red-500 text-slate-300 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all border border-slate-700/30">
                <span className="material-symbols-outlined text-lg">cancel</span> Reddet
              </button>
              <button className="p-2.5 bg-surface-container-high hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700/30" title="Detay">
                <span className="material-symbols-outlined text-lg">open_in_new</span>
              </button>
            </div>
          </div>

          {/* Report Card 3 */}
          <div className="bg-surface-container border border-slate-700/20 rounded-xl p-6 hover:shadow-sm transition-all relative overflow-hidden group">
            <div className="flex justify-between items-start mb-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 border border-orange-500/20">
                  <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>water_damage</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest block mb-1">İhbar ID: #RQ-4915</span>
                  <h3 className="text-lg font-bold text-on-surface">Ana Boru Patlağı</h3>
                </div>
              </div>
              <span className="px-3 py-1 bg-orange-500/10 text-orange-500 text-[10px] font-bold uppercase tracking-tighter rounded-full border border-orange-500/20">
                Orta Öncelik
              </span>
            </div>
            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-slate-400 text-lg">location_on</span>
                <span className="text-sm font-medium text-slate-300">Şişli / Bomonti, Kazım Orbay Cad.</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-slate-400 text-lg">description</span>
                <p className="text-sm text-slate-400 leading-relaxed">
                  İnşaat çalışması sırasında su ana borusu zarar gördü, cadde üzerinde ciddi su birikintisi oluşuyor.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-slate-400 text-lg">schedule</span>
                <span className="text-xs text-slate-400">İhbar Saati: <span className="text-on-surface font-mono">14:08:32</span> (26 dk. önce)</span>
              </div>
            </div>
            <div className="flex items-center gap-3 pt-6 border-t border-slate-700/30">
              <button className="flex-1 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all">
                <span className="material-symbols-outlined text-lg">check_circle</span> Doğrula
              </button>
              <button className="flex-1 py-2.5 bg-surface-container-high hover:bg-red-500/10 hover:text-red-500 text-slate-300 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all border border-slate-700/30">
                <span className="material-symbols-outlined text-lg">cancel</span> Reddet
              </button>
              <button className="p-2.5 bg-surface-container-high hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700/30" title="Detay">
                <span className="material-symbols-outlined text-lg">open_in_new</span>
              </button>
            </div>
          </div>

          {/* Report Card 4 */}
          <div className="bg-surface-container border border-slate-700/20 rounded-xl p-6 hover:shadow-sm transition-all relative overflow-hidden group">
            <div className="flex justify-between items-start mb-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/20">
                  <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>car_crash</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest block mb-1">İhbar ID: #RQ-4922</span>
                  <h3 className="text-lg font-bold text-on-surface">Zincirleme Kaza</h3>
                </div>
              </div>
              <span className="px-3 py-1 bg-red-500/10 text-red-500 text-[10px] font-bold uppercase tracking-tighter rounded-full border border-red-500/20">
                Kritik
              </span>
            </div>
            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-slate-400 text-lg">location_on</span>
                <span className="text-sm font-medium text-slate-300">Üsküdar / Altunizade, 15 Temmuz Şehitler Köprüsü Girişi</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-slate-400 text-lg">description</span>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Köprü girişinde 4 aracın karıştığı trafik kazası. Yaralı bilgisi henüz net değil, trafik tek şeritten sağlanıyor.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-slate-400 text-lg">schedule</span>
                <span className="text-xs text-slate-400">İhbar Saati: <span className="text-on-surface font-mono">14:31:12</span> (3 dk. önce)</span>
              </div>
            </div>
            <div className="flex items-center gap-3 pt-6 border-t border-slate-700/30">
              <button className="flex-1 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all">
                <span className="material-symbols-outlined text-lg">check_circle</span> Doğrula
              </button>
              <button className="flex-1 py-2.5 bg-surface-container-high hover:bg-red-500/10 hover:text-red-500 text-slate-300 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all border border-slate-700/30">
                <span className="material-symbols-outlined text-lg">cancel</span> Reddet
              </button>
              <button className="p-2.5 bg-surface-container-high hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700/30" title="Detay">
                <span className="material-symbols-outlined text-lg">open_in_new</span>
              </button>
            </div>
          </div>

        </div>

        {/* Pagination/Load More */}
        <div className="mt-12 flex justify-center pb-12">
          <button className="group flex items-center gap-2 px-8 py-3 bg-surface-container hover:bg-surface-container-high border border-slate-700/30 rounded-xl transition-all">
            <span className="text-sm font-bold uppercase tracking-widest text-slate-400 group-hover:text-on-surface">Daha Fazla Yükle</span>
            <span className="material-symbols-outlined text-slate-400 group-hover:text-on-surface group-hover:translate-y-0.5 transition-transform">expand_more</span>
          </button>
        </div>

      </div>

      {/* Tactical HUD Element (Decorative/Info) */}
      <div className="fixed bottom-6 right-6 z-40 hidden xl:flex flex-col gap-2 pointer-events-none">
        <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 p-4 rounded-xl shadow-2xl flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-widest text-slate-400">Sistem Durumu</span>
            <span className="text-xs font-bold text-emerald-500 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              OP-NOMİNAL
            </span>
          </div>
          <div className="h-8 w-[1px] bg-slate-700"></div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-widest text-slate-400">Bekleyen</span>
            <span className="text-xs font-bold text-on-surface">14 AKTİF</span>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Dogrulanmamisİhbarlar;