// src/components/Header.jsx
import { useEffect, useState } from 'react';
import {
  Bell,
  Menu,
  Search,
  ShieldCheck,
  Volume2,
  VolumeX,
  Wifi,
  Sparkles,
  User,
  X,
  ExternalLink,
} from 'lucide-react';
import RiskBadge from './RiskBadge';
import { formatRelativeTime } from '../utils/formatters';

export default function Header({
  title = 'Operations Overview',
  connected = true,
  simulated = false,
  alerts = [],
  audioEnabled = true,
  onToggleAudio,
  onMenu,
  onNavigate,
}) {
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Keyboard shortcut ⌘K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearch((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setShowSearch(false);
        setShowNotifications(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const unreadAlerts = alerts.filter((a) => a.status === 'active');

  const searchableItems = [
    { title: 'Sector 1 - North Perimeter', category: 'Camera', page: 'cameras' },
    { title: 'Sector 2 - Alpha Gate Entry', category: 'Camera', page: 'cameras' },
    { title: 'Sector 3 - Watchtower Charlie IR', category: 'Camera', page: 'cameras' },
    { title: 'Sector 5 - Drone Recon Unit', category: 'Camera', page: 'cameras' },
    { title: 'Active Alert Queue', category: 'Security', page: 'alerts' },
    { title: 'Forensic Event Intelligence', category: 'Logs', page: 'events' },
    { title: 'AI Analytics & Statistics', category: 'Analytics', page: 'analytics' },
    { title: 'FastAPI & YOLO Settings', category: 'System', page: 'settings' },
  ];

  const searchResults = searchQuery.trim()
    ? searchableItems.filter((item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : searchableItems;

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-800 bg-slate-950/80 px-4 backdrop-blur-xl sm:px-6">
        {/* Left: Mobile Menu & Title */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMenu}
            className="rounded-xl border border-slate-800 p-2 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
            title="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-white">{title}</h1>
              <span className="hidden rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 text-[10px] font-bold text-cyan-400 sm:inline">
                DEFENSE SEC-NET
              </span>
            </div>
            <p className="hidden text-xs text-slate-400 md:block">
              Intelligent Border & Video Analytics Platform (IBVAP)
            </p>
          </div>
        </div>

        {/* Center: Quick Search Trigger */}
        <button
          type="button"
          onClick={() => setShowSearch(true)}
          className="hidden items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/90 px-3.5 py-1.5 text-xs text-slate-400 transition hover:border-slate-700 hover:text-slate-200 md:flex"
        >
          <Search className="h-3.5 w-3.5 text-slate-500" />
          <span>Search camera, sector, alert...</span>
          <kbd className="ml-2 rounded border border-slate-700 bg-slate-800 px-1.5 py-0.5 font-mono text-[10px] text-slate-400">
            ⌘K
          </kbd>
        </button>

        {/* Right: Telemetry & Actions */}
        <div className="flex items-center gap-3">
          {/* Live System Status Pill */}
          <div
            className={`hidden items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold sm:flex ${
              connected
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                : simulated
                ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300'
                : 'border-amber-500/30 bg-amber-500/10 text-amber-400'
            }`}
          >
            <span className="relative flex h-2 w-2">
              <span
                className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${
                  connected
                    ? 'bg-emerald-400'
                    : simulated
                    ? 'bg-cyan-400'
                    : 'bg-amber-400'
                }`}
              />
              <span
                className={`relative inline-flex h-2 w-2 rounded-full ${
                  connected
                    ? 'bg-emerald-500'
                    : simulated
                    ? 'bg-cyan-500'
                    : 'bg-amber-500'
                }`}
              />
            </span>
            <span>{connected ? 'FastAPI Online' : simulated ? 'Simulated AI Feeds' : 'Reconnecting'}</span>
          </div>

          {/* Audio Chime Toggle */}
          <button
            type="button"
            onClick={onToggleAudio}
            title={audioEnabled ? 'Mute Alert Audio' : 'Unmute Alert Audio'}
            className={`rounded-xl border p-2 transition ${
              audioEnabled
                ? 'border-slate-800 bg-slate-900 text-slate-300 hover:text-white'
                : 'border-rose-500/30 bg-rose-500/10 text-rose-400'
            }`}
          >
            {audioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>

          {/* Notifications Dropdown Trigger */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
              title="Recent alerts"
              className="relative rounded-xl border border-slate-800 bg-slate-900 p-2 text-slate-300 transition hover:border-slate-700 hover:text-white"
            >
              <Bell className="h-4 w-4" />
              {unreadAlerts.length > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 font-mono text-[10px] font-bold text-white">
                  {unreadAlerts.length}
                </span>
              )}
            </button>

            {/* Notifications Menu */}
            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Live Threat Feed
                  </span>
                  <span className="rounded-full bg-rose-500/20 px-2 py-0.5 font-mono text-[10px] font-bold text-rose-400">
                    {unreadAlerts.length} Active
                  </span>
                </div>
                <div className="max-h-72 divide-y divide-slate-800 overflow-y-auto">
                  {alerts.slice(0, 5).map((a) => (
                    <div
                      key={a.id}
                      onClick={() => {
                        onNavigate?.('alerts');
                        setShowNotifications(false);
                      }}
                      className="cursor-pointer p-3 transition hover:bg-slate-800/60"
                    >
                      <div className="flex items-center justify-between">
                        <span className="truncate text-xs font-semibold text-white">
                          {a.type}
                        </span>
                        <RiskBadge level={a.risk_level || 'high'} size="sm" showDot={false} />
                      </div>
                      <p className="mt-1 text-[11px] text-slate-400">
                        {a.camera_name || 'Camera'} · {formatRelativeTime(a.timestamp)}
                      </p>
                    </div>
                  ))}
                  {alerts.length === 0 && (
                    <div className="p-4 text-center text-xs text-slate-500">
                      No security alerts recorded.
                    </div>
                  )}
                </div>
                <div className="border-t border-slate-800 p-2 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      onNavigate?.('alerts');
                      setShowNotifications(false);
                    }}
                    className="text-xs font-semibold text-cyan-400 hover:text-cyan-300"
                  >
                    View All Incident Alerts →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Badge */}
          <div className="flex items-center gap-2.5 rounded-xl border border-slate-800 bg-slate-900/90 py-1.5 pl-2.5 pr-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500 font-bold text-slate-950">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div className="hidden text-left xl:block">
              <p className="text-xs font-bold leading-none text-white">Cmdr. Y. Kumar</p>
              <p className="mt-0.5 text-[10px] uppercase tracking-wider text-cyan-400">Perimeter Cmd</p>
            </div>
          </div>
        </div>
      </header>

      {/* Global Command Palette / Search Modal */}
      {showSearch && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/75 p-4 pt-20 backdrop-blur-sm">
          <div className="w-[560px] max-w-full overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
            <div className="flex items-center border-b border-slate-800 px-4">
              <Search className="h-5 w-5 text-slate-400" />
              <input
                type="text"
                autoFocus
                placeholder="Jump to camera, incident alert, event logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent px-3 py-3.5 text-sm text-white placeholder-slate-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowSearch(false)}
                className="rounded-lg p-1 text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto p-2">
              <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Navigation & Shortcuts
              </p>
              {searchResults.map((item, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => {
                    onNavigate?.(item.page);
                    setShowSearch(false);
                  }}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs transition hover:bg-slate-800/80"
                >
                  <span className="font-semibold text-white">{item.title}</span>
                  <span className="rounded bg-slate-800 px-2 py-0.5 font-mono text-[10px] text-cyan-400">
                    {item.category}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

