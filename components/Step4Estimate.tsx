'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { Check, Info } from 'lucide-react';
import gsap from 'gsap';
import { cn } from '@/lib/utils';
import { RoofData, TierEstimate, DesiredMaterial } from '@/lib/types';
import { calculateEstimates } from '@/lib/pricing';
import PricingCard from './PricingCard';

interface Step4Props {
	roofData: RoofData;
	desiredMaterial: DesiredMaterial;
	onSelectTier: (tier: TierEstimate) => void;
}

export default function Step4Estimate({ roofData, desiredMaterial, onSelectTier }: Step4Props) {
	const containerRef = useRef<HTMLDivElement>(null);
	const [financeYears, setFinanceYears] = useState(5);

	const estimates = useMemo(
		() => calculateEstimates(roofData.roofAreaSqFt, roofData.pitch, desiredMaterial),
		[roofData.roofAreaSqFt, roofData.pitch, desiredMaterial],
	);

	const mid = estimates[1];

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

	return (
		<div ref={containerRef} className="min-h-screen bg-[#111] pb-20">
			<div className="mx-auto max-w-5xl px-5 sm:px-8">

				{/* Header */}
				<header data-animate className="pt-20 sm:pt-24 pb-10 text-center">
					<div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/[0.07] px-3.5 py-1 mb-5">
						<Check className="h-3 w-3 text-emerald-400" strokeWidth={3} aria-hidden="true" />
						<span className="text-xs font-semibold tracking-wide text-emerald-400">Estimate Ready</span>
					</div>
					<h1 className="font-display text-3xl sm:text-[2.75rem] font-bold text-white mb-3" style={{ textWrap: 'balance' }}>
						Your Roof Estimate
					</h1>
					<p className="text-sm text-neutral-500" style={{ fontVariantNumeric: 'tabular-nums' }}>
						{roofData.roofAreaSqFt.toLocaleString()} sq ft &middot; {roofData.pitch} pitch &middot; {desiredMaterial}
					</p>
				</header>

				{/* Pricing cards */}
				<div data-animate className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-12 sm:items-start">
					{estimates.map((tier, i) => (
						<PricingCard
							key={tier.tierName}
							tier={tier}
							isPopular={i === 1}
							onSelect={() => onSelectTier(tier)}
						/>
					))}
				</div>

				{/* Financing calculator */}
				<div data-animate className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-6 sm:p-8">
					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 mb-6">
						<div>
							<h2 className="font-display text-lg font-bold text-white mb-0.5">Monthly Financing</h2>
							<p className="text-xs text-neutral-500">Based on {mid?.tierName || 'Most Popular'} tier &middot; 6.9% APR</p>
						</div>
						<div
							role="radiogroup"
							aria-label="Financing term"
							className="flex gap-1.5"
						>
							{[3, 5, 7, 10].map((year) => {
								const active = financeYears === year;
								return (
									<button
										key={year}
										role="radio"
										aria-checked={active}
										onClick={() => setFinanceYears(year)}
										className={cn(
											'px-4 py-2 rounded-lg text-xs font-semibold border outline-none',
											'focus-visible:ring-2 focus-visible:ring-emerald-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#111]',
											active
												? 'bg-emerald-500/[0.08] text-emerald-400 border-emerald-500/25'
												: 'text-neutral-500 border-transparent hover:text-neutral-400',
										)}
										style={{ touchAction: 'manipulation', transition: 'background-color 200ms, border-color 200ms, color 200ms' }}
									>
										{year}yr
									</button>
								);
							})}
						</div>
					</div>

					{mid && (
						<div className="flex items-baseline gap-1">
							<span className="font-display font-extrabold text-emerald-400" style={{ fontSize: 'clamp(2.5rem, 6vw, 3.5rem)', fontVariantNumeric: 'tabular-nums' }}>
								${Math.round((mid.totalCost * 1.069) / (financeYears * 12)).toLocaleString()}
							</span>
							<span className="text-lg text-neutral-500">/mo</span>
						</div>
					)}

					<p className="text-xs mt-3 flex items-center gap-1.5 text-neutral-500">
						<Info className="h-3 w-3 shrink-0" aria-hidden="true" />
						Subject to credit approval. Actual rates may vary.
					</p>
				</div>
			</div>
		</div>
	);
}
