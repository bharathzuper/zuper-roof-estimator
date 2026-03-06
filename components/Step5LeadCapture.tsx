'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { Check, ArrowRight } from 'lucide-react';
import gsap from 'gsap';
import { cn } from '@/lib/utils';
import { LeadFormData, RoofData, DesiredMaterial, ProjectTimeline, AIRoofAnalysis } from '@/lib/types';
import { calculateEstimates } from '@/lib/pricing';

interface Step5Props {
	roofData: RoofData;
	desiredMaterial: DesiredMaterial;
	timeline: ProjectTimeline;
	aiAnalysis?: AIRoofAnalysis | null;
	onSubmit?: (data: LeadFormData) => void;
}

export default function Step5LeadCapture({ roofData, desiredMaterial, timeline, aiAnalysis, onSubmit }: Step5Props) {
	const containerRef = useRef<HTMLDivElement>(null);
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [phone, setPhone] = useState('');
	const [contactPref, setContactPref] = useState<'email' | 'call' | 'text'>('email');
	const [projectNotes, setProjectNotes] = useState('');
	const [submitted, setSubmitted] = useState(false);

	const { low, mid, high } = useMemo(() => {
		const tiers = calculateEstimates(roofData.roofAreaSqFt, roofData.pitch, desiredMaterial);
		return {
			low: tiers[0],
			mid: tiers.find((t) => t.tierName === 'Most Popular') ?? tiers[1] ?? tiers[0],
			high: tiers[tiers.length - 1],
		};
	}, [roofData, desiredMaterial]);

	function roundToNearest(n: number, nearest: number) {
		return Math.round(n / nearest) * nearest;
	}

	const rangeLow = roundToNearest(low.totalCost, 500);
	const rangeHigh = roundToNearest(high.totalCost, 500);

	useEffect(() => {
		if (!containerRef.current) return;
		const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (prefersReduced) return;

		const sections = containerRef.current.querySelectorAll<HTMLElement>('[data-animate]');
		gsap.fromTo(
			sections,
			{ opacity: 0, y: 20 },
			{ opacity: 1, y: 0, duration: 0.45, stagger: 0.07, ease: 'power3.out', delay: 0.15 },
		);
	}, []);

	useEffect(() => {
		if (!submitted || !containerRef.current) return;
		const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (prefersReduced) return;

		gsap.from('.success-icon', { scale: 0, duration: 0.6, ease: 'back.out(1.7)' });
		gsap.from('.success-text', { y: 20, opacity: 0, duration: 0.5, ease: 'power3.out', delay: 0.3 });
	}, [submitted]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!name || !email) return;
		onSubmit?.({ name, email, phone, preferredContact: contactPref });
		setSubmitted(true);
	};

	const timelineLabel = timeline === 'now' ? 'ASAP' : timeline === '1-3months' ? '1–3 months' : 'Flexible';

	if (submitted) {
		return (
			<div ref={containerRef} className="min-h-screen bg-[#111] flex items-center justify-center px-5">
				<div className="text-center">
					<div className="success-icon mx-auto w-20 h-20 rounded-2xl mb-6 flex items-center justify-center bg-zuper-500/10 border border-zuper-500/25">
						<Check className="h-9 w-9 text-zuper-500" strokeWidth={2.5} aria-hidden="true" />
					</div>
					<div className="success-text">
						<h1 className="font-display font-bold text-white mb-2 text-3xl sm:text-4xl" style={{ textWrap: 'balance' }}>
							You&apos;re All Set!
						</h1>
						<p className="text-sm text-neutral-500 max-w-sm mx-auto leading-relaxed">
							A certified roofer will reach out within 24 hours to schedule an inspection and provide your exact <span className="text-zuper-400 font-medium">{mid.materialName}</span> quote.
						</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div ref={containerRef} className="min-h-screen bg-[#111] pb-20">
			<div className="mx-auto max-w-md px-5 sm:px-0">

				{/* Estimate summary banner */}
				<div data-animate className="pt-20 sm:pt-24 mb-8">
					<div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-5">
						<div className="flex items-center justify-between mb-3">
							<div>
								<div className="text-[10px] font-semibold tracking-[0.12em] uppercase text-neutral-500 mb-0.5">Estimated Range</div>
								<span className="font-display text-base font-bold text-white">{mid.materialName}</span>
							</div>
							<div className="text-right">
								<div className="font-display text-xl sm:text-2xl font-extrabold text-zuper-400" style={{ fontVariantNumeric: 'tabular-nums' }}>
									${rangeLow.toLocaleString()} &ndash; ${rangeHigh.toLocaleString()}
								</div>
								<div className="text-xs text-neutral-500">
									{timelineLabel}
								</div>
							</div>
						</div>
						<div className="flex flex-wrap items-center gap-2 pt-3 border-t border-white/[0.04]">
							<span className="text-[10px] text-neutral-600" style={{ fontVariantNumeric: 'tabular-nums' }}>
								{roofData.roofAreaSqFt.toLocaleString()} sq ft
							</span>
							{aiAnalysis && (
								<>
									<span className="text-neutral-700">&middot;</span>
									<span className="text-[10px] text-neutral-600">
										AI Score: <span className={cn(
											'font-semibold',
											aiAnalysis.conditionScore >= 7 ? 'text-ai-400' : aiAnalysis.conditionScore >= 4.5 ? 'text-amber-400' : 'text-red-400',
										)}>{aiAnalysis.conditionScore}/10</span>
									</span>
								</>
							)}
							<span className="text-neutral-700">&middot;</span>
							<span className="text-[10px] text-neutral-600 italic">Based on AI analysis &mdash; final quote may vary</span>
						</div>
					</div>
				</div>

				{/* Heading */}
				<div data-animate className="mb-8">
					<h1 className="font-display font-bold text-white mb-1 text-2xl sm:text-3xl" style={{ textWrap: 'balance' }}>
						Get Your Detailed Quote
					</h1>
					<p className="text-sm text-neutral-500">
						A certified roofer will inspect your roof and provide an exact, no-obligation quote.
					</p>
				</div>

				{/* Form */}
				<form onSubmit={handleSubmit} className="space-y-5" noValidate>
					<div data-animate>
						<label htmlFor="lead-name" className="block text-xs font-medium text-neutral-400 mb-1.5">Full Name *</label>
						<input
							id="lead-name"
							name="name"
							type="text"
							autoComplete="name"
							required
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder="Jane Smith\u2026"
							className="w-full h-11 px-3.5 text-sm text-white bg-white/[0.03] border border-white/[0.08] rounded-xl outline-none placeholder:text-neutral-600 focus-visible:border-zuper-500/40 focus-visible:ring-2 focus-visible:ring-zuper-500/20"
						/>
					</div>

					<div data-animate>
						<label htmlFor="lead-email" className="block text-xs font-medium text-neutral-400 mb-1.5">Email *</label>
						<input
							id="lead-email"
							name="email"
							type="email"
							autoComplete="email"
							spellCheck={false}
							required
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder="jane@example.com\u2026"
							className="w-full h-11 px-3.5 text-sm text-white bg-white/[0.03] border border-white/[0.08] rounded-xl outline-none placeholder:text-neutral-600 focus-visible:border-zuper-500/40 focus-visible:ring-2 focus-visible:ring-zuper-500/20"
						/>
					</div>

					<div data-animate>
						<label htmlFor="lead-phone" className="block text-xs font-medium text-neutral-400 mb-1.5">Phone</label>
						<input
							id="lead-phone"
							name="phone"
							type="tel"
							autoComplete="tel"
							inputMode="tel"
							value={phone}
							onChange={(e) => setPhone(e.target.value)}
							placeholder="(555) 000-0000\u2026"
							className="w-full h-11 px-3.5 text-sm text-white bg-white/[0.03] border border-white/[0.08] rounded-xl outline-none placeholder:text-neutral-600 focus-visible:border-zuper-500/40 focus-visible:ring-2 focus-visible:ring-zuper-500/20"
						/>
					</div>

					{/* Contact preference */}
					<div data-animate>
						<span className="block text-xs font-medium text-neutral-400 mb-2">Preferred Contact</span>
						<div
							role="radiogroup"
							aria-label="Preferred contact method"
							className="flex gap-2"
						>
							{(['email', 'call', 'text'] as const).map((opt) => {
								const active = contactPref === opt;
								return (
									<button
										key={opt}
										type="button"
										role="radio"
										aria-checked={active}
										onClick={() => setContactPref(opt)}
										className={cn(
											'flex-1 h-10 rounded-xl text-xs font-semibold capitalize border outline-none',
											'focus-visible:ring-2 focus-visible:ring-zuper-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#111]',
											active
												? 'bg-zuper-500/[0.08] text-zuper-400 border-zuper-500/25'
												: 'text-neutral-500 border-white/[0.08] hover:border-white/[0.14] hover:text-neutral-400',
										)}
										style={{ touchAction: 'manipulation', transition: 'background-color 200ms, border-color 200ms, color 200ms' }}
									>
										{opt}
									</button>
								);
							})}
						</div>
					</div>

					{/* Project notes */}
					<div data-animate>
						<label htmlFor="lead-notes" className="block text-xs font-medium text-neutral-400 mb-1.5">
							Tell us about your project <span className="text-neutral-600">(optional)</span>
						</label>
						<textarea
							id="lead-notes"
							name="notes"
							rows={3}
							value={projectNotes}
							onChange={(e) => setProjectNotes(e.target.value)}
							placeholder="Provide any additional details which will help us prepare your roofing estimate\u2026"
							className="w-full px-3.5 py-3 text-sm text-white bg-white/[0.03] border border-white/[0.08] rounded-xl outline-none placeholder:text-neutral-600 focus-visible:border-zuper-500/40 focus-visible:ring-2 focus-visible:ring-zuper-500/20 resize-none"
						/>
					</div>

					{/* Submit */}
					<div data-animate>
						<button
							type="submit"
							disabled={!name || !email}
							className={cn(
								'w-full h-13 rounded-2xl text-sm font-bold tracking-wide',
								'inline-flex items-center justify-center gap-2 outline-none',
								'focus-visible:ring-2 focus-visible:ring-zuper-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#111]',
								'disabled:opacity-25 disabled:cursor-not-allowed',
								'bg-zuper-500 text-white hover:bg-zuper-400 active:bg-zuper-600',
							)}
							style={{ touchAction: 'manipulation', transition: 'background-color 200ms, opacity 200ms' }}
						>
							Get My Detailed Quote
							<ArrowRight className="h-4 w-4" aria-hidden="true" />
						</button>
					</div>

					<p data-animate className="text-center text-[10px] text-neutral-600 mt-3">
						By submitting, you agree to our Terms and Privacy Policy.
					</p>
				</form>
			</div>
		</div>
	);
}
