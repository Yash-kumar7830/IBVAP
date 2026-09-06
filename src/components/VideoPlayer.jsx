// TODO: Implement the HLS video player with AI overlay support.
// src/components/VideoPlayer.jsx
import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

export default function VideoPlayer({ streamUrl, onVideoReady, detections = [] }) {
  const videoRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !streamUrl) return undefined;

    setError(null);

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
        onVideoReady?.();
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          setError('Stream unavailable');
          hls.destroy();
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      const handleMetadata = () => {
        video.play().catch(() => {});
        onVideoReady?.();
      };
      video.addEventListener('loadedmetadata', handleMetadata);
      return () => video.removeEventListener('loadedmetadata', handleMetadata);
    }

    return () => {
      if (hls) hls.destroy();
    };
  }, [streamUrl, onVideoReady]);

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
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 text-white">
          {error}
        </div>
      )}
    </div>
  );
}