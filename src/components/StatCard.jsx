import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';

export default function StatCard({ label, value, icon: Icon, tone = 'blue', trend }) {
	const tones = { blue: 'bg-cyan-50 text-cyan-700', green: 'bg-emerald-50 text-emerald-700', amber: 'bg-amber-50 text-amber-700', red: 'bg-rose-50 text-rose-700', slate: 'bg-slate-100 text-slate-700' };
	const TrendIcon = trend > 0 ? ArrowUpRight : trend < 0 ? ArrowDownRight : Minus;
	return <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex items-start justify-between"><div className={`rounded-xl p-2.5 ${tones[tone] || tones.blue}`}>{Icon && <Icon className="h-5 w-5" />}</div>{trend !== undefined && <span className={`inline-flex items-center gap-1 text-xs font-bold ${trend > 0 ? 'text-emerald-600' : trend < 0 ? 'text-rose-600' : 'text-slate-400'}`}><TrendIcon className="h-3.5 w-3.5" />{Math.abs(trend)}%</span>}</div><p className="mt-5 text-2xl font-bold tracking-tight text-slate-950">{value}</p><p className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p></article>;
}
