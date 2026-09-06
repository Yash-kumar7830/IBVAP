// src/App.jsx
import { useCallback, useEffect, useState } from 'react';
import Dashboard from './pages/Dashboard';
import Alerts from './pages/Alerts';
import Events from './pages/Events';
import Cameras from './pages/Cameras';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import ErrorBoundary from './components/ErrorBoundary';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import { getAlerts } from './services/api';
import useWebSocket from './hooks/useWebSocket';

// Audio tone synthesizer for tactical border security chimes (zero external audio files needed)
function playTacticalSound(priority = 'high') {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    const now = ctx.currentTime;
    if (priority === 'critical') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.18);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.setValueAtTime(880, now + 0.09); // A5
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.28);
    }
  } catch {
    // Handled silently if browser autoplay policy restricts audio before user click
  }
}

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [alerts, setAlerts] = useState([]);

  const { message, connected, simulated } = useWebSocket();

  const titles = {
    dashboard: 'Surveillance Command Overview',
    cameras: 'Camera Fleet Network',
    alerts: 'Live Incident Queue',
    events: 'Forensic Intelligence Logs',
    analytics: 'AI Vision & Spatial Analytics',
    settings: 'System Telemetry & Controls',
  };

  const fetchGlobalAlerts = useCallback(async () => {
    try {
      const data = await getAlerts();
      setAlerts(data || []);
    } catch {
      // Ignored - fallback handles gracefully
    }
  }, []);

  useEffect(() => {
    fetchGlobalAlerts();
    const interval = setInterval(fetchGlobalAlerts, 10000);
    return () => clearInterval(interval);
  }, [fetchGlobalAlerts]);

  // Handle incoming live alerts from WebSocket
  useEffect(() => {
    if (!message) return;

    if ((message.type === 'alert' || message.alert) && (message.data || message.alert)) {
      const newAlert = message.data || message.alert;
      setAlerts((prev) => {
        if (prev.some((a) => a.id === newAlert.id)) return prev;
        return [newAlert, ...prev];
      });

      if (audioEnabled) {
        playTacticalSound(newAlert.risk_level || 'high');
      }
    }
  }, [message, audioEnabled]);

  const activeAlertsCount = alerts.filter((a) => a.status === 'active').length;

  return (
    <ErrorBoundary>
      <div className="app-shell flex min-h-screen bg-slate-950 text-slate-100 bg-radar-grid selection:bg-cyan-500/30 selection:text-cyan-200">
        {/* Mobile backdrop */}
        {sidebarOpen && (
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-30 bg-slate-950/80 backdrop-blur-sm lg:hidden"
          />
        )}

        {/* Tactical Navigation Sidebar */}
        <Sidebar
          currentPage={currentPage}
          onNavigate={setCurrentPage}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          unreadAlertsCount={activeAlertsCount}
        />

        {/* Main Content Area */}
        <main className="min-w-0 flex-1 flex flex-col min-h-screen">
          <Header
            title={titles[currentPage] || 'Command Center'}
            connected={connected}
            simulated={simulated}
            alerts={alerts}
            audioEnabled={audioEnabled}
            onToggleAudio={() => setAudioEnabled((prev) => !prev)}
            onMenu={() => setSidebarOpen(true)}
            onNavigate={setCurrentPage}
          />

          <div className="page-enter flex-1 p-4 sm:p-6 lg:p-8">
            {currentPage === 'dashboard' && <Dashboard onNavigate={setCurrentPage} />}
            {currentPage === 'cameras' && <Cameras onNavigate={setCurrentPage} />}
            {currentPage === 'alerts' && <Alerts onNavigate={setCurrentPage} />}
            {currentPage === 'events' && <Events onNavigate={setCurrentPage} />}
            {currentPage === 'analytics' && <Analytics onNavigate={setCurrentPage} />}
            {currentPage === 'settings' && <Settings onNavigate={setCurrentPage} />}
          </div>
        </main>
      </div>
    </ErrorBoundary>
  );
}

export default App;