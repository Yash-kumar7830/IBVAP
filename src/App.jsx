// src/App.jsx
import { useState } from 'react';
import Dashboard from './pages/Dashboard';
import Alerts from './pages/Alerts';
import Events from './pages/Events';
import Cameras from './pages/Cameras';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import ErrorBoundary from './components/ErrorBoundary';
import Header from './components/Header';
import Sidebar from './components/Sidebar';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const titles = { dashboard: 'Operations overview', cameras: 'Camera network', alerts: 'Alert queue', events: 'Event intelligence', analytics: 'Analytics workspace', settings: 'System settings' };

  return <ErrorBoundary><div className="app-shell flex min-h-screen bg-slate-100">
      {sidebarOpen && <button type="button" aria-label="Close navigation" onClick={() => setSidebarOpen(false)} className="fixed inset-0 z-30 bg-slate-950/50 lg:hidden" />}
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="min-w-0 flex-1"><Header title={titles[currentPage]} onMenu={() => setSidebarOpen(true)} /><div className="page-enter">
        {currentPage === 'dashboard' && <Dashboard />}
        {currentPage === 'cameras' && <Cameras />}
        {currentPage === 'alerts' && <Alerts />}
        {currentPage === 'events' && <Events />}
        {currentPage === 'analytics' && <Analytics />}
        {currentPage === 'settings' && <Settings />}
      </div></main>
    </div></ErrorBoundary>;
}

export default App;