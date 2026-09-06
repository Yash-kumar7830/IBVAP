import { useEffect, useState } from 'react';
import VideoPanel from '../components/VideoPanel';
import ZoneEditor from '../components/ZoneEditor';
import { getCameras } from '../services/api';

const mapCamera = (camera) => ({ ...camera, originalStream: camera.stream_url || camera.original_stream, aiStream: camera.ai_stream_url || camera.stream_url });

export default function Cameras() {
	const [cameras, setCameras] = useState([]); const [selected, setSelected] = useState(null); const [loading, setLoading] = useState(true); const [error, setError] = useState(null);
	const load = async () => { setLoading(true); setError(null); try { setCameras((await getCameras() || []).map(mapCamera)); } catch (loadError) { setError(loadError.message); } finally { setLoading(false); } };
	useEffect(() => { const timer = setTimeout(load, 0); return () => clearTimeout(timer); }, []);
	return <div className="p-6"><div className="mb-6"><h1 className="text-2xl font-bold">Cameras</h1><p className="text-gray-500">Manage live camera feeds and detection zones</p></div>{error && <div className="mb-4 rounded border border-red-200 bg-red-50 p-4 text-red-700">{error} <button onClick={load} className="ml-3 underline">Retry</button></div>}{loading ? <div className="rounded bg-white p-8 text-center text-gray-500">Loading cameras...</div> : <div className="space-y-6">{cameras.map((camera) => <div key={camera.id}><div className="mb-2 flex items-center justify-between"><span className="font-semibold">{camera.name} <span className="text-sm font-normal text-gray-500">{camera.status || 'unknown'}</span></span><button onClick={() => setSelected(camera)} className="rounded border px-3 py-1 text-sm">Edit zones</button></div><VideoPanel camera={camera} /></div>)}</div>}{selected && <ZoneEditor isOpen cameraId={selected.id} zoneName={`${selected.name} zone`} onClose={() => setSelected(null)} onSave={() => setSelected(null)} />}</div>;
}
