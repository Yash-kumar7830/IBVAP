// src/pages/Cameras.jsx
import { useCallback, useEffect, useState } from 'react';
import VideoPanel from '../components/VideoPanel';
import ZoneEditor from '../components/ZoneEditor';
import {
  Camera,
  CheckCircle2,
  Compass,
  Filter,
  Layers,
  Plus,
  Radio,
  Search,
  Sliders,
  Table as TableIcon,
  Tv,
  Wifi,
  X,
} from 'lucide-react';
import { createCamera, getCameras } from '../services/api';
import useWebSocket from '../hooks/useWebSocket';

export default function Cameras() {
  const [cameras, setCameras] = useState([]);
  const [selectedCameraForZone, setSelectedCameraForZone] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [searchQuery, setSearchQuery] = useState('');
  const [sectorFilter, setSectorFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Camera Form State
  const [newCam, setNewCam] = useState({
    name: '',
    location: '',
    sector: 'North Border',
    stream_url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    resolution: '4K UHD (3840x2160)',
    model: 'YOLOv11x-Border',
    has_ptz: true,
  });

  const { message } = useWebSocket();
  const [detections, setDetections] = useState([]);

  const loadCameras = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCameras();
      setCameras(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCameras();
  }, [loadCameras]);

  useEffect(() => {
    if (!message) return;
    if (message.type === 'detection' || message.track_id) {
      setDetections((prev) => [...prev.filter((d) => d.track_id !== message.track_id), message].slice(-50));
    }
  }, [message]);

  const handleCreateCamera = async (e) => {
    e.preventDefault();
    if (!newCam.name) return;
    try {
      const created = await createCamera({
        ...newCam,
        status: 'online',
        fps: 30,
        bitrate: 3500,
        latency: 16,
      });
      setCameras((prev) => [created, ...prev]);
      setShowAddModal(false);
      setNewCam({
        name: '',
        location: '',
        sector: 'North Border',
        stream_url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
        resolution: '4K UHD (3840x2160)',
        model: 'YOLOv11x-Border',
        has_ptz: true,
      });
    } catch (createErr) {
      setError(createErr.message);
    }
  };

  const filteredCameras = cameras.filter((cam) => {
    const matchesSector = sectorFilter === 'all' || cam.sector?.toLowerCase().includes(sectorFilter.toLowerCase());
    const matchesSearch =
      !searchQuery.trim() ||
      cam.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cam.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cam.sector?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSector && matchesSearch;
  });

  const onlineCount = cameras.filter((c) => c.status === 'online').length;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header Bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">Camera Fleet Management</h1>
            <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-0.5 text-xs font-bold text-cyan-400">
              {onlineCount} / {cameras.length} Active Feeds
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400 sm:text-sm">
            Configure CCTV streams, multi-camera sectors, PTZ telemetry, and AI detection zones
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 rounded-2xl border border-cyan-400 bg-cyan-500 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:bg-cyan-400"
        >
          <Plus className="h-4 w-4" />
          Register New Camera
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-300">
          {error}
        </div>
      )}

      {/* Filter & Toolbar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-md">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Box */}
          <div className="relative w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search camera name or vector..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          {/* Sector Selector */}
          <select
            value={sectorFilter}
            onChange={(e) => setSectorFilter(e.target.value)}
            className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
          >
            <option value="all">All Border Sectors</option>
            <option value="north">North Border</option>
            <option value="gate">Main Gate</option>
            <option value="watchtower">Watchtower Post</option>
            <option value="fence">Perimeter Fence</option>
            <option value="aerial">Aerial Recon</option>
            <option value="logistics">Logistics Depot</option>
          </select>
        </div>

        {/* View mode toggle */}
        <div className="flex rounded-xl border border-slate-800 bg-slate-950 p-1">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              viewMode === 'grid'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Tv className="h-3.5 w-3.5" />
            Video Grid
          </button>
          <button
            type="button"
            onClick={() => setViewMode('table')}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              viewMode === 'table'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <TableIcon className="h-3.5 w-3.5" />
            Telemetry Fleet
          </button>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="space-y-6">
          {loading && (
            <div className="flex h-64 items-center justify-center rounded-3xl border border-slate-800 bg-slate-900/40 text-slate-500">
              Loading camera fleet...
            </div>
          )}

          {!loading && filteredCameras.length === 0 && (
            <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-12 text-center text-slate-500">
              No cameras found matching current filters.
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            {filteredCameras.map((camera) => (
              <VideoPanel
                key={camera.id}
                camera={camera}
                detections={detections.filter((d) => d.camera_id === camera.id)}
                onConfigureZone={(cam) => setSelectedCameraForZone(cam)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Telemetry Table View */}
      {viewMode === 'table' && (
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xl backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left">
              <thead className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="p-4">Camera ID & Name</th>
                  <th className="p-4">Sector & Vector</th>
                  <th className="p-4">Resolution</th>
                  <th className="p-4">AI Model</th>
                  <th className="p-4">PTZ / Bitrate</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {filteredCameras.map((camera) => (
                  <tr key={camera.id} className="transition hover:bg-slate-800/40">
                    <td className="p-4">
                      <p className="font-semibold text-white">{camera.name}</p>
                      <p className="font-mono text-slate-500">{camera.id}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-slate-300">{camera.sector || 'Perimeter'}</p>
                      <p className="text-[11px] text-slate-500">{camera.location}</p>
                    </td>
                    <td className="p-4 font-mono text-slate-300">{camera.resolution || '1080p'}</td>
                    <td className="p-4">
                      <span className="rounded-md border border-slate-700 bg-slate-800 px-2 py-0.5 font-mono text-[11px] text-cyan-400">
                        {camera.model || 'YOLOv11x'}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-slate-300">
                      {camera.has_ptz ? 'PTZ Motorized' : 'Fixed Lens'} ·{' '}
                      {camera.bitrate ? `${(camera.bitrate / 1000).toFixed(1)}M` : '3.5M'}
                    </td>
                    <td className="p-4">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          camera.status === 'online'
                            ? 'border border-emerald-500/30 bg-emerald-500/15 text-emerald-400'
                            : 'border border-amber-500/30 bg-amber-500/15 text-amber-400'
                        }`}
                      >
                        {camera.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedCameraForZone(camera)}
                        className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:border-cyan-500/40 hover:text-white"
                      >
                        Edit Zones ({camera.zones_count ?? 1})
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

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

      {/* Register Camera Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="w-[540px] max-w-full overflow-hidden rounded-3xl border border-slate-700 bg-slate-900 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
              <div className="flex items-center gap-2">
                <Camera className="h-5 w-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">Register Surveillance Camera</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCamera} className="p-6 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Camera Identification Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sector 7 - Perimeter Fence West"
                  value={newCam.name}
                  onChange={(e) => setNewCam({ ...newCam, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Sector
                  </label>
                  <select
                    value={newCam.sector}
                    onChange={(e) => setNewCam({ ...newCam, sector: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="North Border">North Border</option>
                    <option value="Main Gate">Main Gate</option>
                    <option value="Watchtower">Watchtower</option>
                    <option value="Perimeter Fence">Perimeter Fence</option>
                    <option value="Aerial Recon">Aerial Recon</option>
                    <option value="Logistics Depot">Logistics Depot</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Resolution
                  </label>
                  <select
                    value={newCam.resolution}
                    onChange={(e) => setNewCam({ ...newCam, resolution: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="4K UHD (3840x2160)">4K UHD (3840x2160)</option>
                    <option value="1080p (1920x1080)">1080p (1920x1080)</option>
                    <option value="1080p Thermal IR">1080p Thermal IR</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Location Description / Coordinates
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sector 7 Bounding Line (32.44° N, 74.91° E)"
                  value={newCam.location}
                  onChange={(e) => setNewCam({ ...newCam, location: e.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  RTSP / HLS Stream Source URL
                </label>
                <input
                  type="text"
                  placeholder="rtsp://admin:pass@192.168.1.104:554/stream1"
                  value={newCam.stream_url}
                  onChange={(e) => setNewCam({ ...newCam, stream_url: e.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-sm font-mono text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                    AI Detection Model
                  </label>
                  <select
                    value={newCam.model}
                    onChange={(e) => setNewCam({ ...newCam, model: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="YOLOv11x-Border">YOLOv11x-Border (High Accuracy)</option>
                    <option value="ThermalNet-IR-v4">ThermalNet-IR-v4 (Infrared)</option>
                    <option value="DroneVision-YOLOv11">DroneVision-YOLOv11</option>
                    <option value="YOLOv8-Nano">YOLOv8-Nano (Ultra Low Latency)</option>
                  </select>
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-300">
                    <input
                      type="checkbox"
                      checked={newCam.has_ptz}
                      onChange={(e) => setNewCam({ ...newCam, has_ptz: e.target.checked })}
                      className="h-4 w-4 rounded border-slate-700 accent-cyan-400"
                    />
                    Enable PTZ Motorized Controls
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-800 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-cyan-500 px-5 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-400"
                >
                  Register Camera
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

