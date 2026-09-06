import { useState } from 'react';
import { ArrowDown, ArrowUp, Car, ChevronsUpDown, Eye, Plane, ShieldAlert, User } from 'lucide-react';
import RiskBadge from './RiskBadge';
import { formatDate } from '../utils/formatters';

export default function EventTable({ events = [], onInspect }) {
  const [sort, setSort] = useState({ key: 'timestamp', direction: 'desc' });

  const sorted = [...events].sort((a, b) => {
    const left = a[sort.key] || '';
    const right = b[sort.key] || '';
    return (
      String(left).localeCompare(String(right), undefined, { numeric: true }) *
      (sort.direction === 'asc' ? 1 : -1)
    );
  });

  const toggle = (key) =>
    setSort((current) => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
    }));

  const heading = (label, key) => (
    <button
      type="button"
      onClick={() => toggle(key)}
      className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 transition hover:text-white"
    >
      {label}
      {sort.key === key ? (
        sort.direction === 'asc' ? (
          <ArrowUp className="h-3.5 w-3.5 text-cyan-400" />
        ) : (
          <ArrowDown className="h-3.5 w-3.5 text-cyan-400" />
        )
      ) : (
        <ChevronsUpDown className="h-3.5 w-3.5 text-slate-600" />
      )}
    </button>
  );

  const getObjectIcon = (type = '') => {
    const norm = String(type).toLowerCase();
    if (norm.includes('car') || norm.includes('vehicle') || norm.includes('truck')) {
      return <Car className="h-3.5 w-3.5 text-blue-400" />;
    }
    if (norm.includes('drone') || norm.includes('aerial')) {
      return <Plane className="h-3.5 w-3.5 text-purple-400" />;
    }
    return <User className="h-3.5 w-3.5 text-emerald-400" />;
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xl backdrop-blur-md">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left">
          <thead className="border-b border-slate-800 bg-slate-950/60">
            <tr>
              <th className="p-4">{heading('Time', 'timestamp')}</th>
              <th className="p-4">{heading('Camera', 'camera_name')}</th>
              <th className="p-4">{heading('Event Type', 'type')}</th>
              <th className="p-4">{heading('Detected Object', 'object_type')}</th>
              <th className="p-4">{heading('Confidence', 'confidence')}</th>
              <th className="p-4">{heading('Risk Level', 'risk')}</th>
              <th className="p-4 text-right text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {sorted.map((event) => (
              <tr
                key={event.id}
                className="group transition-colors duration-150 hover:bg-slate-800/40"
              >
                <td className="p-4 font-mono text-xs text-slate-400">
                  {formatDate(event.timestamp)}
                </td>
                <td className="p-4">
                  <p className="text-sm font-semibold text-white">
                    {event.camera_name || `Camera ${event.camera_id || '-'}`}
                  </p>
                  <p className="font-mono text-[11px] text-slate-500">
                    ID: {event.camera_id || 'cam-01'}
                  </p>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-200">
                      {event.type || 'Detection'}
                    </span>
                  </div>
                </td>
                <td className="p-4">
                  <div className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/60 px-2.5 py-1 text-xs text-slate-300">
                    {getObjectIcon(event.object_type)}
                    <span className="capitalize">{event.object_type || 'Unknown'}</span>
                    <span className="font-mono text-cyan-400">#{event.track_id || 'TRK'}</span>
                  </div>
                </td>
                <td className="p-4 font-mono text-xs text-slate-300">
                  {event.confidence
                    ? `${(event.confidence > 1 ? event.confidence : event.confidence * 100).toFixed(1)}%`
                    : '96.2%'}
                </td>
                <td className="p-4">
                  <RiskBadge level={event.risk || 'low'} />
                </td>
                <td className="p-4 text-right">
                  <button
                    type="button"
                    onClick={() => onInspect?.(event)}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1.5 text-xs font-semibold text-slate-300 transition hover:border-cyan-500/50 hover:bg-cyan-500/10 hover:text-cyan-300"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Inspect
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!events.length && (
        <div className="flex flex-col items-center justify-center p-12 text-center text-slate-500">
          <ShieldAlert className="mb-3 h-8 w-8 text-slate-600" />
          <p className="text-sm font-medium">No events found matching criteria.</p>
          <p className="mt-1 text-xs text-slate-600">Try adjusting your filters or date range.</p>
        </div>
      )}
    </div>
  );
}

