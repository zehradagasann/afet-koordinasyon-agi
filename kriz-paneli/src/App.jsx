import './App.css'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import Dashboard from './components/Dashboard' // 1. YENİ: Dashboard'u içeri çağırdık

function App() {
  return (
    <div className="flex h-screen overflow-hidden">
      
      {/* Sol Menü */}
      <Sidebar /> 

      {/* Sağ Taraf: Ana İçerik Alanı */}
      <main className="flex-1 flex flex-col overflow-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100">
        
        {/* Üst Çubuk */}
        <Header /> 
        
        {/* 2. YENİ: İstatistikler ve Harita alanını buraya koyduk! */}
        <Dashboard /> 

      </main>
    </div>
  )
}

export default App