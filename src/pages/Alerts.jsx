// src/pages/Alerts.jsx
import { useCallback, useEffect, useState } from 'react';
import {
  AlertTriangle,
  CheckCheck,
  Download,
  Filter,
  RefreshCw,
  Search,
  ShieldAlert,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import AlertCard from '../components/AlertCard';
import RiskBadge from '../components/RiskBadge';
import { acknowledgeAlert, getAlerts, resolveAlert } from '../services/api';
import useWebSocket from '../hooks/useWebSocket';
import { exportToCSV, formatDate } from '../utils/formatters';

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [risk, setRisk] = useState('all');
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [investigatingAlert, setInvestigatingAlert] = useState(null);
  const [operatorNote, setOperatorNote] = useState('');

  const { message } = useWebSocket();

  const loadAlerts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAlerts();
      setAlerts(data || []);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAlerts();
  }, [loadAlerts]);

  // Listen to live WebSocket alerts
  useEffect(() => {
    if (!message || (message.type !== 'alert' && !message.alert)) return;
    const incoming = message.alert || message;
    setAlerts((prev) => [incoming, ...prev.filter((item) => item.id !== incoming.id)]);
  }, [message]);

  const handleAcknowledge = async (alert) => {
    await acknowledgeAlert(alert.id);
    setAlerts((prev) =>
      prev.map((a) => (a.id === alert.id ? { ...a, status: 'acknowledged' } : a))
    );
    if (investigatingAlert?.id === alert.id) {
      setInvestigatingAlert((prev) => ({ ...prev, status: 'acknowledged' }));
    }
  };

  const handleResolve = async (alert) => {
    await resolveAlert(alert.id);
    setAlerts((prev) =>
      prev.map((a) => (a.id === alert.id ? { ...a, status: 'resolved' } : a))
    );
    if (investigatingAlert?.id === alert.id) {
      setInvestigatingAlert((prev) => ({ ...prev, status: 'resolved' }));
    }
  };

  const handleAcknowledgeAll = async () => {
    const unread = alerts.filter((a) => a.status === 'active' || !a.status);
    for (const a of unread) {
      await acknowledgeAlert(a.id);
    }
    setAlerts((prev) => prev.map((a) => ({ ...a, status: 'acknowledged' })));
  };

  const handleExport = () => {
    exportToCSV(alerts, `ibvap_alerts_${Date.now()}.csv`);
  };

  const visibleAlerts = alerts.filter((alert) => {
    const alertRisk = alert.risk_level || alert.risk || 'unknown';
    const matchesRisk = risk === 'all' || alertRisk === risk;
    const alertStatus = alert.status || 'active';
    const matchesStatus = status === 'all' || alertStatus === status;
    const matchesSearch =
      !search.trim() ||
      alert.type?.toLowerCase().includes(search.toLowerCase()) ||
      alert.camera_name?.toLowerCase().includes(search.toLowerCase()) ||
      alert.track_id?.toLowerCase().includes(search.toLowerCase());
    return matchesRisk && matchesStatus && matchesSearch;
  });

  const activeCount = alerts.filter((a) => a.status === 'active' || !a.status).length;
  const criticalCount = alerts.filter(
    (a) => (a.risk_level || a.risk) === 'critical' || (a.risk_level || a.risk) === 'high'
  ).length;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header Banner */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">Security Alert Queue</h1>
            <span className="rounded-full border border-rose-500/30 bg-rose-500/15 px-2.5 py-0.5 text-xs font-bold text-rose-400">
              {activeCount} Active / {alerts.length} Total
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400 sm:text-sm">
            Triage, acknowledge, and escalate automated AI intrusion detections
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-300 transition hover:bg-slate-700 hover:text-white"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
          <button
            type="button"
            onClick={handleAcknowledgeAll}
            disabled={activeCount === 0}
            className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/15 px-4 py-2 text-xs font-bold text-emerald-400 transition hover:bg-emerald-500/25 disabled:opacity-40"
          >
            <CheckCheck className="h-4 w-4" />
            Acknowledge All ({activeCount})
          </button>
        </div>
      </div>

      {/* Quick Summary Strip */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Active Incidents
          </span>
          <p className="mt-1 font-telemetry text-2xl font-bold text-rose-400">{activeCount}</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Critical / High Priority
          </span>
          <p className="mt-1 font-telemetry text-2xl font-bold text-orange-400">{criticalCount}</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Acknowledged
          </span>
          <p className="mt-1 font-telemetry text-2xl font-bold text-amber-400">
            {alerts.filter((a) => a.status === 'acknowledged').length}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Resolved Today
          </span>
          <p className="mt-1 font-telemetry text-2xl font-bold text-emerald-400">
            {alerts.filter((a) => a.status === 'resolved').length}
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-md">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Box */}
          <div className="relative w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search type, camera, track..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          {/* Risk Filter */}
          <select
            value={risk}
            onChange={(e) => setRisk(e.target.value)}
            className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
          >
            <option value="all">All Risk Levels</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {/* Status Filter */}
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active (Pending)</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        <button
          type="button"
          onClick={loadAlerts}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-semibold text-slate-400 hover:text-white"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-300">
          {error}
        </div>
      )}

      {/* Alerts Grid */}
      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-3xl border border-slate-800 bg-slate-900/40 text-slate-500">
          Loading alerts queue...
        </div>
      ) : (
        <div className="space-y-3">
          {visibleAlerts.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              onAcknowledge={handleAcknowledge}
              onInvestigate={(a) => setInvestigatingAlert(a)}
            />
          ))}

          {!visibleAlerts.length && (
            <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-12 text-center text-slate-500">
              <ShieldAlert className="mx-auto mb-3 h-8 w-8 text-slate-600" />
              <p className="text-sm font-semibold">No alerts found.</p>
              <p className="mt-1 text-xs">All monitored border sectors are currently clear.</p>
            </div>
          )}
        </div>
      )}

      {/* Investigation Modal */}
      {investigatingAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="w-[660px] max-w-full overflow-hidden rounded-3xl border border-slate-700 bg-slate-900 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-400" />
                <h3 className="text-base font-bold text-white">Security Incident Dossier</h3>
              </div>
              <button
                type="button"
                onClick={() => setInvestigatingAlert(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              {investigatingAlert.snapshot_url && (
                <div className="relative mb-4 aspect-video w-full overflow-hidden rounded-2xl border border-slate-700 bg-slate-950">
                  <img
                    src={investigatingAlert.snapshot_url}
                    alt="Incident frame"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute bottom-3 left-3 rounded-lg bg-black/80 px-2.5 py-1 font-mono text-[10px] text-white backdrop-blur-xs">
                    CAPTURED AT {formatDate(investigatingAlert.timestamp)}
                  </div>
                  <div className="absolute right-3 top-3">
                    <RiskBadge level={investigatingAlert.risk_level || 'high'} size="md" />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                  <span className="text-slate-500">Incident Type:</span>
                  <p className="mt-0.5 font-bold text-white">{investigatingAlert.type}</p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                  <span className="text-slate-500">Surveillance Camera:</span>
                  <p className="mt-0.5 font-bold text-white">{investigatingAlert.camera_name}</p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                  <span className="text-slate-500">Target Track ID:</span>
                  <p className="mt-0.5 font-mono font-bold text-cyan-400">
                    #{investigatingAlert.track_id || 'TRK-9821'}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                  <span className="text-slate-500">Status:</span>
                  <p className="mt-0.5 font-bold uppercase text-amber-400">
                    {investigatingAlert.status || 'Active'}
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs">
                <span className="text-slate-500">Incident Narrative:</span>
                <p className="mt-1 text-slate-300">{investigatingAlert.details}</p>
              </div>

              {/* Operator Notes Input */}
              <div className="mt-4">
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Command Officer Audit Log Notes
                </label>
                <textarea
                  rows="2"
                  placeholder="Record tactical dispatch actions, unit deployed, or false alarm rationale..."
                  value={operatorNote}
                  onChange={(e) => setOperatorNote(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 bg-slate-950/60 px-6 py-4">
              <button
                type="button"
                onClick={() => setInvestigatingAlert(null)}
                className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                {investigatingAlert.status !== 'resolved' && (
                  <button
                    type="button"
                    onClick={() => handleResolve(investigatingAlert)}
                    className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-emerald-400 hover:bg-slate-700"
                  >
                    Mark as Resolved
                  </button>
                )}
                {investigatingAlert.status === 'active' && (
                  <button
                    type="button"
                    onClick={() => handleAcknowledge(investigatingAlert)}
                    className="rounded-xl bg-cyan-500 px-5 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-400"
                  >
                    Acknowledge Alert
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

