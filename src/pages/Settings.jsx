import { useEffect, useState } from 'react';
import { getHealth } from '../services/api';

export default function Settings() {
	const [health, setHealth] = useState(null); const [error, setError] = useState(null);
	useEffect(() => { getHealth().then(setHealth).catch((loadError) => setError(loadError.message)); }, []);
	return <div className="p-6"><h1 className="text-2xl font-bold">Settings</h1><p className="mt-1 text-gray-500">Frontend connection settings</p><div className="mt-6 max-w-xl rounded-lg bg-white p-5 shadow"><div className="flex justify-between border-b pb-4"><span>API base URL</span><code>{import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'}</code></div><div className="flex justify-between pt-4"><span>Backend status</span><span className={health?.status === 'online' ? 'text-green-600' : 'text-red-600'}>{health?.status || error || 'Checking...'}</span></div></div></div>;
}
