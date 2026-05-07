import { useState, useEffect } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Kumeler from './Kumeler';
import HaritaGorunumu from './HaritaGorunumu';
import Ekipler from './Ekipler';
import Dogrulanmamisİhbarlar from "./Dogrulanmamisİhbarlar.jsx";
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Kalibrasyonlar from './pages/Kalibrasyonlar';
import { authService } from './services/authService';
import MobileBanner from './components/MobileBanner';

const ROLE_TABS = {
  admin:       ['aktif', 'kumeler', 'harita', 'ekipler', 'kalibrasyon', 'dogrulanmamislar', 'profile'],
  coordinator: ['aktif', 'kumeler', 'harita', 'ekipler', 'dogrulanmamislar', 'profile'],
  volunteer:   ['aktif', 'harita', 'profile'],
  citizen:     ['profile'],
};

const canAccessTab = (role, tab) => (ROLE_TABS[role] ?? ROLE_TABS.citizen).includes(tab);

const defaultTabForRole = (role) => role === 'citizen' ? 'profile' : 'aktif';

function AccessDenied() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 text-slate-400 dark:text-slate-500">
      <span className="material-symbols-outlined text-6xl">lock</span>
      <h2 className="text-xl font-semibold text-slate-600 dark:text-slate-300">Erişim Kısıtlı</h2>
      <p className="text-sm">Bu sayfayı görüntülemek için yeterli yetkiniz yok.</p>
    </div>
  );
}

function App() {
  // --- KULLANICI VE GİRİŞ DURUMU YÖNETİMİ ---
  const [user, setUser] = useState(null);
  const [authView, setAuthView] = useState('Login'); // Sadece giriş yapılmadıysa 'login' veya 'register'

  // --- ARAYÜZ (MENÜ) DURUMU YÖNETİMİ (Senin Kodun) ---
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("aktif");

  // Sayfa yüklendiğinde token kontrolü (Backend bağlantısı)
  useEffect(() => {
    const checkAuth = async () => {
      const token = authService.getToken();
      const savedUser = authService.getUser();
      
      if (token && savedUser) {
        try {
          // Token'ın geçerliliğini kontrol et
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
          setActiveTab(defaultTabForRole(currentUser.role));
        } catch (error) {
          // Token geçersizse logout yap
          console.error('Token doğrulama hatası:', error);
          authService.logout();
          setUser(null);
          setAuthView('Login');
        }
      }
    };

    checkAuth();
  }, []);

  // --- YETKİLENDİRME FONKSİYONLARI ---
  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setActiveTab(defaultTabForRole(userData.role));
  };

  const handleRegisterSuccess = (userData) => {
    setUser(userData);
    setActiveTab(defaultTabForRole(userData.role));
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setAuthView('Login');
  };

  const handleProfileUpdate = (updatedUser) => {
    setUser(updatedUser);
  };

  // --- KULLANICI GİRİŞ YAPMAMIŞSA (Giriş / Kayıt Ekranları) ---
  if (!user) {
    if (authView === 'Login') {
      return (
        <>
          <MobileBanner />
          <Login
            onLoginSuccess={handleLoginSuccess}
            onSwitchToRegister={() => setAuthView('Register')}
          />
        </>
      );
    }
    if (authView === 'Register') {
      return (
        <>
          <MobileBanner />
          <Register
            onRegisterSuccess={handleRegisterSuccess}
            onSwitchToLogin={() => setAuthView('Login')}
          />
        </>
      );
    }
  }

  // --- VATANDAŞ ROLÜ → Mobil uygulamaya yönlendir ---
  if (user?.role === 'citizen') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          {/* Logo */}
          <div className="flex flex-col items-center justify-center select-none scale-[0.65] origin-center mb-2">
            <div className="relative w-16 h-[72px] -mb-3 z-10">
              <div className="w-full h-full rounded-[20%_20%_50%_50%/10%_10%_40%_40%] bg-gradient-to-br from-slate-100 to-slate-300 dark:from-slate-200 dark:to-slate-400 border-[3px] border-slate-400 shadow-lg"></div>
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

          {/* Kart */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-8 mt-4">
            <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-red-600 text-3xl">smartphone</span>
            </div>

            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
              Mobil Uygulamamızı Kullanın
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6">
              Bu panel koordinatörler ve ekipler içindir. Yardım talebi oluşturmak ve durumunuzu takip etmek için RESQ mobil uygulamasını indirin.
            </p>

            <ul className="space-y-3 mb-6 text-left">
              {[
                ['location_on', 'GPS ile anlık konum tespiti'],
                ['add_alert',   '4 adımda hızlı yardım talebi'],
                ['track_changes', 'Talebinizin gerçek zamanlı takibi'],
                ['wifi_off',    'Çevrimdışı mod desteği'],
              ].map(([icon, text]) => (
                <li key={icon} className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                  <span className="material-symbols-outlined text-base text-red-600 shrink-0">{icon}</span>
                  {text}
                </li>
              ))}
            </ul>

            <a
              href="https://qr.bilalabic.com/afet-apk"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-semibold text-sm transition-colors mb-3"
            >
              <span className="material-symbols-outlined text-lg">download</span>
              Mobil Uygulamayı İndir
            </a>

            <button
              onClick={handleLogout}
              className="w-full py-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-xs transition-colors flex items-center justify-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">logout</span>
              Çıkış Yap
            </button>
          </div>

          <p className="text-center text-xs text-slate-400 mt-6">
            © 2026 RESQ - Afet ve Acil Durum Yönetimi Sistemi
          </p>
        </div>
      </div>
    );
  }

  // --- KULLANICI GİRİŞ YAPMIŞSA (Ana Panel Arayüzü) ---
  return (
    <div className="flex h-screen overflow-hidden">
      <MobileBanner />
      
      {/* SOL MENÜ: Senin propların + kimlik bilgisi */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        user={user}
      />
      
      {/* SAĞ TARAF: Ana İçerik Alanı */}
      <main className="flex-1 flex flex-col overflow-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100">
        
        {/* Üst Çubuk: Sidebar'ı aç/kapat, profili göster ve çıkış yap */}
        <Header 
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
          user={user} 
          onLogout={handleLogout}
          onProfileClick={() => setActiveTab('profile')}
        />
        
        {/* İÇERİK BÖLÜMÜ: rol kontrolü yapıldıktan sonra sekme render edilir */}
        {!canAccessTab(user?.role, activeTab) ? (
          <AccessDenied />
        ) : (
          <>
            {activeTab === "aktif" && <Dashboard />}
            {activeTab === "kumeler" && <Kumeler />}
            {activeTab === "harita" && <HaritaGorunumu />}
            {activeTab === "ekipler" && <Ekipler />}
            {activeTab === 'dogrulanmamislar' && <Dogrulanmamisİhbarlar />}
            {activeTab === 'kalibrasyon' && <Kalibrasyonlar />}
            {activeTab === 'profile' && <Profile user={user} onUpdateSuccess={handleProfileUpdate} />}
          </>
        )}
        
      </main>
    </div>
  );
}

export default App;