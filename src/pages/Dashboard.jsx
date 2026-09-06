import { useEffect, useState } from 'react';
import VideoPanel from '../components/VideoPanel';
import { Activity, AlertTriangle, Users, Car, Video } from 'lucide-react';
import { getCameras, getStatistics } from '../services/api';
import useWebSocket from '../hooks/useWebSocket';

const EMPTY_STATS = { activeCameras: 0, peopleDetected: 0, vehiclesDetected: 0, activeAlerts: 0, highRiskEvents: 0 };
const mapStats = (stats = {}) => ({
  activeCameras: stats.active_cameras ?? stats.activeCameras ?? 0,
  peopleDetected: stats.people_detected ?? stats.peopleDetected ?? 0,
  vehiclesDetected: stats.vehicles_detected ?? stats.vehiclesDetected ?? 0,
  activeAlerts: stats.active_alerts ?? stats.activeAlerts ?? 0,
  highRiskEvents: stats.high_risk_events ?? stats.highRiskEvents ?? 0,
});

const mapCamera = (camera) => ({
  ...camera,
  originalStream: camera.stream_url || camera.original_stream || camera.originalStream,
  aiStream: camera.ai_stream_url || camera.ai_stream || camera.aiStream || camera.stream_url,
});

export default function Dashboard() {
  const [cameras, setCameras] = useState([]);
  const [stats, setStats] = useState(EMPTY_STATS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [detections, setDetections] = useState([]);
  const { message, connected } = useWebSocket();

  const loadDashboard = async () => {
    await Promise.resolve();
    setLoading(true);
    setError(null);
    try {
      const [cameraData, statistics] = await Promise.all([getCameras(), getStatistics()]);
      setCameras((cameraData || []).map(mapCamera));
      setStats(mapStats(statistics));
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(loadDashboard, 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!message) return;
    const incoming = message.detection || message;
    queueMicrotask(() => {
      if (incoming.type === 'statistics' || incoming.stats) setStats(mapStats(incoming.stats || incoming));
      if (incoming.type === 'detection' || incoming.track_id || incoming.bbox) {
        setDetections((current) => [...current.filter((item) => item.track_id !== incoming.track_id), incoming].slice(-100));
      }
    });
  }, [message]);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">IBVAP Dashboard</h1>
          <p className="text-gray-500">Intelligent Border & Video Analytics Platform</p>
        </div>
        <div className="flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded">
          <Activity className="w-5 h-5" />
          {connected ? 'System Online' : 'Reconnecting...'}
        </div>
      </div>

      {error && (
        <div className="mb-6 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          <span>{error}</span>
          <button onClick={loadDashboard} className="rounded border border-red-300 px-3 py-1">Retry</button>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-2 lg:grid-cols-5">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded">
              <Video className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{loading ? '...' : stats.activeCameras}</div>
              <div className="text-sm text-gray-500">Active Cameras</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{loading ? '...' : stats.peopleDetected}</div>
              <div className="text-sm text-gray-500">People Detected</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded">
              <Car className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{loading ? '...' : stats.vehiclesDetected}</div>
              <div className="text-sm text-gray-500">Vehicles Detected</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-100 rounded">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{loading ? '...' : stats.activeAlerts}</div>
              <div className="text-sm text-gray-500">Active Alerts</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 rounded">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{loading ? '...' : stats.highRiskEvents}</div>
              <div className="text-sm text-gray-500">High Risk Events</div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Surveillance */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4">Live Surveillance</h2>
        <div className="space-y-6">
          {loading && <div className="rounded-lg bg-white p-8 text-center text-gray-500">Loading cameras...</div>}
          {!loading && cameras.length === 0 && <div className="rounded-lg bg-white p-8 text-center text-gray-500">No cameras available.</div>}
          {cameras.map((camera) => (
            <VideoPanel key={camera.id} camera={camera} detections={detections.filter((item) => item.camera_id === camera.id)} />
          ))}
        </div>
      </div>
    </div>
  );
}