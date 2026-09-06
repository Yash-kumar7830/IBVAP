import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';

export default function StatCard({
  label,
  value,
  icon: Icon,
  tone = 'cyan',
  trend,
  subtitle,
  onClick,
}) {
  const tones = {
    cyan: {
      iconBg: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.15)]',
      border: 'hover:border-cyan-500/40',
    },
    emerald: {
      iconBg: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.15)]',
      border: 'hover:border-emerald-500/40',
    },
    purple: {
      iconBg: 'bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.15)]',
      border: 'hover:border-purple-500/40',
    },
    amber: {
      iconBg: 'bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.15)]',
      border: 'hover:border-amber-500/40',
    },
    rose: {
      iconBg: 'bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.15)]',
      border: 'hover:border-rose-500/40',
    },
    blue: {
      iconBg: 'bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.15)]',
      border: 'hover:border-blue-500/40',
    },
  };

  const currentTone = tones[tone] || tones.cyan;
  const TrendIcon = trend > 0 ? ArrowUpRight : trend < 0 ? ArrowDownRight : Minus;

  return (
    <article
      onClick={onClick}
      className={`group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl ${
        onClick ? 'cursor-pointer' : ''
      } ${currentTone.border}`}
    >
      <div className="flex items-start justify-between">
        <div className={`rounded-xl p-2.5 transition-transform duration-200 group-hover:scale-105 ${currentTone.iconBg}`}>
          {Icon && <Icon className="h-5 w-5" />}
        </div>
        {trend !== undefined && (
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
              trend > 0
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : trend < 0
                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}
          >
            <TrendIcon className="h-3.5 w-3.5" />
            {trend > 0 ? `+${trend}%` : `${trend}%`}
          </span>
        )}
      </div>

      <div className="mt-4">
        <p className="font-telemetry text-3xl font-bold tracking-tight text-white">
          {value}
        </p>
        <p className="mt-1 text-xs font-medium uppercase tracking-wider text-slate-400">
          {label}
        </p>
        {subtitle && (
          <p className="mt-1 text-[11px] text-slate-500">{subtitle}</p>
        )}
      </div>
    </article>
  );
}

