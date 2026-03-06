'use client';

import { useEffect, useRef } from 'react';
import { ArrowRight, MapPin, Ruler, Layers, ShieldCheck, Triangle, AlertTriangle, Clock, Sparkles } from 'lucide-react';
import gsap from 'gsap';
import { cn } from '@/lib/utils';
import { RoofData, AIRoofAnalysis } from '@/lib/types';
import AnimatedCounter from './AnimatedCounter';
import MapView from './MapView';
import RoofMapOverlay from './RoofMapOverlay';

interface Step3Props {
	roofData: RoofData;
	aiAnalysis: AIRoofAnalysis | null;
	onContinue: () => void;
}

const SECTION_PALETTE = ['#34d399', '#60a5fa', '#f472b6', '#fbbf24'];

const SEVERITY_STYLES = {
	low: { dot: 'bg-emerald-400', bg: 'bg-emerald-400/[0.06]', border: 'border-emerald-400/10', text: 'text-emerald-400' },
	medium: { dot: 'bg-amber-400', bg: 'bg-amber-400/[0.06]', border: 'border-amber-400/10', text: 'text-amber-400' },
	high: { dot: 'bg-red-400', bg: 'bg-red-400/[0.06]', border: 'border-red-400/10', text: 'text-red-400' },
};

const URGENCY_STYLES = {
	routine: { label: 'Routine', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' },
	soon: { label: 'Schedule Soon', color: 'text-amber-400 bg-amber-400/10 border-amber-400/20' },
	urgent: { label: 'Urgent', color: 'text-red-400 bg-red-400/10 border-red-400/20' },
};

function ConditionGauge({ score }: { score: number }) {
	const gaugeRef = useRef<SVGCircleElement>(null);
	const r = 40;
	const circumference = 2 * Math.PI * r;
	const pct = score / 10;
	const offset = circumference - pct * circumference;
	const color = score >= 7 ? '#34d399' : score >= 4.5 ? '#fbbf24' : '#f87171';

	useEffect(() => {
		if (!gaugeRef.current) return;
		gsap.fromTo(gaugeRef.current,
			{ strokeDashoffset: circumference },
			{ strokeDashoffset: offset, duration: 1.2, ease: 'power3.out', delay: 0.3 },
		);
	}, [circumference, offset]);

	return (
		<div className="relative w-28 h-28 shrink-0">
			<svg viewBox="0 0 100 100" className="w-full h-full rotate-[-90deg]">
				<circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
				<circle
					ref={gaugeRef}
					cx="50" cy="50" r={r}
					fill="none"
					stroke={color}
					strokeWidth="6"
					strokeLinecap="round"
					strokeDasharray={circumference}
					strokeDashoffset={circumference}
					style={{ filter: `drop-shadow(0 0 8px ${color}40)` }}
				/>
			</svg>
			<div className="absolute inset-0 flex flex-col items-center justify-center">
				<span className="font-display text-2xl font-bold text-white" style={{ fontVariantNumeric: 'tabular-nums' }}>
					{score}
				</span>
				<span className="text-[9px] font-semibold uppercase tracking-widest text-neutral-500">/10</span>
			</div>
		</div>
	);
}

export default function Step3Analysis({ roofData, aiAnalysis, onContinue }: Step3Props) {
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!containerRef.current) return;
		const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (prefersReduced) return;

		const sections = containerRef.current.querySelectorAll<HTMLElement>('[data-animate]');
		gsap.fromTo(
			sections,
			{ opacity: 0, y: 24 },
			{ opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power3.out', delay: 0.15 },
		);
	}, []);

	const stats = [
		{ icon: Ruler, label: 'Roof Area', value: roofData.roofAreaSqFt, suffix: ' sq ft', animate: true },
		{ icon: Triangle, label: 'Pitch', value: roofData.pitch, suffix: '', animate: false },
		{ icon: Layers, label: 'Sections', value: roofData.sections.length, suffix: '', animate: false },
		{ icon: ShieldCheck, label: 'Confidence', value: roofData.confidence, suffix: '%', animate: true },
	];

	return (
		<div ref={containerRef} className="min-h-screen bg-[#111] pb-20">
			<div className="mx-auto max-w-6xl px-5 sm:px-8">

				{/* Header */}
				<header data-animate className="pt-20 sm:pt-24 pb-10 text-center">
					<div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/[0.07] px-3.5 py-1 mb-5">
						<Sparkles className="h-3 w-3 text-emerald-400" aria-hidden="true" />
						<span className="text-xs font-semibold tracking-wide text-emerald-400">AI Inspection Complete</span>
					</div>

					<h1 className="font-display text-3xl sm:text-[2.75rem] font-bold text-white mb-3" style={{ textWrap: 'balance' }}>
						Your Roof at a Glance
					</h1>
					<p className="inline-flex items-center gap-1.5 text-sm text-neutral-500">
						<MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
						{roofData.address}, {roofData.city}, {roofData.state} {roofData.zip}
					</p>
				</header>

				{/* AI Condition Card */}
				{aiAnalysis && (
					<div data-animate className="mb-8">
						<div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-5 sm:p-6">
							<div className="flex flex-col sm:flex-row items-start gap-5">
								<ConditionGauge score={aiAnalysis.conditionScore} />

								<div className="flex-1 min-w-0">
									<div className="flex flex-wrap items-center gap-2 mb-2">
										<h2 className="font-display text-lg font-bold text-white">
											{aiAnalysis.conditionLabel} Condition
										</h2>
										<span className={cn(
											'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold',
											URGENCY_STYLES[aiAnalysis.urgency].color,
										)}>
											{aiAnalysis.urgency === 'urgent' && <AlertTriangle className="h-2.5 w-2.5" aria-hidden="true" />}
											{aiAnalysis.urgency === 'soon' && <Clock className="h-2.5 w-2.5" aria-hidden="true" />}
											{URGENCY_STYLES[aiAnalysis.urgency].label}
										</span>
									</div>

									<div className="flex items-center gap-3 mb-3">
										<span className="text-xs text-neutral-500">
											Est. age: <span className="text-neutral-300 font-medium">{aiAnalysis.estimatedAge}</span>
										</span>
									</div>

									<p className="text-sm leading-relaxed text-neutral-400">
										{aiAnalysis.summary}
									</p>
								</div>
							</div>
						</div>
					</div>
				)}

				{/* Stats */}
				<div data-animate className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
					{stats.map((s) => {
						const Icon = s.icon;
						return (
							<div key={s.label} className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4 sm:p-5">
								<div className="flex items-center gap-2 mb-2">
									<div className="rounded-lg bg-white/[0.04] p-1.5">
										<Icon className="h-3.5 w-3.5 text-neutral-500" aria-hidden="true" />
									</div>
									<span className="text-[11px] font-semibold uppercase tracking-widest text-neutral-500">{s.label}</span>
								</div>
								<p className="font-display text-[1.7rem] font-bold text-white" style={{ fontVariantNumeric: 'tabular-nums' }}>
									{s.animate ? (
										<><AnimatedCounter value={s.value as number} />{s.suffix}</>
									) : (
										<>{s.value}{s.suffix}</>
									)}
								</p>
							</div>
						);
					})}
				</div>

				{/* Satellite Map with Roof Overlay */}
				<div data-animate className="mb-8">
					<div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] overflow-hidden">
						<div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06]">
							<span className="text-[11px] font-semibold uppercase tracking-widest text-neutral-500">Satellite View</span>
							<div className="flex items-center gap-4">
								<div className="flex gap-2.5">
									{roofData.sections.map((s, i) => (
										<span key={s.id} className="flex items-center gap-1">
											<span className="h-1.5 w-1.5 rounded-full" style={{ background: SECTION_PALETTE[i % SECTION_PALETTE.length] }} />
											<span className="text-[10px] text-neutral-600">{s.id}</span>
										</span>
									))}
								</div>
								<span className="text-[10px] text-neutral-600">Drag to explore</span>
							</div>
						</div>
						<div className="relative aspect-[16/9]">
							<MapView
								center={[roofData.lng, roofData.lat]}
								zoom={19}
								pitch={0}
								bearing={0}
								className="w-full h-full"
							/>
							<RoofMapOverlay sections={roofData.sections} />
						</div>
					</div>
				</div>

				{/* Detected Sections */}
				<div data-animate className="mb-8">
					<h2 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-500 mb-3 px-1">
						Detected Sections
					</h2>
					<div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] divide-y divide-white/[0.04] overflow-hidden">
						{roofData.sections.map((section, i) => {
							const color = SECTION_PALETTE[i % SECTION_PALETTE.length];
							return (
								<div key={section.id} className="flex items-center gap-4 px-5 py-3.5">
									<div
										className="h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
										style={{ background: `${color}12`, color, border: `1px solid ${color}25` }}
									>
										{section.id}
									</div>
									<div className="flex-1 min-w-0">
										<span className="text-sm font-medium text-neutral-200">{section.label}</span>
										{section.pitch && <span className="ml-2 text-xs text-neutral-600">{section.pitch}</span>}
									</div>
									<span className="text-sm font-semibold text-white" style={{ fontVariantNumeric: 'tabular-nums' }}>
										{section.areaSqFt.toLocaleString()} sq ft
									</span>
									{section.azimuth && (
										<span className="hidden sm:block text-[10px] font-medium uppercase tracking-widest text-neutral-600 w-12 text-right">
											{section.azimuth}
										</span>
									)}
								</div>
							);
						})}
					</div>
				</div>

				{/* AI Detected Issues */}
				{aiAnalysis && aiAnalysis.issues.length > 0 && (
					<div data-animate className="mb-10">
						<h2 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-500 mb-3 px-1 flex items-center gap-1.5">
							<Sparkles className="h-3 w-3 text-emerald-400" aria-hidden="true" />
							AI Detected Issues
						</h2>
						<div className="space-y-2">
							{aiAnalysis.issues.map((issue, i) => {
								const style = SEVERITY_STYLES[issue.severity];
								return (
									<div
										key={i}
										className={cn('rounded-2xl border p-4 sm:p-5', style.bg, style.border)}
									>
										<div className="flex items-start gap-3">
											<div className={cn('mt-1 h-2 w-2 rounded-full shrink-0', style.dot)} />
											<div className="flex-1 min-w-0">
												<div className="flex items-center gap-2 mb-1">
													<span className="text-sm font-semibold text-white">{issue.title}</span>
													<span className={cn('text-[10px] font-semibold uppercase tracking-wider', style.text)}>
														{issue.severity}
													</span>
												</div>
												<p className="text-xs leading-relaxed text-neutral-400">{issue.description}</p>
											</div>
										</div>
									</div>
								);
							})}
						</div>
					</div>
				)}

				{/* CTA */}
				<div data-animate>
					<button
						onClick={onContinue}
						aria-label="Continue to choose materials"
						className={cn(
							'w-full h-13 rounded-2xl text-sm font-bold tracking-wide',
							'inline-flex items-center justify-center gap-2 outline-none',
							'focus-visible:ring-2 focus-visible:ring-emerald-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#111]',
							'bg-emerald-500 text-white hover:bg-emerald-400 active:bg-emerald-600',
						)}
						style={{ touchAction: 'manipulation', transition: 'background-color 200ms' }}
					>
						Choose Materials
						<ArrowRight className="h-4 w-4" aria-hidden="true" />
					</button>
				</div>
			</div>
		</div>
	);
}
