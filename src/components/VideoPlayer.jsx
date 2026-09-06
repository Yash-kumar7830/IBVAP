// TODO: Implement the HLS video player with AI overlay support.
// src/components/VideoPlayer.jsx
import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

export default function VideoPlayer({ streamUrl, onVideoReady }) {
  const videoRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !streamUrl) return;

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
      video.addEventListener('loadedmetadata', () => {
        video.play().catch(() => {});
        onVideoReady?.();
      });
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
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 text-white">
          {error}
        </div>
      )}
    </div>
  );
}