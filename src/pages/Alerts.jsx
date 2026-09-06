import { useCallback, useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { getAlerts } from '../services/api';
import useWebSocket from '../hooks/useWebSocket';

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [risk, setRisk] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { message } = useWebSocket();

  const loadAlerts = useCallback(async () => {
    setLoading(true); setError(null);
    try { setAlerts((await getAlerts()) || []); } catch (loadError) { setError(loadError.message); } finally { setLoading(false); }
  }, []);

  useEffect(() => { const timer = setTimeout(loadAlerts, 0); return () => clearTimeout(timer); }, [loadAlerts]);
  useEffect(() => {
    if (!message || (!message.alert && message.type !== 'alert')) return;
    const alert = message.alert || message;
    queueMicrotask(() => setAlerts((current) => [alert, ...current.filter((item) => item.id !== alert.id)]));
  }, [message]);

  const visibleAlerts = alerts.filter((alert) => risk === 'all' || alert.risk_level === risk || alert.risk === risk);
  return <div className="p-6"><div className="mb-6 flex items-center justify-between"><div><h1 className="text-2xl font-bold">Alerts</h1><p className="text-gray-500">Live security alerts from all cameras</p></div><select value={risk} onChange={(event) => setRisk(event.target.value)} className="rounded border px-3 py-2"><option value="all">All risk levels</option><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></select></div>
    {error && <div className="mb-4 rounded border border-red-200 bg-red-50 p-4 text-red-700">{error} <button onClick={loadAlerts} className="ml-3 underline">Retry</button></div>}
    {loading ? <div className="rounded bg-white p-8 text-center text-gray-500">Loading alerts...</div> : <div className="space-y-3">{visibleAlerts.map((alert) => <article key={alert.id} className="flex items-center gap-4 rounded-lg bg-white p-4 shadow"><AlertTriangle className="h-5 w-5 text-orange-500" /><div className="flex-1"><h2 className="font-semibold">{alert.type || 'Alert'}</h2><p className="text-sm text-gray-500">{alert.camera_name || 'Unknown camera'} · Track {alert.track_id || 'N/A'}</p></div><span className="rounded px-2 py-1 text-xs font-semibold uppercase">{alert.risk_level || alert.risk || 'unknown'}</span><time className="text-sm text-gray-500">{alert.timestamp ? new Date(alert.timestamp).toLocaleString() : '-'}</time></article>)}{!visibleAlerts.length && <div className="rounded bg-white p-8 text-center text-gray-500">No alerts found.</div>}</div>}
  </div>;
}// TODO: Implement the active alerts list.
