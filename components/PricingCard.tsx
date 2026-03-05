'use client';

import { motion } from 'framer-motion';
import { TierEstimate } from '@/lib/types';

interface PricingCardProps {
	tier: TierEstimate;
	index: number;
	isPopular: boolean;
	onSelect: () => void;
}

export default function PricingCard({ tier, index, isPopular, onSelect }: PricingCardProps) {
	return (
		<motion.div
			className={`relative rounded-2xl overflow-hidden transition-all group ${
				isPopular
					? 'border-2 border-teal-500/60 bg-gradient-to-b from-teal-500/[0.08] to-transparent scale-[1.03] z-10 shadow-2xl shadow-teal-500/10'
					: 'border border-white/[0.06] bg-white/[0.02] hover:border-white/10'
			}`}
			initial={{ opacity: 0, y: 30 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.2 + index * 0.12, type: 'spring', stiffness: 120 }}
		>
			{isPopular && (
				<div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-teal-400 to-transparent" />
			)}

			<div className="p-5 sm:p-6">
				{/* Header */}
				<div className="flex items-center justify-between mb-1">
					<span className={`text-xs font-bold uppercase tracking-widest ${isPopular ? 'text-teal-400' : 'text-white/30'}`}>
						{tier.tierName}
					</span>
					{isPopular && (
						<span className="text-[10px] font-bold uppercase tracking-wider bg-teal-500/15 text-teal-400 px-2 py-0.5 rounded-full border border-teal-500/25">
							Most Popular
						</span>
					)}
				</div>

				{/* Material */}
				<h3 className="font-display text-lg font-bold text-white mb-0.5">{tier.materialName}</h3>
				<p className="text-xs text-white/30 mb-5">{tier.warranty}</p>

				{/* Price */}
				<div className="mb-5">
					<div className="flex items-baseline gap-1">
						<span className={`font-display text-4xl font-extrabold ${isPopular ? 'text-gradient-teal' : 'text-white'}`}>
							${tier.totalCost.toLocaleString()}
						</span>
					</div>
					<div className="text-xs text-white/25 mt-1">
						${tier.costPerSqFt.toFixed(2)} / sq ft
					</div>
				</div>

				{/* Monthly */}
				<div className={`rounded-lg p-3 mb-5 ${isPopular ? 'bg-teal-500/[0.08] border border-teal-500/15' : 'bg-white/[0.03] border border-white/[0.04]'}`}>
					<div className="flex items-baseline gap-1">
						<span className={`font-display text-xl font-bold ${isPopular ? 'text-teal-300' : 'text-white/70'}`}>
							${tier.monthlyPayment}
						</span>
						<span className="text-xs text-white/25">/mo</span>
					</div>
					<div className="text-[10px] text-white/20">60 months · 6.9% APR</div>
				</div>

				{/* Breakdown */}
				<div className="space-y-2 mb-6">
					{[
						{ label: 'Materials', value: tier.breakdown.materials },
						{ label: 'Labor', value: tier.breakdown.labor },
						{ label: 'Removal', value: tier.breakdown.removal },
						{ label: 'Permits & Cleanup', value: tier.breakdown.permits + tier.breakdown.dumpster },
					].map((row) => (
						<div key={row.label} className="flex justify-between items-center">
							<span className="text-xs text-white/30">{row.label}</span>
							<span className="text-xs text-white/50 font-medium">${row.value.toLocaleString()}</span>
						</div>
					))}
				</div>

				{/* CTA */}
				<button
					onClick={onSelect}
					className={`w-full py-3 rounded-xl text-sm font-bold transition-all ${
						isPopular
							? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:from-teal-400 hover:to-cyan-400 shadow-lg shadow-teal-500/20'
							: 'bg-white/[0.06] text-white/70 hover:bg-white/[0.1] hover:text-white border border-white/[0.06]'
					}`}
				>
					Select {tier.tierName}
				</button>
			</div>
		</motion.div>
	);
}
