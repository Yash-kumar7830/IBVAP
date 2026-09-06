// src/pages/Dashboard.jsx
import { useCallback, useEffect, useState } from 'react';
import VideoPanel from '../components/VideoPanel';
import StatCard from '../components/StatCard';
import AlertCard from '../components/AlertCard';
import ZoneEditor from '../components/ZoneEditor';
import {
  Activity,
  AlertTriangle,
  Car,
  CheckCircle2,
  Grid2x2,
  Layers,
  Maximize2,
  Radio,
  RefreshCw,
  Shield,
  ShieldAlert,
  Tv,
  Users,
  Video,
} from 'lucide-react';
import { acknowledgeAlert, getAlerts, getCameras, getStatistics } from '../services/api';
import useWebSocket from '../hooks/useWebSocket';

const EMPTY_STATS = {
  activeCameras: 0,
  peopleDetected: 0,
  vehiclesDetected: 0,
  activeAlerts: 0,
  highRiskEvents: 0,
};

const mapStats = (stats = {}) => ({
  activeCameras: stats.active_cameras ?? stats.activeCameras ?? 6,
  peopleDetected: stats.people_detected ?? stats.peopleDetected ?? 148,
  vehiclesDetected: stats.vehicles_detected ?? stats.vehiclesDetected ?? 94,
  activeAlerts: stats.active_alerts ?? stats.activeAlerts ?? 4,
  highRiskEvents: stats.high_risk_events ?? stats.highRiskEvents ?? 18,
});

export default function Dashboard({ onNavigate } = {}) {
  const [cameras, setCameras] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState(EMPTY_STATS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [detections, setDetections] = useState([]);
  const [layout, setLayout] = useState('2x2'); // '1x1' | '1x2' | '2x2' | 'all'
  const [activeSector, setActiveSector] = useState('all');
  const [selectedCameraForZone, setSelectedCameraForZone] = useState(null);
  const [investigatingAlert, setInvestigatingAlert] = useState(null);

  const { message, connected, simulated } = useWebSocket();

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [cameraData, statistics, alertData] = await Promise.all([
        getCameras(),
        getStatistics(),
        getAlerts(),
      ]);
      setCameras(cameraData || []);
      setStats(mapStats(statistics));
      setAlerts(alertData || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Handle live WebSocket detections & alert events
  useEffect(() => {
    if (!message) return;

    if (message.type === 'detection' || message.track_id) {
      setDetections((prev) => {
        const withoutCurrent = prev.filter((d) => d.track_id !== message.track_id);
        return [...withoutCurrent, message].slice(-50);
      });
    }

    if (message.type === 'alert' && message.alert) {
      setAlerts((prev) => [message.alert, ...prev.filter((a) => a.id !== message.alert.id)]);
      setStats((prev) => ({
        ...prev,
        activeAlerts: prev.activeAlerts + 1,
        highRiskEvents:
          message.alert.risk_level === 'critical' || message.alert.risk_level === 'high'
            ? prev.highRiskEvents + 1
            : prev.highRiskEvents,
      }));
    }
  }, [message]);

  const handleAcknowledgeAlert = async (alert) => {
    await acknowledgeAlert(alert.id);
    setAlerts((prev) =>
      prev.map((a) => (a.id === alert.id ? { ...a, status: 'acknowledged' } : a))
    );
    setStats((prev) => ({
      ...prev,
      activeAlerts: Math.max(0, prev.activeAlerts - 1),
    }));
  };

  // Filter cameras
  const filteredCameras = cameras.filter((cam) => {
    if (activeSector === 'all') return true;
    return cam.sector?.toLowerCase().includes(activeSector.toLowerCase());
  });

  const getVisibleCameras = () => {
    if (layout === '1x1') return filteredCameras.slice(0, 1);
    if (layout === '1x2') return filteredCameras.slice(0, 2);
    if (layout === '2x2') return filteredCameras.slice(0, 4);
    return filteredCameras;
  };

  const visibleCameras = getVisibleCameras();

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Top Welcome & Mission Banner */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 p-6 shadow-2xl backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-3 w-3 items-center justify-center">
              <span className="absolute h-3 w-3 animate-ping rounded-full bg-cyan-400 opacity-75" />
              <span className="h-2 w-2 rounded-full bg-cyan-400" />
            </span>
            <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
              Surveillance Command & Control
            </h2>
          </div>
          <p className="mt-1 text-xs text-slate-400 sm:text-sm">
            Autonomous Perimeter Defense &bull; DeepSORT Multi-Object Tracking &bull; Real-time AI Inference
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-2 font-mono text-xs">
            <span className="text-slate-400">Threat Defense Level:</span>
            <span className="font-bold text-emerald-400">DEFCON 4 (NORMAL)</span>
          </div>

          <button
            type="button"
            onClick={loadDashboardData}
            title="Refresh feeds"
            className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:bg-slate-700 hover:text-white"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Error alert banner if any */}
      {error && (
        <div className="mb-6 flex items-center justify-between rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-300">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-rose-400" />
            <span>{error}</span>
          </div>
          <button
            onClick={loadDashboardData}
            className="rounded-lg border border-rose-500/30 bg-rose-500/20 px-3 py-1 font-semibold hover:bg-rose-500/30"
          >
            Retry
          </button>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          label="Active Cameras"
          value={loading ? '...' : `${stats.activeCameras} / 6`}
          icon={Video}
          tone="cyan"
          trend={0}
          subtitle="100% Network Coverage"
        />
        <StatCard
          label="People Tracked"
          value={loading ? '...' : stats.peopleDetected}
          icon={Users}
          tone="emerald"
          trend={12}
          subtitle="Across 6 sectors"
        />
        <StatCard
          label="Vehicles Scanned"
          value={loading ? '...' : stats.vehiclesDetected}
          icon={Car}
          tone="blue"
          trend={5}
          subtitle="RFID & Optical matched"
        />
        <StatCard
          label="Active Alerts"
          value={loading ? '...' : stats.activeAlerts}
          icon={AlertTriangle}
          tone="amber"
          trend={-8}
          subtitle="Unacknowledged"
        />
        <StatCard
          label="High-Risk Events"
          value={loading ? '...' : stats.highRiskEvents}
          icon={ShieldAlert}
          tone="rose"
          trend={2}
          subtitle="Critical boundary triggers"
        />
      </div>

      {/* Surveillance Grid Controls Bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-md">
        {/* Sector Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mr-1">
            Sector:
          </span>
          {[
            { id: 'all', label: 'All Sectors' },
            { id: 'north', label: 'North Border' },
            { id: 'gate', label: 'Alpha Gate' },
            { id: 'watchtower', label: 'Watchtower' },
            { id: 'aerial', label: 'Drone Recon' },
          ].map((sec) => (
            <button
              type="button"
              key={sec.id}
              onClick={() => setActiveSector(sec.id)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                activeSector === sec.id
                  ? 'border border-cyan-500/40 bg-cyan-500/20 text-cyan-300 shadow-sm'
                  : 'border border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
              }`}
            >
              {sec.label}
            </button>
          ))}
        </div>

        {/* Layout Switcher */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mr-1">
            Grid Wall:
          </span>
          <div className="flex rounded-xl border border-slate-800 bg-slate-950 p-1">
            <button
              type="button"
              onClick={() => setLayout('1x1')}
              title="Single Focus (1x1)"
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                layout === '1x1'
                  ? 'bg-slate-800 text-cyan-400 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              1x1
            </button>
            <button
              type="button"
              onClick={() => setLayout('1x2')}
              title="Split View (1x2)"
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                layout === '1x2'
                  ? 'bg-slate-800 text-cyan-400 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              1x2
            </button>
            <button
              type="button"
              onClick={() => setLayout('2x2')}
              title="Quad View (2x2)"
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                layout === '2x2'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              2x2 Quad
            </button>
            <button
              type="button"
              onClick={() => setLayout('all')}
              title="Full Wall (All Feeds)"
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                layout === 'all'
                  ? 'bg-slate-800 text-cyan-400 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Feeds
            </button>
          </div>
        </div>
      </div>

      {/* Main Surveillance Workspace: Grid + Live Incident Ticker */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-4">
        {/* Left 3 cols: Multi-Feed Camera Wall */}
        <div className="xl:col-span-3 space-y-6">
          {loading && (
            <div className="flex h-96 flex-col items-center justify-center rounded-3xl border border-slate-800 bg-slate-900/60 text-slate-400">
              <RefreshCw className="mb-3 h-8 w-8 animate-spin text-cyan-400" />
              <p className="text-sm font-semibold">Connecting to surveillance camera grid...</p>
            </div>
          )}

          {!loading && visibleCameras.length === 0 && (
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-12 text-center text-slate-400">
              No cameras registered in this sector.
            </div>
          )}

          <div
            className={`grid gap-6 ${
              layout === '1x1'
                ? 'grid-cols-1'
                : layout === '1x2'
                ? 'grid-cols-1'
                : layout === '2x2'
                ? 'grid-cols-1 md:grid-cols-2'
                : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-2'
            }`}
          >
            {visibleCameras.map((camera) => (
              <VideoPanel
                key={camera.id}
                camera={camera}
                detections={detections.filter((d) => d.camera_id === camera.id)}
                onConfigureZone={(cam) => setSelectedCameraForZone(cam)}
              />
            ))}
          </div>
        </div>

        {/* Right 1 col: Live Incident Ticker & Sector Defense Status */}
        <div className="space-y-6">
          {/* Sector Threat Matrix Card */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Radio className="h-4 w-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">Sector Defense Matrix</h3>
              </div>
              <span className="font-mono text-[10px] text-slate-400">Auto Scan</span>
            </div>

            <div className="mt-4 space-y-3">
              {[
                { name: 'Sector 1 - North Perimeter', threat: 'Elevated', color: 'bg-rose-500', pct: 72 },
                { name: 'Sector 2 - Alpha Gate Entry', threat: 'Guarded', color: 'bg-amber-500', pct: 45 },
                { name: 'Sector 3 - Watchtower IR', threat: 'Monitoring', color: 'bg-cyan-400', pct: 28 },
                { name: 'Sector 5 - Drone Airspace', threat: 'Clear', color: 'bg-emerald-400', pct: 15 },
              ].map((sec, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-slate-300">{sec.name}</span>
                    <span className="font-mono text-[11px] text-slate-400">{sec.threat}</span>
                  </div>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                    <div
                      className={`h-full rounded-full ${sec.color}`}
                      style={{ width: `${sec.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Real-time Incident Alert Stream */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-rose-400" />
                <h3 className="text-sm font-bold text-white">Live Incident Stream</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 font-mono text-[10px] font-bold text-rose-400">
                  {alerts.filter((a) => a.status === 'active').length} Active
                </span>
                {onNavigate && (
                  <button
                    type="button"
                    onClick={() => onNavigate('alerts')}
                    className="text-xs font-semibold text-cyan-400 hover:text-cyan-300"
                  >
                    View All →
                  </button>
                )}
              </div>
            </div>

            <div className="mt-4 max-h-[520px] space-y-3 overflow-y-auto pr-1">
              {alerts.slice(0, 6).map((alert) => (
                <AlertCard
                  key={alert.id}
                  alert={alert}
                  onAcknowledge={handleAcknowledgeAlert}
                  onInvestigate={(a) => setInvestigatingAlert(a)}
                />
              ))}

              {alerts.length === 0 && (
                <div className="py-8 text-center text-xs text-slate-500">
                  No active incidents recorded.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Zone Editor Modal */}
      {selectedCameraForZone && (
        <ZoneEditor
          isOpen={Boolean(selectedCameraForZone)}
          cameraId={selectedCameraForZone.id}
          cameraName={selectedCameraForZone.name}
          onClose={() => setSelectedCameraForZone(null)}
          onSave={() => setSelectedCameraForZone(null)}
        />
      )}

      {/* Alert Investigation Modal */}
      {investigatingAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="w-[640px] max-w-full overflow-hidden rounded-3xl border border-slate-700 bg-slate-900 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-rose-400" />
                <h3 className="text-base font-bold text-white">Incident Investigation Report</h3>
              </div>
              <button
                type="button"
                onClick={() => setInvestigatingAlert(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              {investigatingAlert.snapshot_url && (
                <div className="relative mb-4 aspect-video w-full overflow-hidden rounded-2xl border border-slate-700 bg-slate-950">
                  <img
                    src={investigatingAlert.snapshot_url}
                    alt="Incident snapshot"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute left-3 top-3 rounded bg-black/80 px-2 py-0.5 font-mono text-[10px] text-white">
                    FORENSIC SNAPSHOT
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                  <span className="text-slate-500">Event Classification:</span>
                  <p className="mt-0.5 font-bold text-white">{investigatingAlert.type}</p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                  <span className="text-slate-500">Camera & Sector:</span>
                  <p className="mt-0.5 font-bold text-white">{investigatingAlert.camera_name}</p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                  <span className="text-slate-500">Target Track ID:</span>
                  <p className="mt-0.5 font-mono font-bold text-cyan-400">#{investigatingAlert.track_id || 'TRK-9821'}</p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                  <span className="text-slate-500">Detection Confidence:</span>
                  <p className="mt-0.5 font-mono font-bold text-emerald-400">
                    {investigatingAlert.confidence ? `${(investigatingAlert.confidence * 100).toFixed(1)}%` : '96.4%'}
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs">
                <span className="text-slate-500">Incident Narrative:</span>
                <p className="mt-1 text-slate-300">
                  {investigatingAlert.details || 'Target crossed restricted boundary without valid beacon authorization.'}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-800 bg-slate-950/60 px-6 py-4">
              <button
                type="button"
                onClick={() => setInvestigatingAlert(null)}
                className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white"
              >
                Close Report
              </button>
              {investigatingAlert.status === 'active' && (
                <button
                  type="button"
                  onClick={() => {
                    handleAcknowledgeAlert(investigatingAlert);
                    setInvestigatingAlert(null);
                  }}
                  className="rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400"
                >
                  Acknowledge & Dispatch
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}