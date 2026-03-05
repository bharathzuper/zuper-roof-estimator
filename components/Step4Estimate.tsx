'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import gsap from 'gsap';
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
		const ctx = gsap.context(() => {
			gsap.from('.est-badge', { y: 16, opacity: 0, duration: 0.5, ease: 'power3.out', delay: 0.2 });
			gsap.from('.est-heading', { y: 30, opacity: 0, duration: 0.7, ease: 'power4.out', delay: 0.35 });
			gsap.from('.est-sub', { y: 12, opacity: 0, duration: 0.5, ease: 'power3.out', delay: 0.5 });
			gsap.from('.pricing-card', { y: 30, opacity: 0, duration: 0.6, ease: 'power3.out', stagger: 0.1, delay: 0.65 });
			gsap.from('.finance-panel', { y: 20, opacity: 0, duration: 0.6, ease: 'power3.out', delay: 1.0 });
		}, containerRef);
		return () => ctx.revert();
	}, []);

	return (
		<div ref={containerRef} className="min-h-screen relative overflow-hidden" style={{ background: 'var(--color-base)' }}>
			{/* Subtle accent glow top-right */}
			<div
				className="absolute pointer-events-none"
				style={{
					width: '500px',
					height: '500px',
					top: '-150px',
					right: '-100px',
					background: 'radial-gradient(circle, rgba(136,255,87,0.06) 0%, transparent 70%)',
				}}
			/>

			<div className="relative z-10 max-w-5xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
				{/* Header */}
				<div className="text-center mb-10">
					<div className="est-badge mb-4">
						<span
							className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.12em] uppercase px-3 py-1.5 rounded-md"
							style={{
								border: '1px solid rgba(136,255,87,0.2)',
								color: 'var(--color-accent)',
								background: 'var(--color-accent-muted)',
							}}
						>
							<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
								<polyline points="20 6 9 17 4 12" />
							</svg>
							Estimate Ready
						</span>
					</div>
					<h2
						className="est-heading font-display font-bold mb-2"
						style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)', color: 'var(--color-text-primary)' }}
					>
						Your Roof Estimate
					</h2>
					<p className="est-sub text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
						<span className="tabular">{roofData.roofAreaSqFt.toLocaleString()} sq ft</span> · {roofData.pitch} pitch · {desiredMaterial}
					</p>
				</div>

				{/* Pricing cards — Better breaks the grid (taller, shifted up) */}
				<div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-14 sm:items-start">
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
				<div
					className="finance-panel rounded-lg p-6 sm:p-8"
					style={{
						background: 'var(--color-surface)',
						border: '1px solid var(--color-border)',
					}}
				>
					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 mb-6">
						<div>
							<h3 className="font-display text-lg font-bold text-white mb-0.5">Monthly Financing</h3>
							<p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
								Based on {mid?.tierName || 'Better'} tier · 6.9% APR
							</p>
						</div>
						<div className="flex gap-1.5">
							{[3, 5, 7, 10].map((year) => (
								<button
									key={year}
									onClick={() => setFinanceYears(year)}
									className="px-4 py-2 rounded-md text-xs font-semibold transition-all"
									style={{
										background: financeYears === year ? 'var(--color-accent-muted)' : 'transparent',
										color: financeYears === year ? 'var(--color-accent)' : 'var(--color-text-tertiary)',
										border: `1px solid ${financeYears === year ? 'rgba(136,255,87,0.25)' : 'transparent'}`,
									}}
								>
									{year}yr
								</button>
							))}
						</div>
					</div>

					{mid && (
						<div className="flex items-baseline gap-1">
							<span className="tabular font-display font-extrabold" style={{ fontSize: 'clamp(2.5rem, 6vw, 3.5rem)', color: 'var(--color-accent)' }}>
								${Math.round((mid.totalCost * 1.069) / (financeYears * 12)).toLocaleString()}
							</span>
							<span className="text-lg" style={{ color: 'var(--color-text-tertiary)' }}>/mo</span>
						</div>
					)}

					<p className="text-xs mt-3 flex items-center gap-1.5" style={{ color: 'var(--color-text-tertiary)' }}>
						<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
							<circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" />
						</svg>
						Subject to credit approval. Actual rates may vary.
					</p>
				</div>
			</div>
		</div>
	);
}
