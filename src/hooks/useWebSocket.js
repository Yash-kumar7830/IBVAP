import { useCallback, useEffect, useRef, useState } from 'react';

const DEFAULT_WS_URL = 'ws://localhost:8000/ws/detections';

export default function useWebSocket(url = import.meta.env.VITE_WS_URL || DEFAULT_WS_URL) {
	const socketRef = useRef(null);
	const connectRef = useRef(null);
	const retryTimerRef = useRef(null);
	const [message, setMessage] = useState(null);
	const [connected, setConnected] = useState(false);
	const [error, setError] = useState(null);

	const connect = useCallback(() => {
		if (socketRef.current?.readyState === WebSocket.OPEN) return;

		const socket = new WebSocket(url);
		socketRef.current = socket;
		socket.onopen = () => {
			setConnected(true);
			setError(null);
		};
		socket.onmessage = (event) => {
			try {
				setMessage(JSON.parse(event.data));
			} catch {
				setMessage({ type: 'message', data: event.data });
			}
		};
		socket.onerror = () => setError('Live updates unavailable');
		socket.onclose = () => {
			setConnected(false);
			retryTimerRef.current = setTimeout(() => connectRef.current?.(), 3000);
		};
	}, [url]);

	useEffect(() => {
		connectRef.current = connect;
	}, [connect]);

	useEffect(() => {
		connect();
		return () => {
			clearTimeout(retryTimerRef.current);
			socketRef.current?.close();
		};
	}, [connect]);

	const send = useCallback((payload) => {
		if (socketRef.current?.readyState === WebSocket.OPEN) {
			socketRef.current.send(JSON.stringify(payload));
		}
	}, []);

	return { message, connected, error, reconnect: connect, send };
}
