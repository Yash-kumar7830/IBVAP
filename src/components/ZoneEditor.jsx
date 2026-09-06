// TODO: Implement the polygon zone drawing editor.
// src/components/ZoneEditor.jsx
import { useCallback, useEffect, useRef, useState } from 'react';
import { X, Save, RotateCcw } from 'lucide-react';
import { getZones, saveZone } from '../services/api';

export default function ZoneEditor({ isOpen, onClose, onSave, cameraId, zoneName = '' }) {
  const canvasRef = useRef(null);
  const [points, setPoints] = useState([]);
  const [name, setName] = useState(zoneName);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const getCanvasCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / canvas.width;
    const y = (e.clientY - rect.top) / canvas.height;
    return { x, y };
  };

  const handleCanvasClick = (e) => {
    const { x, y } = getCanvasCoordinates(e);
    setPoints([...points, { x, y }]);
  };

  useEffect(() => {
    if (!isOpen || !cameraId) return;
    let active = true;
    const timer = setTimeout(() => {
      setLoading(true);
      setError(null);
    }, 0);
    getZones(cameraId)
      .then((zones) => {
        if (!active) return;
        const firstZone = (zones || [])[0];
        setPoints(firstZone?.points || []);
        setName(firstZone?.name || zoneName);
      })
      .catch((loadError) => active && setError(loadError.message))
      .finally(() => active && setLoading(false));
    return () => { active = false; clearTimeout(timer); };
  }, [cameraId, isOpen, zoneName]);

  const handleSave = async () => {
    if (points.length >= 3) {
      const zone = {
        name: name.trim() || 'Restricted Zone',
        points,
        type: 'restricted'
      };
      setSaving(true);
      setError(null);
      try {
        const savedZone = cameraId ? await saveZone(cameraId, zone) : zone;
        onSave?.(savedZone || zone);
        onClose();
      } catch (saveError) {
        setError(saveError.message);
      } finally {
        setSaving(false);
      }
    }
  };

  const handleReset = () => {
    setPoints([]);
  };

  const drawPolygon = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid background
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.width; i += 50) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
    }
    for (let i = 0; i < canvas.height; i += 50) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(canvas.width, i);
      ctx.stroke();
    }

    if (points.length > 0) {
      ctx.beginPath();
      ctx.moveTo(points[0].x * canvas.width, points[0].y * canvas.height);
      
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x * canvas.width, points[i].y * canvas.height);
      }
      
      ctx.closePath();
      ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
      ctx.fill();
      ctx.strokeStyle = '#ff0000';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw points
      points.forEach((point, index) => {
        ctx.beginPath();
        ctx.arc(point.x * canvas.width, point.y * canvas.height, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#ff0000';
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = '12px Arial';
        ctx.fillText(index + 1, point.x * canvas.width + 8, point.y * canvas.height - 8);
      });
    }
  }, [points]);

  useEffect(() => {
    if (isOpen) {
      drawPolygon();
    }
  }, [drawPolygon, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[800px] max-w-[90vw]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Draw Restricted Zone</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Zone Name (e.g., Restricted Area)"
            className="w-full border rounded px-3 py-2"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>

        {loading && <p className="mb-2 text-sm text-gray-500">Loading existing zones...</p>}
        {error && <p className="mb-2 text-sm text-red-600">{error}</p>}

        <canvas
          ref={canvasRef}
          width={700}
          height={400}
          onClick={handleCanvasClick}
          className="border rounded cursor-crosshair mb-4 bg-gray-50"
        />

        <div className="flex gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 border rounded hover:bg-gray-50"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
          <button
            onClick={handleSave}
            disabled={points.length < 3 || saving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : `Save Zone (${points.length} points)`}
          </button>
        </div>

        <p className="text-sm text-gray-500 mt-2">
          Click on the canvas to add points. Minimum 3 points required. Right-click or press Save when done.
        </p>
      </div>
    </div>
  );
}