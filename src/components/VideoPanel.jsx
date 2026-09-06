// src/components/VideoPanel.jsx
import { useState } from 'react';
import VideoPlayer from './VideoPlayer';
import { Compass, Eye, Layers, Move, Sliders, Sparkles, ZoomIn, ZoomOut } from 'lucide-react';

export default function VideoPanel({
  camera,
  showOriginal = true,
  showAI = true,
  detections = [],
  onConfigureZone,
}) {
  const [viewMode, setViewMode] = useState('both');
  const [showPtz, setShowPtz] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1.0);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });

  const getViewGridClass = () => {
    if (viewMode === 'original' || viewMode === 'ai') return 'grid-cols-1';
    return 'grid-cols-1 lg:grid-cols-2';
  };

  const handlePan = (dx, dy) => {
    setPanOffset((prev) => ({
      x: Math.max(-20, Math.min(20, prev.x + dx)),
      y: Math.max(-20, Math.min(20, prev.y + dy)),
    }));
  };

  const handleZoom = (factor) => {
    setZoomLevel((prev) => Math.max(1.0, Math.min(3.0, +(prev + factor).toFixed(1))));
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl backdrop-blur-md transition-all duration-200 hover:border-slate-700">
      {/* Top Header */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white">{camera.name}</h3>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                camera.status === 'online'
                  ? 'border border-emerald-500/30 bg-emerald-500/15 text-emerald-400'
                  : 'border border-amber-500/30 bg-amber-500/15 text-amber-400'
              }`}
            >
              {camera.status || 'online'}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-slate-400">{camera.location}</p>
        </div>

        {/* View Mode & PTZ Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {camera.has_ptz && (
            <button
              type="button"
              onClick={() => setShowPtz(!showPtz)}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
                showPtz
                  ? 'border-cyan-500/40 bg-cyan-500/20 text-cyan-300'
                  : 'border-slate-700 bg-slate-800/80 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Compass className="h-3.5 w-3.5" />
              PTZ Control
            </button>
          )}

          {onConfigureZone && (
            <button
              type="button"
              onClick={() => onConfigureZone(camera)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:border-cyan-500/40 hover:bg-slate-700 hover:text-white"
            >
              <Sliders className="h-3.5 w-3.5 text-cyan-400" />
              Zones ({camera.zones_count ?? 1})
            </button>
          )}

          <div className="flex rounded-xl border border-slate-800 bg-slate-950 p-1">
            <button
              type="button"
              onClick={() => setViewMode('original')}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                viewMode === 'original'
                  ? 'bg-slate-800 text-cyan-400 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Original
            </button>
            <button
              type="button"
              onClick={() => setViewMode('ai')}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                viewMode === 'ai'
                  ? 'bg-slate-800 text-cyan-400 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              AI Vision
            </button>
            <button
              type="button"
              onClick={() => setViewMode('both')}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                viewMode === 'both'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Dual Feed
            </button>
          </div>
        </div>
      </div>

      {/* PTZ Virtual Overlay Controller */}
      {showPtz && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-cyan-500/20 bg-slate-950/90 p-3 text-xs text-slate-300 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <Move className="h-4 w-4 text-cyan-400" />
            <span className="font-semibold text-white">PTZ Virtual Joystick</span>
            <span className="font-mono text-[11px] text-slate-400">
              Pan: {panOffset.x > 0 ? `+${panOffset.x}°` : `${panOffset.x}°`}, Tilt: {panOffset.y > 0 ? `+${panOffset.y}°` : `${panOffset.y}°`}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Pan controls */}
            <div className="inline-flex rounded-lg border border-slate-800 bg-slate-900 p-0.5">
              <button
                type="button"
                onClick={() => handlePan(-5, 0)}
                className="px-2 py-1 hover:bg-slate-800 hover:text-cyan-400"
              >
                ◀ Left
              </button>
              <button
                type="button"
                onClick={() => handlePan(0, 5)}
                className="px-2 py-1 hover:bg-slate-800 hover:text-cyan-400"
              >
                ▲ Up
              </button>
              <button
                type="button"
                onClick={() => handlePan(0, -5)}
                className="px-2 py-1 hover:bg-slate-800 hover:text-cyan-400"
              >
                ▼ Down
              </button>
              <button
                type="button"
                onClick={() => handlePan(5, 0)}
                className="px-2 py-1 hover:bg-slate-800 hover:text-cyan-400"
              >
                Right ▶
              </button>
            </div>

            {/* Zoom controls */}
            <div className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-2 py-1">
              <button
                type="button"
                onClick={() => handleZoom(-0.2)}
                disabled={zoomLevel <= 1.0}
                className="text-slate-400 hover:text-white disabled:opacity-40"
              >
                <ZoomOut className="h-3.5 w-3.5" />
              </button>
              <span className="font-mono text-[11px] font-bold text-cyan-400">
                {zoomLevel.toFixed(1)}x
              </span>
              <button
                type="button"
                onClick={() => handleZoom(0.2)}
                disabled={zoomLevel >= 3.0}
                className="text-slate-400 hover:text-white disabled:opacity-40"
              >
                <ZoomIn className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Video Feeds Grid */}
      <div className={`grid gap-4 ${getViewGridClass()}`}>
        {/* Original CCTV Stream */}
        {showOriginal && (viewMode === 'original' || viewMode === 'both') && (
          <div className="flex flex-col">
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="inline-flex items-center gap-1.5 font-bold uppercase tracking-wider text-slate-300">
                <Eye className="h-3.5 w-3.5 text-slate-400" />
                Raw CCTV Stream
              </span>
              <span className="font-mono text-slate-400">H.265 Direct RTSP</span>
            </div>
            <VideoPlayer
              streamUrl={camera.originalStream || camera.stream_url}
              cameraName={`${camera.name} [RAW]`}
              cameraId={camera.id}
              location={camera.location}
              detections={[]}
            />
          </div>
        )}

        {/* AI Annotated Stream */}
        {showAI && (viewMode === 'ai' || viewMode === 'both') && (
          <div className="flex flex-col">
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="inline-flex items-center gap-1.5 font-bold uppercase tracking-wider text-cyan-400">
                <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                AI Annotated Overlay
              </span>
              <span className="font-mono text-emerald-400">
                {camera.model || 'YOLOv11x'} · 99.2% Acc
              </span>
            </div>
            <VideoPlayer
              streamUrl={camera.aiStream || camera.ai_stream_url || camera.stream_url}
              cameraName={`${camera.name} [AI-VISION]`}
              cameraId={camera.id}
              location={camera.location}
              detections={detections}
            />

            {/* AI Legend */}
            <div className="mt-2.5 flex flex-wrap items-center gap-4 rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-[11px] text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
                <span className="text-slate-200">Person Target</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.6)]" />
                <span className="text-slate-200">Vehicle Vector</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.6)]" />
                <span className="text-slate-200">Aerial Drone</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm border border-amber-400 bg-amber-500/20" />
                <span className="text-slate-200">Restricted Zone</span>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Telemetry Bar */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800/80 pt-3 text-[11px] text-slate-400">
        <div className="flex flex-wrap items-center gap-4 font-mono">
          <span>Resolution: <strong className="text-white">{camera.resolution || '1080p'}</strong></span>
          <span>Bitrate: <strong className="text-white">{camera.bitrate ? `${(camera.bitrate / 1000).toFixed(1)} Mbps` : '3.8 Mbps'}</strong></span>
          <span>Latency: <strong className="text-emerald-400">{camera.latency || 16} ms</strong></span>
          <span>Sector: <strong className="text-cyan-400">{camera.sector || 'Perimeter'}</strong></span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-500">
          <Layers className="h-3.5 w-3.5" />
          <span>Inference: TensorRT FP16</span>
        </div>
      </div>
    </div>
  );
}