// src/App.jsx
import { useState } from 'react';
import Dashboard from './pages/Dashboard';
import { LayoutDashboard, AlertTriangle, FileText, BarChart3, Settings, Camera } from 'lucide-react';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'cameras', label: 'Cameras', icon: Camera },
    { id: 'alerts', label: 'Alerts', icon: AlertTriangle },
    { id: 'events', label: 'Events', icon: FileText },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r">
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold">IBVAP</h1>
          <p className="text-xs text-gray-500">Video Analytics Platform</p>
        </div>
        <nav className="p-4">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded mb-1 ${
                currentPage === item.id
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {currentPage === 'dashboard' && <Dashboard />}
        {currentPage === 'cameras' && <div className="p-6"><h1 className="text-2xl font-bold">Cameras Page</h1></div>}
        {currentPage === 'alerts' && <div className="p-6"><h1 className="text-2xl font-bold">Alerts Page</h1></div>}
        {currentPage === 'events' && <div className="p-6"><h1 className="text-2xl font-bold">Events Page</h1></div>}
        {currentPage === 'analytics' && <div className="p-6"><h1 className="text-2xl font-bold">Analytics Page</h1></div>}
        {currentPage === 'settings' && <div className="p-6"><h1 className="text-2xl font-bold">Settings Page</h1></div>}
      </div>
    </div>
  );
}

export default App;