'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { RoofData, TierEstimate, DesiredMaterial } from '@/lib/types';
import { calculateEstimates } from '@/lib/pricing';
import PricingCard from './PricingCard';

interface Step4Props {
	roofData: RoofData;
	desiredMaterial: DesiredMaterial;
	onSelectTier: (tier: TierEstimate) => void;
}

export default function Step4Estimate({ roofData, desiredMaterial, onSelectTier }: Step4Props) {
	const [financeYears, setFinanceYears] = useState(5);

	const estimates = useMemo(
		() => calculateEstimates(roofData.roofAreaSqFt, roofData.pitch, desiredMaterial),
		[roofData.roofAreaSqFt, roofData.pitch, desiredMaterial],
	);

	const midEstimate = estimates[1];

	return (
		<div className="min-h-screen bg-surface relative overflow-hidden">
			{/* Ambient glow */}
			<div className="absolute top-0 right-0 w-[600px] h-[600px] bg-teal-500/[0.03] blur-[150px] rounded-full pointer-events-none" />
			<div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-cyan-500/[0.03] blur-[120px] rounded-full pointer-events-none" />

			<div className="relative z-10 max-w-5xl mx-auto px-4 py-12 sm:py-16">
				{/* Header */}
				<motion.div
					className="text-center mb-10"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
				>
					<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-xs text-teal-400 font-semibold uppercase tracking-wider mb-4">
						<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
						Estimate Ready
					</div>
					<h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-2">
						Your Roof Estimate
					</h2>
					<p className="text-white/40 text-sm max-w-md mx-auto">
						{roofData.roofAreaSqFt.toLocaleString()} sq ft · {roofData.pitch} pitch · {desiredMaterial} shingles
					</p>
				</motion.div>

				{/* Pricing cards */}
				<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-3 mb-12 sm:items-start">
					{estimates.map((tier, i) => (
						<PricingCard
							key={tier.tierName}
							tier={tier}
							index={i}
							isPopular={i === 1}
							onSelect={() => onSelectTier(tier)}
						/>
					))}
				</div>

				{/* Financing calculator */}
				<motion.div
					className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 sm:p-8"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.5 }}
				>
					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
						<div>
							<h3 className="font-display text-lg font-bold text-white mb-1">Monthly Financing</h3>
							<p className="text-xs text-white/30">Based on {midEstimate?.tierName || 'Better'} tier · 6.9% APR</p>
						</div>

						<div className="flex items-center gap-4">
							{[3, 5, 7, 10].map((year) => (
								<button
									key={year}
									onClick={() => setFinanceYears(year)}
									className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
										financeYears === year
											? 'bg-teal-500/15 text-teal-400 border border-teal-500/30'
											: 'text-white/30 hover:text-white/50 border border-transparent'
									}`}
								>
									{year}yr
								</button>
							))}
						</div>
					</div>

					{midEstimate && (
						<div className="mt-6 flex items-baseline gap-1">
							<span className="font-display text-5xl font-extrabold text-gradient-teal">
								${Math.round(midEstimate.totalCost / (financeYears * 12) * 1.069).toLocaleString()}
							</span>
							<span className="text-lg text-white/30">/mo</span>
						</div>
					)}

					<div className="mt-3 flex items-center gap-2">
						<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/20">
							<circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" />
						</svg>
						<span className="text-xs text-white/20">Subject to credit approval. Actual rates may vary.</span>
					</div>
				</motion.div>
			</div>
		</div>
	);
}
