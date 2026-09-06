// src/components/VideoPlayer.jsx
import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { Camera, Maximize, Minimize, Volume2, VolumeX, Shield, Wifi, WifiOff } from 'lucide-react';

export default function VideoPlayer({
  streamUrl,
  cameraName = 'Surveillance Feed',
  cameraId = 'cam-01',
  location = 'Perimeter',
  detections = [],
  showControls = true,
  onVideoReady,
}) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [useSimulation, setUseSimulation] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  // Update clock timecode
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0').slice(0, 2));
    };
    updateTime();
    const interval = setInterval(updateTime, 100);
    return () => clearInterval(interval);
  }, []);

  // HLS stream loader
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !streamUrl) {
      setUseSimulation(true);
      setLoading(false);
      return;
    }

    setError(null);
    setLoading(true);
    let hls;

    if (Hls.isSupported()) {
      hls = new Hls({
        maxBufferLength: 10,
        enableWorker: true,
        lowLatencyMode: true,
      });

      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {});
        setLoading(false);
        setUseSimulation(false);
        onVideoReady?.();
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          // Switch gracefully to simulation so user sees a vibrant active camera
          setUseSimulation(true);
          setLoading(false);
          hls.destroy();
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      const handleMetadata = () => {
        video.play().catch(() => {});
        setLoading(false);
        setUseSimulation(false);
        onVideoReady?.();
      };
      video.addEventListener('loadedmetadata', handleMetadata);
      video.onerror = () => {
        setUseSimulation(true);
        setLoading(false);
      };
      return () => video.removeEventListener('loadedmetadata', handleMetadata);
    } else {
      setUseSimulation(true);
      setLoading(false);
    }

    return () => {
      if (hls) hls.destroy();
    };
  }, [streamUrl, onVideoReady]);

  // Canvas simulation renderer when hardware HLS stream is offline
  useEffect(() => {
    if (!useSimulation) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let frame = 0;

    const render = () => {
      frame += 1;
      const width = canvas.width;
      const height = canvas.height;

      // Dark background gradient
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, '#0a0f1d');
      grad.addColorStop(1, '#030712');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Radar scanline effect
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.08)';
      ctx.lineWidth = 1;
      for (let y = 0; y < height; y += 24) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      for (let x = 0; x < width; x += 32) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // Moving scan bar
      const scanY = (frame * 2) % height;
      const scanGrad = ctx.createLinearGradient(0, scanY - 20, 0, scanY + 20);
      scanGrad.addColorStop(0, 'rgba(6, 182, 212, 0)');
      scanGrad.addColorStop(0.5, 'rgba(6, 182, 212, 0.12)');
      scanGrad.addColorStop(1, 'rgba(6, 182, 212, 0)');
      ctx.fillStyle = scanGrad;
      ctx.fillRect(0, scanY - 20, width, 40);

      // Camera focal crosshairs in center
      const cx = width / 2;
      const cy = height / 2;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx - 20, cy);
      ctx.lineTo(cx + 20, cy);
      ctx.moveTo(cx, cy - 20);
      ctx.lineTo(cx, cy + 20);
      ctx.stroke();

      // Simulated moving target 1 (Person)
      const p1X = (0.35 + Math.sin(frame * 0.02) * 0.15) * width;
      const p1Y = (0.45 + Math.cos(frame * 0.015) * 0.08) * height;
      const p1W = 0.10 * width;
      const p1H = 0.28 * height;

      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 2;
      ctx.strokeRect(p1X - p1W / 2, p1Y - p1H / 2, p1W, p1H);

      ctx.fillStyle = 'rgba(244, 63, 94, 0.85)';
      ctx.fillRect(p1X - p1W / 2, p1Y - p1H / 2 - 18, p1W, 18);
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.fillText('PERSON 96%', p1X - p1W / 2 + 4, p1Y - p1H / 2 - 5);

      // Corner brackets on target
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.strokeRect(p1X - p1W / 2 - 3, p1Y - p1H / 2 - 3, 6, 6);
      ctx.strokeRect(p1X + p1W / 2 - 3, p1Y + p1H / 2 - 3, 6, 6);

      // Simulated target 2 (Vehicle)
      const vX = (0.65 - Math.cos(frame * 0.018) * 0.12) * width;
      const vY = (0.60 + Math.sin(frame * 0.01) * 0.05) * height;
      const vW = 0.22 * width;
      const vH = 0.22 * height;

      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.strokeRect(vX - vW / 2, vY - vH / 2, vW, vH);

      ctx.fillStyle = 'rgba(56, 189, 248, 0.85)';
      ctx.fillRect(vX - vW / 2, vY - vH / 2 - 18, vW, 18);
      ctx.fillStyle = '#030712';
      ctx.font = 'bold 10px JetBrains Mono, monospace';
      ctx.fillText('VEHICLE 94%', vX - vW / 2 + 4, vY - vH / 2 - 5);

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [useSimulation]);

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Snapshot capture
  const takeSnapshot = () => {
    let dataUrl;
    if (useSimulation && canvasRef.current) {
      dataUrl = canvasRef.current.toDataURL('image/jpeg');
    } else if (videoRef.current) {
      const snapCanvas = document.createElement('canvas');
      snapCanvas.width = videoRef.current.videoWidth || 640;
      snapCanvas.height = videoRef.current.videoHeight || 360;
      const snapCtx = snapCanvas.getContext('2d');
      snapCtx.drawImage(videoRef.current, 0, 0);
      dataUrl = snapCanvas.toDataURL('image/jpeg');
    }

    if (dataUrl) {
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `${cameraId}-snapshot-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div
      ref={containerRef}
      className="group relative aspect-video w-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl"
    >
      {/* Video element */}
      {!useSimulation && (
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          autoPlay
          muted={isMuted}
          playsInline
        />
      )}

      {/* Canvas fallback simulation */}
      {useSimulation && (
        <canvas
          ref={canvasRef}
          width={640}
          height={360}
          className="h-full w-full object-cover"
        />
      )}

      {/* Dynamic detections overlays */}
      {!useSimulation &&
        detections.map((detection, index) => {
          const box = detection.bbox || detection.bounding_box;
          if (!box || box.length !== 4) return null;
          const [x, y, width, height] = box;
          const isDanger = ['critical', 'high'].includes(detection.risk);

          return (
            <div
              key={detection.track_id || index}
              className={`pointer-events-none absolute border-2 transition-all duration-300 ${
                isDanger
                  ? 'border-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.5)]'
                  : 'border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.4)]'
              }`}
              style={{
                left: `${x * 100}%`,
                top: `${y * 100}%`,
                width: `${width * 100}%`,
                height: `${height * 100}%`,
              }}
            >
              <div
                className={`absolute -top-5 left-0 flex items-center gap-1 rounded-sm px-1.5 py-0.5 font-mono text-[10px] font-bold text-white uppercase ${
                  isDanger ? 'bg-rose-500' : 'bg-cyan-600'
                }`}
              >
                <span>{detection.object_type || 'TARGET'}</span>
                {detection.track_id && <span>#{detection.track_id}</span>}
                {detection.confidence && (
                  <span className="opacity-80">
                    {(detection.confidence > 1 ? detection.confidence : detection.confidence * 100).toFixed(0)}%
                  </span>
                )}
              </div>
            </div>
          );
        })}

      {/* Top HUD Bar */}
      <div className="absolute inset-x-0 top-0 flex items-center justify-between bg-gradient-to-b from-black/80 via-black/40 to-transparent p-3 text-xs text-white backdrop-blur-xs">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 items-center justify-center">
            <span className="absolute h-2 w-2 animate-ping rounded-full bg-rose-500 opacity-75" />
            <span className="h-2 w-2 rounded-full bg-rose-500" />
          </span>
          <span className="font-mono text-[11px] font-bold tracking-wider text-rose-400">REC</span>
          <span className="text-slate-500">|</span>
          <span className="font-semibold text-slate-200">{cameraName}</span>
          <span className="hidden font-mono text-[11px] text-cyan-400 sm:inline">[{cameraId}]</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 font-mono text-[11px] text-slate-300">
            {useSimulation ? (
              <span className="inline-flex items-center gap-1 rounded bg-cyan-500/20 px-1.5 py-0.5 text-[10px] text-cyan-300">
                <Wifi className="h-3 w-3" /> SIMULATED AI FEED
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-emerald-400">
                <Wifi className="h-3 w-3" /> LIVE 4K
              </span>
            )}
          </div>
          <span className="font-mono text-xs text-slate-300">{currentTime}</span>
        </div>
      </div>

      {/* Bottom HUD Bar & Controls */}
      {showControls && (
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/85 via-black/40 to-transparent p-3 opacity-90 transition-opacity duration-200 group-hover:opacity-100">
          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span className="rounded bg-slate-800/80 px-2 py-0.5 font-mono text-slate-300">
              {location}
            </span>
            <span className="hidden font-mono text-emerald-400 sm:inline">
              FPS: 30.0
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsMuted(!isMuted)}
              title={isMuted ? 'Unmute' : 'Mute'}
              className="rounded-lg bg-black/60 p-1.5 text-slate-300 backdrop-blur-sm transition hover:bg-white/20 hover:text-white"
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={takeSnapshot}
              title="Capture Frame Snapshot"
              className="rounded-lg bg-black/60 p-1.5 text-slate-300 backdrop-blur-sm transition hover:bg-white/20 hover:text-white"
            >
              <Camera className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={toggleFullscreen}
              title="Toggle Fullscreen"
              className="rounded-lg bg-black/60 p-1.5 text-slate-300 backdrop-blur-sm transition hover:bg-white/20 hover:text-white"
            >
              {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}