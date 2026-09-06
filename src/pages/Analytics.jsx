// src/pages/Analytics.jsx
import { useCallback, useEffect, useState } from 'react';
import EvidenceCard from '../components/EvidenceCard';
import StatCard from '../components/StatCard';
import RiskBadge from '../components/RiskBadge';
import {
  Activity,
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  FileSpreadsheet,
  Layers,
  PieChart,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  X,
  Zap,
} from 'lucide-react';
import { getEvidence, getStatistics } from '../services/api';
import { exportToCSV, formatDate } from '../utils/formatters';

export default function Analytics() {
  const [stats, setStats] = useState(null);
  const [evidence, setEvidence] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('24h');
  const [hoveredHour, setHoveredHour] = useState(null);
  const [previewEvidence, setPreviewEvidence] = useState(null);
  const [evidenceFilter, setEvidenceFilter] = useState('all');

  const loadAnalyticsData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statistics, evidenceData] = await Promise.all([getStatistics(), getEvidence()]);
      setStats(statistics);
      setEvidence(Array.isArray(evidenceData) ? evidenceData : evidenceData?.items || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAnalyticsData();
  }, [loadAnalyticsData]);

  // Hourly detection data for the 24-hour SVG Area Chart
  const hourlyData = [
    { hour: '00:00', detections: 18, threats: 2 },
    { hour: '02:00', detections: 12, threats: 1 },
    { hour: '04:00', detections: 15, threats: 3 },
    { hour: '06:00', detections: 42, threats: 4 },
    { hour: '08:00', detections: 86, threats: 6 },
    { hour: '10:00', detections: 110, threats: 8 },
    { hour: '12:00', detections: 95, threats: 5 },
    { hour: '14:00', detections: 104, threats: 7 },
    { hour: '16:00', detections: 88, threats: 4 },
    { hour: '18:00', detections: 76, threats: 5 },
    { hour: '20:00', detections: 64, threats: 8 },
    { hour: '22:00', detections: 38, threats: 3 },
  ];

  // Threat category breakdown
  const threatCategories = [
    { name: 'Perimeter Fence Breach', count: 48, pct: 36, color: 'bg-rose-500', barColor: '#f43f5e' },
    { name: 'Buffer Zone Loitering', count: 34, pct: 25, color: 'bg-amber-500', barColor: '#f59e0b' },
    { name: 'Unauthorized Vehicle Vector', count: 28, pct: 21, color: 'bg-sky-400', barColor: '#38bdf8' },
    { name: 'Low Altitude Drone Intrusion', count: 14, pct: 11, color: 'bg-purple-500', barColor: '#a855f7' },
    { name: 'Thermal Wildlife Anomaly', count: 9, pct: 7, color: 'bg-emerald-500', barColor: '#10b981' },
  ];

  // SVG dimensions for trend chart
  const maxDetection = Math.max(...hourlyData.map((d) => d.detections), 120);
  const chartWidth = 680;
  const chartHeight = 180;
  const padding = 30;

  const getPoints = () => {
    const stepX = (chartWidth - padding * 2) / (hourlyData.length - 1);
    return hourlyData.map((d, i) => {
      const x = padding + i * stepX;
      const y = chartHeight - padding - (d.detections / maxDetection) * (chartHeight - padding * 2);
      return { x, y, ...d };
    });
  };

  const points = getPoints();
  const pathD = points.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '');
  const areaD = `${pathD} L ${points[points.length - 1].x} ${chartHeight - padding} L ${points[0].x} ${chartHeight - padding} Z`;

  // Filter evidence
  const filteredEvidence = evidence.filter((ev) => {
    if (evidenceFilter === 'all') return true;
    return (
      ev.event_type?.toLowerCase().includes(evidenceFilter.toLowerCase()) ||
      ev.object_type?.toLowerCase().includes(evidenceFilter.toLowerCase())
    );
  });

  const handleExportAnalytics = () => {
    exportToCSV(hourlyData, `ibvap_analytics_trend_${Date.now()}.csv`);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header Bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">AI Analytics & Forensic Intelligence</h1>
            <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-0.5 text-xs font-bold text-cyan-400">
              YOLOv11 Inference Engine
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400 sm:text-sm">
            Temporal intrusion patterns &bull; Neural verification telemetry &bull; Evidence vault
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex rounded-xl border border-slate-800 bg-slate-950 p-1">
            {['24h', '7d', '30d'].map((r) => (
              <button
                type="button"
                key={r}
                onClick={() => setTimeRange(r)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  timeRange === r
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {r.toUpperCase()}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleExportAnalytics}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-300 transition hover:bg-slate-700 hover:text-white"
          >
            <Download className="h-4 w-4" />
            Export Data
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-300">
          {error}
        </div>
      )}

      {/* KPI Metrics */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Detections (24h)"
          value="1,492"
          icon={Activity}
          tone="cyan"
          trend={14}
          subtitle="Processed over 6 video streams"
        />
        <StatCard
          label="AI Inference Accuracy"
          value="99.2%"
          icon={Sparkles}
          tone="emerald"
          trend={0.8}
          subtitle="TensorRT FP16 verified"
        />
        <StatCard
          label="Mean Alert Response"
          value="1.4s"
          icon={Clock}
          tone="blue"
          trend={-15}
          subtitle="Trigger to dispatch alert"
        />
        <StatCard
          label="False Positive Rate"
          value="0.42%"
          icon={ShieldCheck}
          tone="purple"
          trend={-22}
          subtitle="Dual thermal/optical confirmation"
        />
      </div>

      {/* Main Visual Intelligence Section */}
      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 2 Cols: 24h Intrusion Trend SVG Chart */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl backdrop-blur-md lg:col-span-2">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-sm font-bold text-white">24-Hour Intrusion & Activity Volume</h3>
              <p className="text-xs text-slate-400">
                Temporal distribution of detected entities and border incidents
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 font-mono text-cyan-400">
                <span className="h-2 w-2 rounded-full bg-cyan-400" />
                Detections Volume
              </span>
              <span className="flex items-center gap-1.5 font-mono text-rose-400">
                <span className="h-2 w-2 rounded-full bg-rose-500" />
                Incident Triggers
              </span>
            </div>
          </div>

          {/* Responsive SVG Area Chart */}
          <div className="relative w-full overflow-hidden">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full overflow-visible"
            >
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Gridlines */}
              {[0.25, 0.5, 0.75].map((factor, idx) => {
                const y = chartHeight - padding - factor * (chartHeight - padding * 2);
                return (
                  <line
                    key={idx}
                    x1={padding}
                    y1={y}
                    x2={chartWidth - padding}
                    y2={y}
                    stroke="rgba(255, 255, 255, 0.08)"
                    strokeDasharray="4 4"
                  />
                );
              })}

              {/* Gradient Filled Area */}
              <path d={areaD} fill="url(#areaGradient)" />

              {/* Main Line */}
              <path
                d={pathD}
                fill="none"
                stroke="#06b6d4"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Interactive Data Points */}
              {points.map((p, idx) => (
                <g key={idx} className="cursor-pointer">
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={hoveredHour?.hour === p.hour ? 6 : 4}
                    fill="#030712"
                    stroke="#06b6d4"
                    strokeWidth="2"
                    onMouseEnter={() => setHoveredHour(p)}
                    onMouseLeave={() => setHoveredHour(null)}
                  />
                  {/* Hour labels */}
                  <text
                    x={p.x}
                    y={chartHeight - 8}
                    textAnchor="middle"
                    fill="#64748b"
                    fontSize="10"
                    fontFamily="JetBrains Mono, monospace"
                  >
                    {p.hour}
                  </text>
                </g>
              ))}
            </svg>

            {/* Hover Tooltip HUD */}
            {hoveredHour && (
              <div
                className="pointer-events-none absolute -top-2 rounded-xl border border-cyan-500/40 bg-slate-950/90 px-3 py-1.5 font-mono text-xs text-white shadow-xl backdrop-blur-md"
                style={{
                  left: `${(hoveredHour.x / chartWidth) * 100}%`,
                  transform: 'translateX(-50%)',
                }}
              >
                <div className="font-bold text-cyan-400">{hoveredHour.hour} UTC</div>
                <div>Volume: {hoveredHour.detections} entities</div>
                <div className="text-rose-400">Threats: {hoveredHour.threats} incidents</div>
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Threat Classification Breakdown */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl backdrop-blur-md">
          <div className="mb-4 border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white">Threat Classification Distribution</h3>
            <p className="text-xs text-slate-400">Incident triggers by tactical category</p>
          </div>

          <div className="space-y-4">
            {threatCategories.map((item, idx) => (
              <div key={idx}>
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-slate-300">{item.name}</span>
                  <span className="font-mono text-slate-400">
                    {item.count} ({item.pct}%)
                  </span>
                </div>
                <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-800">
                  <div
                    className={`h-full rounded-full ${item.color}`}
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-3.5 text-xs text-slate-300">
            <div className="flex items-center gap-2 font-semibold text-cyan-300">
              <Zap className="h-4 w-4" />
              <span>AI Insight Recommendation</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400 leading-relaxed">
              Perimeter fence intrusion vectors spike between 20:00 and 02:00 UTC. Recommended to deploy automated PTZ patrol sweeps on Sector 1 and 3.
            </p>
          </div>
        </div>
      </div>

      {/* Forensic Evidence Vault Gallery */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl backdrop-blur-md">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white">Forensic Snapshot Vault</h2>
            <p className="text-xs text-slate-400">
              Captured image evidence tagged with DeepSORT tracking IDs and confidence metrics
            </p>
          </div>

          {/* Evidence Category Filter */}
          <div className="flex flex-wrap items-center gap-2">
            {['all', 'perimeter', 'vehicle', 'drone'].map((f) => (
              <button
                type="button"
                key={f}
                onClick={() => setEvidenceFilter(f)}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition ${
                  evidenceFilter === f
                    ? 'border border-cyan-500/40 bg-cyan-500/20 text-cyan-300'
                    : 'border border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex h-48 items-center justify-center text-slate-500">
            Loading evidence files...
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredEvidence.map((item) => (
              <EvidenceCard
                key={item.id}
                evidence={item}
                onPreview={(ev) => setPreviewEvidence(ev)}
              />
            ))}
            {!filteredEvidence.length && (
              <div className="col-span-full py-12 text-center text-xs text-slate-500">
                No forensic evidence matching this filter.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Evidence Lightbox Modal */}
      {previewEvidence && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
          <div className="w-[720px] max-w-full overflow-hidden rounded-3xl border border-slate-700 bg-slate-900 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
              <div className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">Forensic Evidence Lightbox</h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewEvidence(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-slate-700 bg-slate-950">
                <img
                  src={previewEvidence.snapshot_url}
                  alt="Forensic capture"
                  className="h-full w-full object-cover"
                />
                <div className="absolute right-3 top-3">
                  <RiskBadge level={previewEvidence.risk || 'high'} size="md" />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                  <span className="text-slate-500">Event Classification:</span>
                  <p className="mt-0.5 font-bold text-white">{previewEvidence.event_type}</p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                  <span className="text-slate-500">Camera Source:</span>
                  <p className="mt-0.5 font-bold text-white">
                    {previewEvidence.camera_name || `Camera ${previewEvidence.camera_id}`}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                  <span className="text-slate-500">Track ID:</span>
                  <p className="mt-0.5 font-mono font-bold text-cyan-400">
                    #{previewEvidence.track_id || 'TRK-9821'}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                  <span className="text-slate-500">Confidence Metric:</span>
                  <p className="mt-0.5 font-mono font-bold text-emerald-400">
                    {previewEvidence.confidence ? `${(previewEvidence.confidence * 100).toFixed(1)}%` : '98.2%'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-800 bg-slate-950/60 px-6 py-4">
              <button
                type="button"
                onClick={() => setPreviewEvidence(null)}
                className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white"
              >
                Close Viewer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

