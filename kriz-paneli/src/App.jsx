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

  return (
    <div className="flex h-screen overflow-hidden">
      
      {/* SOL MENÜ: activeTab ve setActiveTab proplarını gönderiyoruz ki butonlar çalışsın */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
      /> 

      {/* SAĞ TARAF: Ana İçerik Alanı */}
      <main className="flex-1 flex flex-col overflow-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100">
        
        {/* Üst Çubuk: Her zaman sayfanın en üstünde sabit kalır */}
        <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} /> 
        
        {/* İÇERİK BÖLÜMÜ: Sol menüden hangi sekmeye tıklandıysa sadece o bileşeni ekrana basıyoruz */}
        {activeTab === "aktif" && <Dashboard />}
        {activeTab === "kumeler" && <Kumeler />}
        {activeTab === "harita" && <HaritaGorunumu />}
        {activeTab==="ekipler"&&<Ekipler/>}
       {activeTab === 'dogrulanmamislar' && <Dogrulanmamisİhbarlar />}

      </main>
    </div>
  )
}

export default App;