<<<<<<< HEAD
import { useState } from 'react'; 
import './App.css';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard'; 
import Kumeler from './Kumeler'; 
import HaritaGorunumu from './HaritaGorunumu';
import Ekipler from './Ekipler';
import Dogrulanmamisİhbarlar from "./Dogrulanmamisİhbarlar.jsx";

function App() {
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const [activeTab, setActiveTab] = useState("aktif");

=======
import { useState, useEffect } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import { authService } from './services/authService';

function App() {
  const [currentView, setCurrentView] = useState('login'); // 'login', 'register', 'dashboard', 'profile'
  const [user, setUser] = useState(null);

  // Sayfa yüklendiğinde token kontrolü
  useEffect(() => {
    const token = authService.getToken();
    const savedUser = authService.getUser();
    
    if (token && savedUser) {
      setUser(savedUser);
      setCurrentView('dashboard');
    }
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setCurrentView('dashboard');
  };

  const handleRegisterSuccess = (userData) => {
    setUser(userData);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setCurrentView('login');
  };

  const handleProfileUpdate = (updatedUser) => {
    setUser(updatedUser);
  };

  // Login sayfası
  if (currentView === 'login') {
    return (
      <Login
        onLoginSuccess={handleLoginSuccess}
        onSwitchToRegister={() => setCurrentView('register')}
      />
    );
  }

  // Register sayfası
  if (currentView === 'register') {
    return (
      <Register
        onRegisterSuccess={handleRegisterSuccess}
        onSwitchToLogin={() => setCurrentView('login')}
      />
    );
  }

  // Dashboard veya Profile (giriş yapılmışsa)
>>>>>>> 0edcaa8bdfe7ff7aa697a23cd063ae91e8a6009d
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar user={user} currentView={currentView} onNavigate={setCurrentView} />
      
<<<<<<< HEAD
      {/* SOL MENÜ: activeTab ve setActiveTab proplarını gönderiyoruz ki butonlar çalışsın */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
      /> 

      {/* SAĞ TARAF: Ana İçerik Alanı */}
=======
>>>>>>> 0edcaa8bdfe7ff7aa697a23cd063ae91e8a6009d
      <main className="flex-1 flex flex-col overflow-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100">
        <Header user={user} onLogout={handleLogout} />
        
<<<<<<< HEAD
        {/* Üst Çubuk: Her zaman sayfanın en üstünde sabit kalır */}
        <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} /> 
        
        {/* İÇERİK BÖLÜMÜ: Sol menüden hangi sekmeye tıklandıysa sadece o bileşeni ekrana basıyoruz */}
        {activeTab === "aktif" && <Dashboard />}
        {activeTab === "kumeler" && <Kumeler />}
        {activeTab === "harita" && <HaritaGorunumu />}
        {activeTab==="ekipler"&&<Ekipler/>}
       {activeTab === 'dogrulanmamislar' && <Dogrulanmamisİhbarlar />}

=======
        {currentView === 'dashboard' && <Dashboard />}
        {currentView === 'profile' && <Profile user={user} onUpdateSuccess={handleProfileUpdate} />}
>>>>>>> 0edcaa8bdfe7ff7aa697a23cd063ae91e8a6009d
      </main>
    </div>
  );
}

export default App;