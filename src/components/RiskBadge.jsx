const styles = {
	high: 'bg-rose-50 text-rose-700 ring-rose-200',
	critical: 'bg-rose-50 text-rose-700 ring-rose-200',
	medium: 'bg-amber-50 text-amber-700 ring-amber-200',
	low: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
};

export default function RiskBadge({ level = 'unknown' }) {
	const value = String(level).toLowerCase();
	return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ring-1 ${styles[value] || 'bg-slate-50 text-slate-600 ring-slate-200'}`}><span className="h-1.5 w-1.5 rounded-full bg-current" />{value}</span>;
}
