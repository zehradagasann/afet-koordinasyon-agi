import React from 'react';

export default function Kumeler() {
  return (
    <div className="flex-1 overflow-y-auto bg-slate-900 text-white relative p-6">
      
      <div className="max-w-[1600px] mx-auto grid grid-cols-12 gap-6">
        
        {/* ANA BAŞLIK VE BUTONLAR */}
        <div className="col-span-12 flex justify-between items-end mb-2">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-white">İhbar Kümeleri ve Analiz</h2>
            <p className="text-slate-400 text-sm mt-1">Gerçek zamanlı yapay zeka tarafından gruplandırılmış acil durum veri akışı.</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-slate-700 transition-colors active:scale-95 border border-slate-700">
              <span className="material-symbols-outlined text-lg">filter_list</span>
              Filtrele
            </button>
            <button className="flex items-center gap-2 bg-rose-600 px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-rose-600/20 hover:brightness-110 transition-all active:scale-95">
              <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>emergency</span>
              ACİL DURUM BİLDİR
            </button>
          </div>
        </div>

        {/* SOL TARAF: KÜME KARTLARI */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          
          {/* YÜKSEK ACİLİYET KARTI */}
          <div className="bg-slate-800 border border-red-500/20 rounded-xl overflow-hidden shadow-sm">
            <div className="bg-red-500/10 p-4 border-b border-red-500/20 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-tighter">YÜKSEK ACİLİYET</span>
                <h3 className="font-bold text-white">KÜME #TR-34-A1 (KADIKÖY)</h3>
              </div>
              <div className="flex items-center gap-1 text-red-500 text-xs font-bold">
                <span className="material-symbols-outlined text-sm">schedule</span>
                SON GÜNCELLEME: 2DK ÖNCE
              </div>
            </div>
            
            <div className="p-6 grid grid-cols-3 gap-6">
              <div className="col-span-2 space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1 bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">ETKİLENEN NÜFUS</p>
                    <p className="text-2xl font-extrabold">~450 <span className="text-sm font-medium text-slate-400">kişi</span></p>
                  </div>
                  <div className="flex-1 bg-slate-900/50 p-4 rounded-lg border border-slate-700/50 text-red-500">
                    <p className="text-[10px] uppercase font-bold tracking-widest mb-1 text-slate-400">KAYNAK İHTİYACI</p>
                    <p className="text-2xl font-extrabold">KRİTİK</p>
                  </div>
                </div>
                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-2">İHBAR ÖZETİ (AI ANALİZİ)</p>
                  <p className="text-sm leading-relaxed text-slate-300">Merkezi lokasyonda yapısal çökme ve yangın ihbarları yoğunlaşmaktadır. Gaz sızıntısı riski %85. Tahliye rotaları kısmen kapalı.</p>
                </div>
              </div>
              <div className="col-span-1 flex flex-col justify-between">
                <div className="aspect-square bg-slate-950 rounded-lg border border-slate-700/50 relative overflow-hidden">
                  <img alt="Cluster Map Kadikoy" className="w-full h-full object-cover opacity-60" src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=400&auto=format&fit=crop" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="material-symbols-outlined text-red-500 text-4xl animate-pulse">location_on</span>
                  </div>
                </div>
                <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold mt-4 hover:bg-blue-700 transition-colors active:scale-95 flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined">send</span>
                  EKİP YÖNLENDİR
                </button>
              </div>
            </div>
          </div>

          {/* ORTA SEVİYE KARTI */}
          <div className="bg-slate-800 border border-amber-500/20 rounded-xl overflow-hidden shadow-sm">
            <div className="bg-amber-500/10 p-4 border-b border-amber-500/20 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className="bg-amber-500 text-slate-900 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-tighter">ORTA SEVİYE</span>
                <h3 className="font-bold text-white">KÜME #TR-34-B2 (ÜSKÜDAR)</h3>
              </div>
              <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                <span className="material-symbols-outlined text-sm">schedule</span>
                SON GÜNCELLEME: 12DK ÖNCE
              </div>
            </div>
            
            <div className="p-6 grid grid-cols-3 gap-6">
              <div className="col-span-2 space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1 bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">ETKİLENEN NÜFUS</p>
                    <p className="text-2xl font-extrabold">~120 <span className="text-sm font-medium text-slate-400">kişi</span></p>
                  </div>
                  <div className="flex-1 bg-slate-900/50 p-4 rounded-lg border border-slate-700/50 text-amber-500">
                    <p className="text-[10px] uppercase font-bold tracking-widest mb-1 text-slate-400">KAYNAK İHTİYACI</p>
                    <p className="text-2xl font-extrabold">STANDART</p>
                  </div>
                </div>
                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-2">İHBAR ÖZETİ (AI ANALİZİ)</p>
                  <p className="text-sm leading-relaxed text-slate-300">Su baskını ve elektrik kesintisi kaynaklı mahsur kalma vakaları. İtfaiye ekipleri bölgeye sevk edildi, destek bekleniyor.</p>
                </div>
              </div>
              <div className="col-span-1 flex flex-col justify-between">
                <div className="aspect-square bg-slate-950 rounded-lg border border-slate-700/50 relative overflow-hidden">
                  <img alt="Cluster Map Uskudar" className="w-full h-full object-cover opacity-60" src="https://images.unsplash.com/photo-1518558997970-4fcd0e34c06f?q=80&w=400&auto=format&fit=crop" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="material-symbols-outlined text-amber-500 text-4xl">location_on</span>
                  </div>
                </div>
                <button className="w-full bg-slate-700 text-white py-3 rounded-xl font-bold mt-4 hover:bg-slate-600 transition-colors active:scale-95 flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined">send</span>
                  EKİP YÖNLENDİR
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* SAĞ TARAF: DETAY ANALİZİ PANELI */}
        <aside className="col-span-12 lg:col-span-4 space-y-6">
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 h-fit sticky top-6">
            <div className="flex items-center gap-2 mb-6">
              <span className="material-symbols-outlined text-blue-500">analytics</span>
              <h3 className="text-lg font-bold uppercase tracking-tight">KÜME DETAY ANALİZİ</h3>
            </div>
            
            <div className="space-y-6">
              {/* Kaynak Doluluk Oranı */}
              <div>
                <div className="flex justify-between items-end mb-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">KAYNAK DOLULUK ORANI</label>
                  <span className="text-sm font-bold text-red-500">92%</span>
                </div>
                <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-red-600 w-[92%]"></div>
                </div>
              </div>

              {/* Bölgesel Duygu Analizi */}
              <div>
                <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-3 block">BÖLGESEL DUYGU ANALİZİ</label>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-red-500/10 text-red-500 text-[10px] font-bold px-3 py-1 rounded-full border border-red-500/20">PANİK: YÜKSEK</span>
                  <span className="bg-amber-500/10 text-amber-500 text-[10px] font-bold px-3 py-1 rounded-full border border-amber-500/20">BELİRSİZLİK: ORTA</span>
                  <span className="bg-blue-500/10 text-blue-500 text-[10px] font-bold px-3 py-1 rounded-full border border-blue-500/20">MOBİLİZASYON: AKTİF</span>
                </div>
              </div>

              <div className="h-[1px] bg-slate-700/50"></div>

              {/* Metrikler (Bento) */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
                  <p className="text-[10px] text-slate-400 font-bold">AKTİF EKİP</p>
                  <p className="text-xl font-bold text-blue-500">24</p>
                </div>
                <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
                  <p className="text-[10px] text-slate-400 font-bold">BEKLEYEN</p>
                  <p className="text-xl font-bold text-white">142</p>
                </div>
                <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
                  <p className="text-[10px] text-slate-400 font-bold">ÇÖZÜLEN</p>
                  <p className="text-xl font-bold text-white">12</p>
                </div>
                <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
                  <p className="text-[10px] text-slate-400 font-bold">HAVA DURUMU</p>
                  <div className="flex items-center gap-1 text-white">
                    <span className="material-symbols-outlined text-sm">cloudy_snowing</span>
                    <p className="text-sm font-bold">-2°C</p>
                  </div>
                </div>
              </div>

              {/* Son Aksiyonlar */}
              <div>
                <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-3 block">SON SİSTEM AKSİYONLARI</label>
                <div className="space-y-3">
                  <div className="flex gap-3 text-xs border-l-2 border-blue-500 pl-3 py-1 text-slate-300">
                    <span className="text-slate-500 font-mono">14:22</span>
                    <p><span className="font-bold text-blue-400">TR-34-A1</span> için İtfaiye desteği onaylandı.</p>
                  </div>
                  <div className="flex gap-3 text-xs border-l-2 border-amber-500 pl-3 py-1 opacity-80 text-slate-300">
                    <span className="text-slate-500 font-mono">14:18</span>
                    <p><span className="font-bold">ÜSKÜDAR</span> kümesi için drone taraması başlatıldı.</p>
                  </div>
                  <div className="flex gap-3 text-xs border-l-2 border-slate-600 pl-3 py-1 opacity-50 text-slate-300">
                    <span className="text-slate-500 font-mono">14:05</span>
                    <p>Genel sistem yedeklemesi tamamlandı.</p>
                  </div>
                </div>
              </div>

              <button className="w-full py-3 bg-slate-900 text-white border border-slate-700 rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors uppercase tracking-widest">
                TAM RAPORU İNDİR (.PDF)
              </button>
            </div>
          </div>
        </aside>

      </div>

      {/* SAĞ ALT YÜZEN BUTON */}
      <div className="fixed bottom-8 right-8 flex flex-col items-end gap-3 z-50">
        <div className="bg-red-900/80 backdrop-blur-sm text-red-100 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest shadow-2xl border border-red-500/30 mb-2 animate-bounce">
          Kritik Bildirim: 3 Yeni Küme
        </div>
        <button className="w-16 h-16 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-90 transition-all group relative">
          <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>add_alert</span>
          <span className="absolute right-20 bg-slate-800 px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity border border-slate-700 pointer-events-none">
            YENİ İHBAR OLUŞTUR
          </span>
        </button>
      </div>

    </div>
  );
}