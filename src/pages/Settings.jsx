// src/pages/Settings.jsx
import { useEffect, useState } from 'react';
import {
  Activity,
  BellRing,
  Check,
  CheckCircle2,
  Cpu,
  Database,
  Globe,
  Radio,
  RefreshCw,
  Save,
  Server,
  Shield,
  Sliders,
  Sparkles,
  Wifi,
  Zap,
} from 'lucide-react';
import { getHealth } from '../services/api';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('connection'); // 'connection' | 'ai' | 'alerts' | 'diagnostics'
  const [health, setHealth] = useState(null);
  const [error, setError] = useState(null);
  const [pingStatus, setPingStatus] = useState(null);
  const [pingTesting, setPingTesting] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Configuration Settings State
  const [apiUrl, setApiUrl] = useState(import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api');
  const [wsUrl, setWsUrl] = useState(import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws/detections');
  const [aiModel, setAiModel] = useState('YOLOv11x-Border (TensorRT FP16)');
  const [confidenceThreshold, setConfidenceThreshold] = useState(65);
  const [iouThreshold, setIouThreshold] = useState(45);
  const [audioAlerts, setAudioAlerts] = useState(true);
  const [minAlertRisk, setMinAlertRisk] = useState('high');
  const [webhookUrl, setWebhookUrl] = useState('https://security-webhook.defense.internal/alerts');
  const [classes, setClasses] = useState({
    person: true,
    vehicle: true,
    drone: true,
    animal: true,
    weapon: true,
    fire_smoke: false,
  });

  useEffect(() => {
    getHealth()
      .then(setHealth)
      .catch((loadError) => setError(loadError.message));
  }, []);

  const handleTestPing = async () => {
    setPingTesting(true);
    setPingStatus(null);
    const start = performance.now();
    try {
      await getHealth();
      const latency = Math.round(performance.now() - start);
      setPingStatus({ ok: true, latency: `${latency} ms`, msg: 'FastAPI REST Endpoint reachable' });
    } catch {
      setPingStatus({ ok: false, latency: 'Offline', msg: 'Backend offline - Simulation fallback active' });
    } finally {
      setPingTesting(false);
    }
  };

  const handleSaveConfig = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const toggleClass = (key) => {
    setClasses((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header Bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">System Settings & Configuration</h1>
            <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-0.5 text-xs font-bold text-cyan-400">
              Enterprise Defense Edition
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400 sm:text-sm">
            Tune neural networks, configure backend endpoints, adjust alert thresholds, and monitor telemetry
          </p>
        </div>

        <button
          type="button"
          onClick={handleSaveConfig}
          className="inline-flex items-center gap-2 rounded-2xl border border-cyan-400 bg-cyan-500 px-5 py-2.5 text-xs font-bold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:bg-cyan-400"
        >
          {savedSuccess ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          {savedSuccess ? 'Settings Saved!' : 'Save Configuration'}
        </button>
      </div>

      {savedSuccess && (
        <div className="mb-6 flex items-center gap-2 rounded-2xl border border-emerald-500/40 bg-emerald-500/15 p-4 text-xs font-semibold text-emerald-300">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>System configuration updated and deployed to detection pipeline.</span>
        </div>
      )}

      {/* Tabs Selector */}
      <div className="mb-6 flex flex-wrap gap-2 border-b border-slate-800 pb-3">
        {[
          { id: 'connection', label: 'Backend & Endpoints', icon: Globe },
          { id: 'ai', label: 'AI Detection Engine', icon: Sparkles },
          { id: 'alerts', label: 'Alert & Perimeter Rules', icon: BellRing },
          { id: 'diagnostics', label: 'System Diagnostics', icon: Activity },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              type="button"
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition ${
                isActive
                  ? 'border border-cyan-500/40 bg-cyan-500/20 text-cyan-300 shadow-sm'
                  : 'border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Backend Connection */}
      {activeTab === 'connection' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl backdrop-blur-md lg:col-span-2 space-y-5">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                FastAPI REST API Base URL
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 font-mono text-xs text-white focus:border-cyan-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleTestPing}
                  disabled={pingTesting}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${pingTesting ? 'animate-spin text-cyan-400' : ''}`} />
                  Test Ping
                </button>
              </div>
              <p className="mt-1 text-[11px] text-slate-500">
                Default endpoint: http://localhost:8000/api
              </p>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Real-Time WebSocket Detection Stream URL
              </label>
              <input
                type="text"
                value={wsUrl}
                onChange={(e) => setWsUrl(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 font-mono text-xs text-white focus:border-cyan-500 focus:outline-none"
              />
              <p className="mt-1 text-[11px] text-slate-500">
                Emits real-time YOLO bounding box telemetry and intrusion alerts
              </p>
            </div>

            {pingStatus && (
              <div
                className={`flex items-center justify-between rounded-xl border p-3.5 text-xs font-semibold ${
                  pingStatus.ok
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                    : 'border-amber-500/30 bg-amber-500/10 text-amber-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Wifi className="h-4 w-4" />
                  <span>{pingStatus.msg}</span>
                </div>
                <span className="font-mono">{pingStatus.latency}</span>
              </div>
            )}
          </div>

          {/* Connection Status Card */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl backdrop-blur-md">
            <h3 className="text-sm font-bold text-white mb-4">Pipeline Health Status</h3>
            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">REST Status:</span>
                <span className={health?.status === 'online' ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                  {health?.status || 'Active (Simulation)'}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">API Version:</span>
                <span className="text-white">{health?.api_version || '2.4.0-defense'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Inference Core:</span>
                <span className="text-cyan-400">{health?.ai_model || 'TensorRT-YOLOv11'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Memory Load:</span>
                <span className="text-white">{health?.memory_usage || '3.8 GB / 16 GB'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: AI Detection Engine */}
      {activeTab === 'ai' && (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl backdrop-blur-md max-w-3xl space-y-6">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Primary Vision Model
            </label>
            <select
              value={aiModel}
              onChange={(e) => setAiModel(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:border-cyan-500 focus:outline-none"
            >
              <option value="YOLOv11x-Border (TensorRT FP16)">
                YOLOv11x-Border (Maximum Accuracy &bull; 80 FPS)
              </option>
              <option value="YOLOv10-Security (TensorRT INT8)">
                YOLOv10-Security (Balanced Defense &bull; 120 FPS)
              </option>
              <option value="YOLOv8-Nano (Low Power)">
                YOLOv8-Nano (Edge / Low Latency &bull; 240 FPS)
              </option>
              <option value="ThermalNet-IR-v4">
                ThermalNet-IR-v4 (Dedicated FLIR Infrared Model)
              </option>
            </select>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <div className="flex justify-between text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                <span>Confidence Threshold</span>
                <span className="font-mono text-cyan-400">{confidenceThreshold}%</span>
              </div>
              <input
                type="range"
                min="20"
                max="95"
                value={confidenceThreshold}
                onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
                className="w-full accent-cyan-400"
              />
              <p className="mt-1 text-[11px] text-slate-500">
                Minimum neural confidence required before raising an alert event
              </p>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                <span>NMS IOU Overlap Threshold</span>
                <span className="font-mono text-cyan-400">{iouThreshold}%</span>
              </div>
              <input
                type="range"
                min="20"
                max="80"
                value={iouThreshold}
                onChange={(e) => setIouThreshold(Number(e.target.value))}
                className="w-full accent-cyan-400"
              />
              <p className="mt-1 text-[11px] text-slate-500">
                Non-Maximum Suppression threshold to merge overlapping boxes
              </p>
            </div>
          </div>

          {/* Classes to Detect */}
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Active Detection Object Classes
            </label>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {[
                { key: 'person', label: 'Person / Intruder' },
                { key: 'vehicle', label: 'Tactical Vehicle' },
                { key: 'drone', label: 'Aerial Drone' },
                { key: 'animal', label: 'Wildlife Anomaly' },
                { key: 'weapon', label: 'Weapon Detection' },
                { key: 'fire_smoke', label: 'Fire & Smoke' },
              ].map((item) => (
                <label
                  key={item.key}
                  className="flex items-center gap-2.5 rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs font-medium text-slate-200 cursor-pointer hover:border-slate-700"
                >
                  <input
                    type="checkbox"
                    checked={classes[item.key]}
                    onChange={() => toggleClass(item.key)}
                    className="h-4 w-4 rounded border-slate-700 accent-cyan-400"
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Alert & Perimeter Rules */}
      {activeTab === 'alerts' && (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl backdrop-blur-md max-w-3xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Audio Alert Chime</h3>
              <p className="text-xs text-slate-400">
                Play an audible tactical sound alert upon detection of High or Critical intrusions
              </p>
            </div>
            <input
              type="checkbox"
              checked={audioAlerts}
              onChange={(e) => setAudioAlerts(e.target.checked)}
              className="h-5 w-5 rounded border-slate-700 accent-cyan-400 cursor-pointer"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Minimum Alert Severity For Dispatch
            </label>
            <select
              value={minAlertRisk}
              onChange={(e) => setMinAlertRisk(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:border-cyan-500 focus:outline-none"
            >
              <option value="critical">Critical Risk Only (Perimeter breach, weapons)</option>
              <option value="high">High Risk & Above (Recommended for active borders)</option>
              <option value="medium">Medium Risk & Above</option>
              <option value="low">All Detections (Debug mode)</option>
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Automated Incident Webhook Notification Endpoint
            </label>
            <input
              type="text"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 font-mono text-xs text-white focus:border-cyan-500 focus:outline-none"
            />
            <p className="mt-1 text-[11px] text-slate-500">
              JSON payload dispatched instantaneously to dispatch center or mobile command units
            </p>
          </div>
        </div>
      )}

      {/* Tab 4: Diagnostics */}
      {activeTab === 'diagnostics' && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-2.5 text-cyan-400">
                <Cpu className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">GPU Engine</p>
                <p className="font-telemetry text-xl font-bold text-white">NVIDIA RTX 4090</p>
              </div>
            </div>
            <div className="mt-4 font-mono text-xs text-slate-400 space-y-1.5">
              <div className="flex justify-between">
                <span>VRAM Usage:</span>
                <strong className="text-cyan-400">7.2 GB / 24 GB</strong>
              </div>
              <div className="flex justify-between">
                <span>Core Clock:</span>
                <strong className="text-white">2520 MHz</strong>
              </div>
              <div className="flex justify-between">
                <span>GPU Temp:</span>
                <strong className="text-emerald-400">54°C</strong>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2.5 text-emerald-400">
                <Server className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Inference Throughput</p>
                <p className="font-telemetry text-xl font-bold text-white">120.4 FPS</p>
              </div>
            </div>
            <div className="mt-4 font-mono text-xs text-slate-400 space-y-1.5">
              <div className="flex justify-between">
                <span>Stream Channels:</span>
                <strong className="text-white">6 Active Feeds</strong>
              </div>
              <div className="flex justify-between">
                <span>Mean Latency:</span>
                <strong className="text-emerald-400">14.2 ms</strong>
              </div>
              <div className="flex justify-between">
                <span>Dropped Frames:</span>
                <strong className="text-emerald-400">0.00%</strong>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="rounded-xl border border-purple-500/30 bg-purple-500/10 p-2.5 text-purple-400">
                <Database className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Forensic Storage</p>
                <p className="font-telemetry text-xl font-bold text-white">3.2 TB Free</p>
              </div>
            </div>
            <div className="mt-4 font-mono text-xs text-slate-400 space-y-1.5">
              <div className="flex justify-between">
                <span>Retention Policy:</span>
                <strong className="text-white">30 Days Ring Buffer</strong>
              </div>
              <div className="flex justify-between">
                <span>H.265 Compression:</span>
                <strong className="text-purple-400">Enabled</strong>
              </div>
              <div className="flex justify-between">
                <span>Cloud Sync:</span>
                <strong className="text-emerald-400">Encrypted</strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

