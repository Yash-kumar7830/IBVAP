// src/components/VideoPlayer.jsx
import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { LoaderCircle, RotateCw, WifiOff } from 'lucide-react';

export default function VideoPlayer({ streamUrl, onVideoReady, detections = [] }) {
  const videoRef = useRef(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !streamUrl) return undefined;

    setError(null);
    setLoading(true);

    let hls;

    if (Hls.isSupported()) {
      hls = new Hls({
        maxBufferLength: 15,
        maxMaxBufferLength: 30,
        enableWorker: true,
        lowLatencyMode: true,
        liveSyncDurationCount: 3,
      });

      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {});
        setLoading(false);
        onVideoReady?.();
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          setError('Stream unavailable');
          setLoading(false);
          hls.destroy();
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      const handleMetadata = () => {
        video.play().catch(() => {});
        setLoading(false);
        onVideoReady?.();
      };
      video.addEventListener('loadedmetadata', handleMetadata);
      return () => video.removeEventListener('loadedmetadata', handleMetadata);
    }

    return () => {
      if (hls) hls.destroy();
    };
  }, [streamUrl, onVideoReady, attempt]);

  return (
    <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
      <video
        ref={videoRef}
        className="w-full h-full"
        autoPlay
        muted
        playsInline
      />
      {detections.map((detection, index) => {
        const box = detection.bbox || detection.bounding_box;
        if (!box || box.length !== 4) return null;
        const [x, y, width, height] = box;
        return (
          <div
            key={detection.track_id || index}
            className="absolute border-2 border-red-400 pointer-events-none"
            style={{ left: `${x * 100}%`, top: `${y * 100}%`, width: `${width * 100}%`, height: `${height * 100}%` }}
          >
            <span className="absolute -top-5 left-0 bg-red-500 px-1 text-xs text-white">
              {detection.object_type || 'object'} {detection.track_id || ''}
            </span>
          </div>
        );
      })}
      {loading && !error && <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-950/70 text-xs text-slate-300"><LoaderCircle className="h-6 w-6 animate-spin text-cyan-300" />Connecting to stream</div>}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-950/85 p-4 text-center text-white"><WifiOff className="h-7 w-7 text-amber-300" /><span className="text-sm">{error}</span><button type="button" onClick={() => setAttempt((value) => value + 1)} className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold hover:bg-white/20"><RotateCw className="h-3.5 w-3.5" />Retry stream</button>
        </div>
      )}
    </div>
  );
}