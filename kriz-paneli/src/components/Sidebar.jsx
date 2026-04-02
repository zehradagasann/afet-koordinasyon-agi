<<<<<<< HEAD
// 1. ADIM: activeTab ve setActiveTab proplarını ekledik
export default function Sidebar({ isOpen, activeTab, setActiveTab }) {
  
  // Hangi sekmenin aktif olduğuna göre sınıf (CSS) döndüren fonksiyon
  const getTabClass = (tabName) => {
    const baseClass = "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all cursor-pointer";
    if (activeTab === tabName) {
      // Aktif sekme stili (Mavi ve parlamalı)
      return `${baseClass} bg-blue-600 text-white shadow-lg shadow-blue-600/40`;
    } else {
      // Pasif sekme stili (Gri, üzerine gelince aydınlanan)
      return `${baseClass} text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800/50`;
    }
  };

  return (
    <aside 
      className={`bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0 h-screen transition-all duration-300 ease-in-out overflow-hidden ${
        isOpen ? "w-72" : "w-0 opacity-0 border-r-0"
      }`}
    >
      <div className="w-72 flex flex-col h-full">
        
        {/* Sol Üst - Merkezlenmiş Logo Alanı */}
        <div className="p-6 flex flex-col items-center justify-center border-b border-slate-200 dark:border-slate-800/50 bg-slate-100/30 dark:bg-slate-900/30">
          <div className="flex flex-col items-center justify-center select-none cursor-pointer scale-[0.55] origin-center -my-4 z-10">
              <div className="relative w-16 h-[72px] -mb-3 z-10">
                  <div className="w-full h-full rounded-[20%_20%_50%_50%/10%_10%_40%_40%] bg-gradient-to-br from-slate-100 to-slate-300 dark:from-slate-200 dark:to-slate-400 border-[3px] border-slate-400 shadow-lg transform scale-y-105"></div>
                  <svg className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-10 h-auto" viewBox="0 0 100 60">
                      <path d="M5,30 h35 L45,15 L50,45 L55,15 L60,30 h35" stroke="#1e293b" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
              </div>
              <div className="font-extrabold text-[55px] leading-none tracking-tighter flex items-baseline font-sans drop-shadow-sm">
                  <span className="text-slate-800 dark:text-slate-100">RES</span><span className="text-red-600">Q</span>
              </div>
              <div className="w-[120%] h-5 -mt-2 flex justify-center">
                  <svg className="w-full h-full drop-shadow-md" viewBox="0 0 250 20">
                      <path d="M0,10 h185 L190,5 L195,15 L200,5 L205,10 h45" stroke="#dc2626" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
              </div>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mt-2 z-10">
            Otonom Asistan
          </p>
        </div>
        
        {/* Menü Linkleri */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          
          {/* AKTİF İHBARLAR BUTONU */}
          <div 
            className={getTabClass("aktif")} 
            onClick={() => setActiveTab("aktif")}
          >
            <span className="material-symbols-outlined">warning</span>
            <span>Aktif İhbarlar</span>
          </div>
          
          {/* KÜMELER BUTONU */}
          <div 
            className={getTabClass("kumeler")} 
            onClick={() => setActiveTab("kumeler")}
          >
            <span className="material-symbols-outlined">hub</span>
            <span>Kümeler</span>
          </div>

          {/* HARİTA GÖRÜNÜMÜ BUTONU */}
          <div 
            className={getTabClass("harita")} 
            onClick={() => setActiveTab("harita")}
          >
            <span className="material-symbols-outlined">map</span>
            <span>Harita Görünümü</span>
          </div>

          {/* EKİPLER BUTONU */}
          <div 
            className={getTabClass("ekipler")} 
            onClick={() => setActiveTab("ekipler")}
          >
            <span className="material-symbols-outlined">groups</span>
            <span>Ekipler</span>
          </div>

          {/* Ayırıcı Çizgi */}
          <div className="h-px bg-slate-200 dark:bg-slate-800 my-4 mx-2"></div>

          {/* DOĞRULANMAMIŞLAR BUTONU (Özel stilli) */}
          <div 
            className={`group flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all cursor-pointer ${
              activeTab === "dogrulanmamislar" 
                ? "bg-red-600 text-white shadow-lg shadow-red-600/40" 
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800/50"
            }`}
            onClick={() => setActiveTab("dogrulanmamislar")}
          >
            <span className={`material-symbols-outlined transition-colors ${activeTab !== "dogrulanmamislar" && "group-hover:text-red-500"}`}>pending_actions</span>
            <span>Doğrulanmamışlar</span>
            <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse ${
              activeTab === "dogrulanmamislar" ? "bg-white text-red-600" : "bg-red-500 text-white shadow-[0_0_8px_rgba(239,68,68,0.6)]"
            }`}>12</span>
          </div>

        </nav>

        {/* Alt Profil Alanı */}
        <div className="p-4 mt-auto border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 font-medium transition-all cursor-pointer">
            <span className="material-symbols-outlined">settings</span>
            <span>Ayarlar</span>
          </div>
          <div className="mt-4 p-4 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center gap-3 border border-slate-300 dark:border-slate-700">
            <div className="size-9 rounded-full bg-slate-400 overflow-hidden ring-2 ring-white dark:ring-slate-900">
              <img alt="User" className="w-full h-full object-cover" src="https://ui-avatars.com/api/?name=Ahmet+Yilmaz&background=2563eb&color=fff&bold=true"/>
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold text-slate-900 dark:text-white truncate">Dr. Ahmet Yılmaz</p>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide truncate">Saha Koordinatörü</p>
            </div>
=======
import { USER_ROLES } from '../constants/formOptions';

export default function Sidebar({ user, currentView, onNavigate }) {
  const userRole = user ? USER_ROLES[user.role] : 'Kullanıcı';
  const userName = user ? `${user.first_name} ${user.last_name}` : 'Kullanıcı';
  const userPhoto = user?.profile_photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=136dec&color=fff`;
  
  return (
    <aside className="w-72 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0 h-screen">
      <div className="p-6 flex items-center gap-4">
        <div className="afad-logo-container">
          <span className="afad-text text-3xl text-afad-blue dark:text-white">AFAD</span>
          <div className="turk-flag-circle"></div>
        </div>
        <div className="ml-2">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Kriz Yönetimi</p>
        </div>
      </div>
      
      <nav className="flex-1 px-4 py-4 space-y-1">
        <button
          onClick={() => onNavigate('dashboard')}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all w-full text-left ${
            currentView === 'dashboard'
              ? 'bg-primary text-white'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
          }`}
        >
          <span className="material-symbols-outlined">warning</span>
          <span>Aktif İhbarlar</span>
        </button>
        <a className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 font-medium transition-all" href="#">
          <span className="material-symbols-outlined">map</span>
          <span>Harita Görünümü</span>
        </a>
        <a className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 font-medium transition-all" href="#">
          <span className="material-symbols-outlined">groups</span>
          <span>Ekipler</span>
        </a>
        <a className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 font-medium transition-all" href="#">
          <span className="material-symbols-outlined">pending_actions</span>
          <span>Doğrulanmamışlar</span>
          <span className="ml-auto bg-emergency-red text-white text-[10px] px-2 py-0.5 rounded-full">12</span>
        </a>
      </nav>

      <div className="p-4 mt-auto border-t border-slate-200 dark:border-slate-800">
        <button
          onClick={() => onNavigate('profile')}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all w-full text-left ${
            currentView === 'profile'
              ? 'bg-slate-200 dark:bg-slate-800'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
          }`}
        >
          <span className="material-symbols-outlined">settings</span>
          <span>Profil Ayarları</span>
        </button>
        <div className="mt-4 p-4 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center gap-3">
          <div className="size-8 rounded-full bg-slate-400 overflow-hidden">
            <img alt={userName} className="w-full h-full object-cover" src={userPhoto} />
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-semibold truncate">{userName}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{userRole}</p>
>>>>>>> 0edcaa8bdfe7ff7aa697a23cd063ae91e8a6009d
          </div>
        </div>
      </div>
    </aside>
  );
}