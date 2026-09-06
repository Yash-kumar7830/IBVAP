// src/hooks/useWebSocket.js
import { useCallback, useEffect, useRef, useState } from 'react';

const DEFAULT_WS_URL = 'ws://localhost:8000/ws/detections';

export default function useWebSocket(url = import.meta.env.VITE_WS_URL || DEFAULT_WS_URL) {
  const socketRef = useRef(null);
  const connectRef = useRef(null);
  const retryTimerRef = useRef(null);
  const simTimerRef = useRef(null);
  const [message, setMessage] = useState(null);
  const [connected, setConnected] = useState(false);
  const [simulated, setSimulated] = useState(false);
  const [error, setError] = useState(null);

  // Simulated live object movement generator
  const startSimulation = useCallback(() => {
    if (simTimerRef.current) return;
    setSimulated(true);

    let step = 0;
    const targets = [
      { track_id: 'TRK-9821', object_type: 'person', camera_id: 'cam-01', x: 0.35, y: 0.40, w: 0.12, h: 0.32, dx: 0.005, dy: 0.002, conf: 0.96 },
      { track_id: 'TRK-9815', object_type: 'vehicle', camera_id: 'cam-02', x: 0.45, y: 0.45, w: 0.22, h: 0.26, dx: -0.004, dy: 0.001, conf: 0.94 },
      { track_id: 'TRK-9790', object_type: 'drone', camera_id: 'cam-05', x: 0.50, y: 0.20, w: 0.09, h: 0.10, dx: 0.008, dy: -0.003, conf: 0.92 },
      { track_id: 'TRK-9774', object_type: 'person', camera_id: 'cam-03', x: 0.28, y: 0.48, w: 0.11, h: 0.28, dx: 0.003, dy: -0.002, conf: 0.91 },
    ];

    simTimerRef.current = setInterval(() => {
      step += 1;
      // Animate target coordinates in realistic patrol loops
      const updatedDetections = targets.map((t) => {
        let newX = t.x + t.dx;
        let newY = t.y + t.dy;
        let dx = t.dx;
        let dy = t.dy;

        if (newX < 0.1 || newX > 0.75) dx = -dx;
        if (newY < 0.15 || newY > 0.65) dy = -dy;

        t.x = Math.max(0.1, Math.min(0.75, newX));
        t.y = Math.max(0.15, Math.min(0.65, newY));
        t.dx = dx;
        t.dy = dy;

        return {
          type: 'detection',
          track_id: t.track_id,
          object_type: t.object_type,
          camera_id: t.camera_id,
          confidence: t.conf,
          bbox: [t.x, t.y, t.w, t.h],
          timestamp: new Date().toISOString(),
        };
      });

      // Emit active detection for this step
      const activeDetection = updatedDetections[step % updatedDetections.length];
      setMessage(activeDetection);

      // Periodically trigger a simulated alert notification
      if (step % 25 === 0) {
        setMessage({
          type: 'alert',
          alert: {
            id: `alt-sim-${Date.now()}`,
            type: 'Perimeter Boundary Infringement',
            camera_id: activeDetection.camera_id,
            camera_name: activeDetection.camera_id === 'cam-01' ? 'Sector 1 - North Perimeter' : 'Sector 2 - Alpha Gate Entry',
            risk_level: step % 50 === 0 ? 'critical' : 'high',
            track_id: activeDetection.track_id,
            object_type: activeDetection.object_type,
            confidence: 0.95,
            timestamp: new Date().toISOString(),
            status: 'active',
            details: `AI boundary breach detected for ${activeDetection.track_id}. Immediate response recommended.`,
          },
        });
      }
    }, 1200);
  }, []);

  const stopSimulation = useCallback(() => {
    if (simTimerRef.current) {
      clearInterval(simTimerRef.current);
      simTimerRef.current = null;
    }
    setSimulated(false);
  }, []);

  const connect = useCallback(() => {
    if (socketRef.current?.readyState === WebSocket.OPEN) return;

    try {
      const socket = new WebSocket(url);
      socketRef.current = socket;

      socket.onopen = () => {
        setConnected(true);
        setError(null);
        stopSimulation();
      };

      socket.onmessage = (event) => {
        try {
          setMessage(JSON.parse(event.data));
        } catch {
          setMessage({ type: 'message', data: event.data });
        }
      };

      socket.onerror = () => {
        setError('Live WebSocket stream offline');
        setConnected(false);
        startSimulation();
      };

      socket.onclose = () => {
        setConnected(false);
        startSimulation();
        retryTimerRef.current = setTimeout(() => connectRef.current?.(), 10000);
      };
    } catch {
      setError('Connection failed');
      startSimulation();
    }
  }, [url, startSimulation, stopSimulation]);

  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

  useEffect(() => {
    connect();
    return () => {
      clearTimeout(retryTimerRef.current);
      stopSimulation();
      socketRef.current?.close();
    };
  }, [connect, stopSimulation]);

  const send = useCallback((payload) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(payload));
    }
  }, []);

  return { message, connected, simulated, error, reconnect: connect, send };
}

