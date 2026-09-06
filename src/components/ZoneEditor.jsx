// src/components/ZoneEditor.jsx
import { useCallback, useEffect, useRef, useState } from 'react';
import { Check, Info, Layers, RotateCcw, Save, ShieldAlert, Sliders, Undo2, X } from 'lucide-react';
import { getZones, saveZone } from '../services/api';

export default function ZoneEditor({
  isOpen,
  onClose,
  onSave,
  cameraId = 'cam-01',
  cameraName = 'Camera',
  zoneName = '',
}) {
  const canvasRef = useRef(null);
  const [points, setPoints] = useState([]);
  const [name, setName] = useState(zoneName || `${cameraName} Zone`);
  const [zoneType, setZoneType] = useState('restricted');
  const [riskLevel, setRiskLevel] = useState('critical');
  const [sensitivity, setSensitivity] = useState(85);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Load existing zone if any
  useEffect(() => {
    if (!isOpen || !cameraId) return;
    let active = true;
    setLoading(true);
    setError(null);

    getZones(cameraId)
      .then((zones) => {
        if (!active) return;
        const firstZone = (zones || [])[0];
        if (firstZone) {
          setPoints(firstZone.points || []);
          setName(firstZone.name || `${cameraName} Zone`);
          setZoneType(firstZone.type || 'restricted');
          setRiskLevel(firstZone.risk_level || 'critical');
          setSensitivity(firstZone.sensitivity || 85);
        } else {
          // Default initial polygon
          setPoints([
            { x: 0.15, y: 0.25 },
            { x: 0.85, y: 0.25 },
            { x: 0.80, y: 0.75 },
            { x: 0.20, y: 0.75 },
          ]);
        }
      })
      .catch((loadError) => active && setError(loadError.message))
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [cameraId, cameraName, isOpen]);

  // Click on canvas to add vertex
  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    setPoints((prev) => [...prev, { x, y }]);
  };

  const handleUndo = () => {
    setPoints((prev) => prev.slice(0, -1));
  };

  const handleReset = () => {
    setPoints([]);
  };

  const handleApplyPreset = (type) => {
    if (type === 'perimeter') {
      setPoints([
        { x: 0.05, y: 0.20 },
        { x: 0.95, y: 0.20 },
        { x: 0.90, y: 0.80 },
        { x: 0.10, y: 0.80 },
      ]);
    } else if (type === 'gate') {
      setPoints([
        { x: 0.30, y: 0.35 },
        { x: 0.70, y: 0.35 },
        { x: 0.65, y: 0.85 },
        { x: 0.35, y: 0.85 },
      ]);
    } else if (type === 'tripwire') {
      setPoints([
        { x: 0.05, y: 0.50 },
        { x: 0.95, y: 0.50 },
        { x: 0.95, y: 0.58 },
        { x: 0.05, y: 0.58 },
      ]);
    }
  };

  // Draw polygon and vertices on canvas
  const drawPolygon = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Dark security background
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#0f172a');
    bgGrad.addColorStop(1, '#020617');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Subtle coordinate grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    if (points.length > 0) {
      // Connect vertices
      ctx.beginPath();
      ctx.moveTo(points[0].x * width, points[0].y * height);

      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x * width, points[i].y * height);
      }

      if (points.length >= 3) {
        ctx.closePath();
        // Zone fill color according to threat level
        if (riskLevel === 'critical') {
          ctx.fillStyle = 'rgba(244, 63, 94, 0.25)';
          ctx.strokeStyle = '#f43f5e';
        } else if (riskLevel === 'high') {
          ctx.fillStyle = 'rgba(249, 115, 22, 0.25)';
          ctx.strokeStyle = '#f97316';
        } else {
          ctx.fillStyle = 'rgba(245, 158, 11, 0.25)';
          ctx.strokeStyle = '#f59e0b';
        }
        ctx.fill();
      } else {
        ctx.strokeStyle = '#38bdf8';
      }

      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Render vertex markers
      points.forEach((point, index) => {
        const px = point.x * width;
        const py = point.y * height;

        // Glowing outer circle
        ctx.beginPath();
        ctx.arc(px, py, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Node number badge
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(px + 8, py - 18, 18, 16);
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.strokeRect(px + 8, py - 18, 18, 16);
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 10px JetBrains Mono, monospace';
        ctx.fillText(String(index + 1), px + 12, py - 6);
      });
    }
  }, [points, riskLevel]);

  useEffect(() => {
    if (isOpen) {
      drawPolygon();
    }
  }, [drawPolygon, isOpen]);

  const handleSave = async () => {
    if (points.length < 3) return;

    const zone = {
      name: name.trim() || `${cameraName} Restricted Zone`,
      type: zoneType,
      risk_level: riskLevel,
      sensitivity: Number(sensitivity),
      points,
    };

    setSaving(true);
    setError(null);
    try {
      const saved = await saveZone(cameraId, zone);
      onSave?.(saved || zone);
      onClose();
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="relative flex max-h-[95vh] w-[880px] max-w-full flex-col overflow-hidden rounded-3xl border border-slate-700 bg-slate-900 shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-2 text-cyan-400">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Detection Zone Editor</h2>
              <p className="text-xs text-slate-400">
                Define polygonal exclusion & tripwire boundaries for {cameraName}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-400">
              <ShieldAlert className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form Options */}
          <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Zone Label
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. North Fence Exclusion Zone"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Zone Behavior
              </label>
              <select
                value={zoneType}
                onChange={(e) => setZoneType(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
              >
                <option value="restricted">Restricted Area</option>
                <option value="loitering">Loitering Zone</option>
                <option value="tripwire">Tripwire Line</option>
                <option value="entry">Entry Portal</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Threat Severity
              </label>
              <select
                value={riskLevel}
                onChange={(e) => setRiskLevel(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
              >
                <option value="critical">Critical Risk</option>
                <option value="high">High Risk</option>
                <option value="medium">Medium Risk</option>
                <option value="low">Low Risk</option>
              </select>
            </div>
          </div>

          {/* Sensitivity & Presets Bar */}
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-xs text-slate-400">
            <div className="flex items-center gap-3">
              <Sliders className="h-4 w-4 text-cyan-400" />
              <span>Sensitivity Threshold:</span>
              <input
                type="range"
                min="10"
                max="100"
                value={sensitivity}
                onChange={(e) => setSensitivity(e.target.value)}
                className="h-1.5 w-28 accent-cyan-400"
              />
              <span className="font-mono font-bold text-white">{sensitivity}%</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-500">Presets:</span>
              <button
                type="button"
                onClick={() => handleApplyPreset('perimeter')}
                className="rounded-lg border border-slate-800 bg-slate-900 px-2 py-1 text-[11px] text-slate-300 hover:text-white"
              >
                Full Perimeter
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('gate')}
                className="rounded-lg border border-slate-800 bg-slate-900 px-2 py-1 text-[11px] text-slate-300 hover:text-white"
              >
                Center Gate
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('tripwire')}
                className="rounded-lg border border-slate-800 bg-slate-900 px-2 py-1 text-[11px] text-slate-300 hover:text-white"
              >
                Tripwire
              </button>
            </div>
          </div>

          {/* Drawing Canvas */}
          <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-slate-700 bg-slate-950 shadow-inner">
            <canvas
              ref={canvasRef}
              width={800}
              height={450}
              onClick={handleCanvasClick}
              className="h-full w-full cursor-crosshair object-cover"
            />
            <div className="pointer-events-none absolute bottom-3 left-3 rounded-lg bg-black/75 px-3 py-1 font-mono text-[11px] text-slate-300 backdrop-blur-sm">
              Points: {points.length} (Min 3 required) · Click to add vertices
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 bg-slate-950/80 px-6 py-4">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Info className="h-4 w-4 text-cyan-400" />
            <span>Connect points sequentially to form polygon boundary.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleUndo}
              disabled={points.length === 0}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:bg-slate-700 hover:text-white disabled:opacity-40"
            >
              <Undo2 className="h-3.5 w-3.5" />
              Undo
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:bg-slate-700 hover:text-white"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Clear
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={points.length < 3 || saving}
              className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-400 bg-cyan-500 px-5 py-2 text-xs font-bold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:bg-cyan-400 disabled:opacity-50"
            >
              <Check className="h-4 w-4" />
              {saving ? 'Saving...' : `Save Zone (${points.length} Pts)`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}