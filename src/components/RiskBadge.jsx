import { getRiskConfig } from '../utils/formatters';

export default function RiskBadge({ level = 'unknown', size = 'sm', showDot = true }) {
  const config = getRiskConfig(level);
  const isHighRisk = ['critical', 'high'].includes(String(level).toLowerCase());

  const sizeClasses = size === 'md' 
    ? 'px-3 py-1 text-xs font-semibold' 
    : 'px-2.5 py-0.5 text-[11px] font-medium';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border uppercase tracking-wider backdrop-blur-sm ${config.bg} ${config.text} ${config.border} ${sizeClasses}`}
    >
      {showDot && (
        <span className="relative flex h-2 w-2">
          {isHighRisk && (
            <span
              className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${config.dot}`}
            />
          )}
          <span className={`relative inline-flex h-2 w-2 rounded-full ${config.dot}`} />
        </span>
      )}
      {config.label}
    </span>
  );
}

