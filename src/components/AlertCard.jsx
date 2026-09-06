import { AlertTriangle, ArrowUpRight, Check, Clock, Eye, MapPin } from 'lucide-react';
import RiskBadge from './RiskBadge';
import { formatRelativeTime } from '../utils/formatters';

export default function AlertCard({ alert, onAcknowledge, onInvestigate }) {
  const risk = alert.risk_level || alert.risk || 'unknown';
  const isPending = alert.status === 'active' || !alert.status;

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 p-4 backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-700 hover:shadow-xl">
      <div className="flex items-start gap-3.5">
        {/* Risk Icon or Snapshot Thumbnail */}
        {alert.snapshot_url ? (
          <div className="relative h-14 w-20 flex-shrink-0 overflow-hidden rounded-xl border border-slate-700 bg-slate-950">
            <img
              src={alert.snapshot_url}
              alt={alert.type || 'Alert preview'}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
            <span className="absolute bottom-1 right-1 rounded bg-black/75 px-1 font-mono text-[9px] text-white">
              {alert.object_type || 'AI'}
            </span>
          </div>
        ) : (
          <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-2.5 text-rose-400">
            <AlertTriangle className="h-5 w-5" />
          </div>
        )}

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-sm font-semibold text-white">
              {alert.type || 'Security Alert'}
            </h3>
            <RiskBadge level={risk} size="sm" />
            {alert.status && (
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                  alert.status === 'active'
                    ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                    : alert.status === 'acknowledged'
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                }`}
              >
                {alert.status}
              </span>
            )}
          </div>

          <p className="mt-1 line-clamp-1 text-xs text-slate-400">
            {alert.details || 'Threat detected by surveillance AI analytics.'}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3 text-slate-500" />
              {alert.camera_name || `Camera ${alert.camera_id || 'Alpha'}`}
            </span>
            <span className="inline-flex items-center gap-1 font-mono">
              <Clock className="h-3 w-3 text-slate-500" />
              {formatRelativeTime(alert.timestamp)}
            </span>
            {alert.track_id && (
              <span className="font-mono text-cyan-400">
                #{alert.track_id}
              </span>
            )}
          </div>
        </div>

        {/* Open Details Action */}
        {onInvestigate && (
          <button
            type="button"
            onClick={() => onInvestigate(alert)}
            title="Investigate incident"
            className="rounded-lg border border-slate-800 p-2 text-slate-400 transition hover:border-cyan-500/40 hover:bg-slate-800 hover:text-white"
          >
            <ArrowUpRight className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Action Bar */}
      <div className="mt-3 flex items-center justify-between border-t border-slate-800/80 pt-2.5">
        <span className="text-[11px] text-slate-400">
          Confidence: <span className="font-mono text-white">{alert.confidence ? `${(alert.confidence * 100).toFixed(1)}%` : '95.4%'}</span>
        </span>
        <div className="flex items-center gap-2">
          {onInvestigate && (
            <button
              type="button"
              onClick={() => onInvestigate(alert)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/60 px-2.5 py-1 text-xs font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              <Eye className="h-3.5 w-3.5" />
              Inspect
            </button>
          )}
          {isPending && onAcknowledge && (
            <button
              type="button"
              onClick={() => onAcknowledge(alert)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-400 transition hover:bg-emerald-500/25"
            >
              <Check className="h-3.5 w-3.5" />
              Acknowledge
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

