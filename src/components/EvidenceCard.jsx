import { Download, ExternalLink, Eye, ImageOff } from 'lucide-react';
import RiskBadge from './RiskBadge';
import { formatDate } from '../utils/formatters';

export default function EvidenceCard({ evidence, onPreview }) {
  const downloadSnapshot = (e) => {
    e.stopPropagation();
    if (!evidence.snapshot_url) return;
    const link = document.createElement('a');
    link.href = evidence.snapshot_url;
    link.download = `evidence-${evidence.id || 'snapshot'}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <article
      onClick={() => onPreview?.(evidence)}
      className="group relative cursor-pointer overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-700 hover:shadow-2xl"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
        {evidence.snapshot_url ? (
          <img
            src={evidence.snapshot_url}
            alt={`${evidence.event_type || 'Detection'} evidence`}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-600">
            <ImageOff className="h-10 w-10" />
          </div>
        )}

        {/* Overlay Badges */}
        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-3">
          <span className="rounded-full border border-slate-700/80 bg-slate-950/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md">
            {evidence.event_type || 'Detection'}
          </span>
          {evidence.risk && <RiskBadge level={evidence.risk} size="sm" />}
        </div>

        {/* Hover Action Overlay */}
        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-slate-950/60 opacity-0 backdrop-blur-xs transition-opacity duration-200 group-hover:opacity-100">
          <button
            type="button"
            onClick={() => onPreview?.(evidence)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-500/40 bg-cyan-500/20 px-3 py-1.5 text-xs font-semibold text-cyan-300 transition hover:bg-cyan-500/30"
          >
            <Eye className="h-4 w-4" />
            Examine
          </button>
          <button
            type="button"
            onClick={downloadSnapshot}
            title="Download Snapshot"
            className="rounded-xl border border-slate-700 bg-slate-800/80 p-2 text-slate-300 transition hover:bg-slate-700 hover:text-white"
          >
            <Download className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between">
          <h4 className="truncate text-sm font-semibold text-white">
            {evidence.camera_name || `Camera ${evidence.camera_id || 'Alpha'}`}
          </h4>
          <span className="font-mono text-xs text-cyan-400">
            #{evidence.track_id || 'TRK-000'}
          </span>
        </div>

        <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
          <span>{formatDate(evidence.timestamp, { relative: true })}</span>
          <span className="font-mono text-slate-400">
            Conf: <strong className="text-white">{evidence.confidence ? `${(evidence.confidence > 1 ? evidence.confidence : evidence.confidence * 100).toFixed(1)}%` : '96.5%'}</strong>
          </span>
        </div>
      </div>
    </article>
  );
}

