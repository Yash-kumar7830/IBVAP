// src/components/Sidebar.jsx
import {
  Activity,
  BarChart3,
  Camera,
  Cpu,
  FileText,
  LayoutDashboard,
  Radio,
  Settings,
  Shield,
  X,
  AlertTriangle,
} from 'lucide-react';

const navItems = [
  { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
  { id: 'cameras', label: 'Camera Fleet', icon: Camera },
  { id: 'alerts', label: 'Alert Queue', icon: AlertTriangle, hasBadge: true },
  { id: 'events', label: 'Forensic Events', icon: FileText },
  { id: 'analytics', label: 'AI Analytics', icon: BarChart3 },
];

export default function Sidebar({
  currentPage,
  onNavigate,
  open,
  onClose,
  unreadAlertsCount = 3,
}) {
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-800 bg-slate-950 text-white transition-transform duration-300 lg:static lg:translate-x-0 ${
        open ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between border-b border-slate-800/80 px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 text-slate-950 shadow-lg shadow-cyan-500/20">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-black tracking-tight text-white">IBVAP</span>
              <span className="rounded-sm bg-cyan-500/20 px-1 py-0.2 font-mono text-[9px] font-bold text-cyan-400">
                v2.4
              </span>
            </div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              Border Surveillance
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
          title="Close navigation"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
          Surveillance Core
        </p>

        <nav className="space-y-1">
          {navItems.map(({ id, label, icon: Icon, hasBadge }) => {
            const isActive = currentPage === id;
            return (
              <button
                type="button"
                key={id}
                onClick={() => {
                  onNavigate(id);
                  onClose?.();
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold transition-all duration-150 ${
                  isActive
                    ? 'border border-cyan-500/40 bg-gradient-to-r from-cyan-500/20 to-blue-600/10 text-cyan-300 shadow-md shadow-cyan-950/40'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                }`}
              >
                <Icon
                  className={`h-4.5 w-4.5 ${
                    isActive ? 'text-cyan-400' : 'text-slate-500'
                  }`}
                />
                <span>{label}</span>

                {hasBadge && unreadAlertsCount > 0 && (
                  <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-rose-500/20 px-2 py-0.5 font-mono text-[10px] font-bold text-rose-400 border border-rose-500/30">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
                    {unreadAlertsCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <p className="mb-2 mt-8 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
          Platform Setup
        </p>

        <button
          type="button"
          onClick={() => {
            onNavigate('settings');
            onClose?.();
          }}
          className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold transition-all duration-150 ${
            currentPage === 'settings'
              ? 'border border-cyan-500/40 bg-gradient-to-r from-cyan-500/20 to-blue-600/10 text-cyan-300 shadow-md'
              : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
          }`}
        >
          <Settings
            className={`h-4.5 w-4.5 ${
              currentPage === 'settings' ? 'text-cyan-400' : 'text-slate-500'
            }`}
          />
          <span>System Settings</span>
        </button>
      </div>

      {/* Bottom Engine Telemetry Card */}
      <div className="border-t border-slate-800/80 p-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-3.5 shadow-inner">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span className="text-xs font-bold text-white">YOLOv11 Engine</span>
            </div>
            <span className="font-mono text-[10px] text-emerald-400">ONLINE</span>
          </div>

          <div className="mt-2.5 space-y-1 font-mono text-[10px] text-slate-400">
            <div className="flex justify-between">
              <span>Inference Latency:</span>
              <strong className="text-white">14.2 ms</strong>
            </div>
            <div className="flex justify-between">
              <span>GPU Utilization:</span>
              <strong className="text-cyan-400">48% (RTX 4090)</strong>
            </div>
            <div className="flex justify-between">
              <span>Frames Processed:</span>
              <strong className="text-white">120 FPS</strong>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

