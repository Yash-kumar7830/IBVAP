// src/pages/Events.jsx
import { useCallback, useEffect, useState } from 'react';
import EventTable from '../components/EventTable';
import RiskBadge from '../components/RiskBadge';
import {
  Calendar,
  Download,
  Eye,
  FileDown,
  Filter,
  RefreshCw,
  Search,
  Shield,
  X,
} from 'lucide-react';
import { getEvents } from '../services/api';
import { exportToCSV, exportToJSON, formatDate } from '../utils/formatters';

export default function Events() {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState('');
  const [objectFilter, setObjectFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');
  const [cameraFilter, setCameraFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inspectingEvent, setInspectingEvent] = useState(null);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getEvents();
      setEvents(Array.isArray(data) ? data : data?.items || []);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  // Apply filters
  const filteredEvents = events.filter((ev) => {
    const matchesSearch =
      !search.trim() ||
      ev.type?.toLowerCase().includes(search.toLowerCase()) ||
      ev.camera_name?.toLowerCase().includes(search.toLowerCase()) ||
      ev.object_type?.toLowerCase().includes(search.toLowerCase()) ||
      ev.track_id?.toLowerCase().includes(search.toLowerCase());

    const matchesObject =
      objectFilter === 'all' || ev.object_type?.toLowerCase() === objectFilter.toLowerCase();
    const matchesRisk = riskFilter === 'all' || ev.risk === riskFilter;
    const matchesCamera = cameraFilter === 'all' || ev.camera_id === cameraFilter;

    return matchesSearch && matchesObject && matchesRisk && matchesCamera;
  });

  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / pageSize));
  const paginatedEvents = filteredEvents.slice((page - 1) * pageSize, page * pageSize);

  const handleExportCSV = () => {
    exportToCSV(filteredEvents, `ibvap_events_${Date.now()}.csv`);
  };

  const handleExportJSON = () => {
    exportToJSON(filteredEvents, `ibvap_events_${Date.now()}.json`);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header Bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">Forensic Event Intelligence</h1>
            <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-0.5 text-xs font-bold text-cyan-400">
              {filteredEvents.length} Recorded Detections
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400 sm:text-sm">
            Auditable surveillance log &bull; DeepSORT track histories &bull; Forensic bounding boxes
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-300 transition hover:bg-slate-700 hover:text-white"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
          <button
            type="button"
            onClick={handleExportJSON}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-300 transition hover:bg-slate-700 hover:text-white"
          >
            <FileDown className="h-4 w-4" />
            Export JSON
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-300">
          {error}
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-md">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Box */}
          <div className="relative w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search track, object, event..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          {/* Object Filter */}
          <select
            value={objectFilter}
            onChange={(e) => {
              setObjectFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
          >
            <option value="all">All Detected Objects</option>
            <option value="person">Persons Only</option>
            <option value="vehicle">Vehicles Only</option>
            <option value="drone">Drones / Aerial</option>
            <option value="animal">Wildlife / Animals</option>
          </select>

          {/* Risk Filter */}
          <select
            value={riskFilter}
            onChange={(e) => {
              setRiskFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
          >
            <option value="all">All Risk Tiers</option>
            <option value="critical">Critical Risk</option>
            <option value="high">High Risk</option>
            <option value="medium">Medium Risk</option>
            <option value="low">Low Risk</option>
          </select>

          {/* Camera Filter */}
          <select
            value={cameraFilter}
            onChange={(e) => {
              setCameraFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
          >
            <option value="all">All Monitored Cameras</option>
            <option value="cam-01">Sector 1 - North Perimeter</option>
            <option value="cam-02">Sector 2 - Alpha Gate Entry</option>
            <option value="cam-03">Sector 3 - Watchtower IR</option>
            <option value="cam-04">Sector 4 - Fence East</option>
            <option value="cam-05">Sector 5 - Drone Unit</option>
            <option value="cam-06">Sector 6 - Logistics Depot</option>
          </select>
        </div>

        <button
          type="button"
          onClick={loadEvents}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-semibold text-slate-400 hover:text-white"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Sortable Event Table */}
      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-3xl border border-slate-800 bg-slate-900/40 text-slate-500">
          Loading forensic event records...
        </div>
      ) : (
        <EventTable events={paginatedEvents} onInspect={(ev) => setInspectingEvent(ev)} />
      )}

      {/* Pagination Controls */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-slate-800/80 pt-4 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span>Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-white"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          <span className="ml-2 font-mono">
            Showing {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, filteredEvents.length)} of {filteredEvents.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-mono">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 font-semibold text-slate-300 transition hover:bg-slate-700 hover:text-white disabled:opacity-40"
          >
            Previous
          </button>
          <button
            type="button"
            disabled={page === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 font-semibold text-slate-300 transition hover:bg-slate-700 hover:text-white disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>

      {/* Forensic Inspection Modal */}
      {inspectingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="w-[660px] max-w-full overflow-hidden rounded-3xl border border-slate-700 bg-slate-900 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">Forensic Detection Audit</h3>
              </div>
              <button
                type="button"
                onClick={() => setInspectingEvent(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              {inspectingEvent.snapshot_url && (
                <div className="relative mb-4 aspect-video w-full overflow-hidden rounded-2xl border border-slate-700 bg-slate-950">
                  <img
                    src={inspectingEvent.snapshot_url}
                    alt="Event snapshot"
                    className="h-full w-full object-cover"
                  />
                  {/* Bounding box visualizer over modal snapshot */}
                  {inspectingEvent.bbox && (
                    <div
                      className="absolute border-2 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.6)]"
                      style={{
                        left: `${inspectingEvent.bbox[0] * 100}%`,
                        top: `${inspectingEvent.bbox[1] * 100}%`,
                        width: `${inspectingEvent.bbox[2] * 100}%`,
                        height: `${inspectingEvent.bbox[3] * 100}%`,
                      }}
                    >
                      <span className="absolute -top-5 left-0 rounded bg-cyan-500 px-1 font-mono text-[9px] font-bold text-slate-950">
                        {inspectingEvent.object_type} #{inspectingEvent.track_id}
                      </span>
                    </div>
                  )}
                  <div className="absolute right-3 top-3">
                    <RiskBadge level={inspectingEvent.risk || 'low'} size="md" />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                  <span className="text-slate-500">Camera Source:</span>
                  <p className="mt-0.5 font-bold text-white">{inspectingEvent.camera_name}</p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                  <span className="text-slate-500">Event Time (UTC):</span>
                  <p className="mt-0.5 font-mono text-white">{formatDate(inspectingEvent.timestamp)}</p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                  <span className="text-slate-500">Target Track Identifier:</span>
                  <p className="mt-0.5 font-mono font-bold text-cyan-400">
                    #{inspectingEvent.track_id || 'TRK-000'}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                  <span className="text-slate-500">Classification Confidence:</span>
                  <p className="mt-0.5 font-mono font-bold text-emerald-400">
                    {inspectingEvent.confidence
                      ? `${(inspectingEvent.confidence > 1 ? inspectingEvent.confidence : inspectingEvent.confidence * 100).toFixed(1)}%`
                      : '98.5%'}
                  </p>
                </div>
              </div>

              {inspectingEvent.bbox && (
                <div className="mt-3 rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs">
                  <span className="text-slate-500">Normalized Bounding Box Coordinates:</span>
                  <p className="mt-1 font-mono text-slate-300">
                    [X: {inspectingEvent.bbox[0]}, Y: {inspectingEvent.bbox[1]}, W: {inspectingEvent.bbox[2]}, H: {inspectingEvent.bbox[3]}]
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-800 bg-slate-950/60 px-6 py-4">
              <button
                type="button"
                onClick={() => setInspectingEvent(null)}
                className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

