'use client';

import { TierEstimate } from '@/lib/types';

interface PricingCardProps {
	tier: TierEstimate;
	isPopular: boolean;
	onSelect: () => void;
}

export default function PricingCard({ tier, isPopular, onSelect }: PricingCardProps) {
	return (
		<div
			className={`pricing-card relative rounded-xl overflow-hidden transition-all group ${
				isPopular ? 'sm:-translate-y-3 sm:scale-[1.02] z-10' : ''
			}`}
			style={{
				background: isPopular ? '#171717' : '#0f0f0f',
				border: isPopular ? '2px solid #88ff57' : '1px solid rgba(255,255,255,0.10)',
				boxShadow: isPopular
					? '0 0 0 1px rgba(136,255,87,0.15), 0 8px 32px rgba(136,255,87,0.10), 0 2px 8px rgba(0,0,0,0.3)'
					: '0 2px 8px rgba(0,0,0,0.2)',
			}}
		>
			{isPopular && <div className="h-[2px] bg-[#88ff57]" />}

			<div className="p-6">
				{/* Label */}
				<div className="flex items-center justify-between mb-1.5">
					<span className={`text-[10px] font-bold tracking-[0.12em] uppercase ${isPopular ? 'text-[#88ff57]' : 'text-[#555]'}`}>
						{tier.tierName}
					</span>
					{isPopular && (
						<span className="text-[9px] font-bold tracking-wider uppercase px-2.5 py-1 rounded bg-[rgba(136,255,87,0.12)] text-[#88ff57] border border-[rgba(136,255,87,0.2)]">
							Recommended
						</span>
					)}
				</div>

				{/* Material */}
				<h3 className="font-display text-lg font-bold text-white mb-0.5">{tier.materialName}</h3>
				<p className="text-xs text-[#555] mb-5">{tier.warranty}</p>

				{/* Price */}
				<div className="mb-5">
					<span className={`tabular font-display text-4xl font-extrabold ${isPopular ? 'text-[#88ff57]' : 'text-white'}`}>
						${tier.totalCost.toLocaleString()}
					</span>
					<div className="text-xs mt-1.5 tabular text-[#555]">
						${tier.costPerSqFt.toFixed(2)} / sq ft
					</div>
				</div>

				{/* Monthly */}
				<div className={`rounded-lg p-3.5 mb-5 border ${
					isPopular
						? 'bg-[rgba(136,255,87,0.06)] border-[rgba(136,255,87,0.15)]'
						: 'bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.06)]'
				}`}>
					<span className={`tabular font-display text-xl font-bold ${isPopular ? 'text-[#88ff57]' : 'text-[#888]'}`}>
						${tier.monthlyPayment}
					</span>
					<span className="text-xs ml-1 text-[#555]">/mo</span>
					<div className="text-[10px] mt-0.5 text-[#555]">60 mo · 6.9% APR</div>
				</div>

				{/* Breakdown */}
				<div className="space-y-2.5 mb-6">
					{[
						{ label: 'Materials', value: tier.breakdown.materials },
						{ label: 'Labor', value: tier.breakdown.labor },
						{ label: 'Tear-off & Removal', value: tier.breakdown.removal },
						{ label: 'Permits & Cleanup', value: tier.breakdown.permits + tier.breakdown.dumpster },
					].map((row) => (
						<div key={row.label} className="flex justify-between items-center">
							<span className="text-xs text-[#555]">{row.label}</span>
							<span className="text-xs tabular font-medium text-[#888]">${row.value.toLocaleString()}</span>
						</div>
					))}
				</div>

				{/* CTA */}
				<button
					onClick={onSelect}
					className={`w-full h-11 rounded-lg text-sm font-bold tracking-wide transition-all hover:-translate-y-px ${
						isPopular
							? 'bg-[#88ff57] text-[#080808] hover:shadow-[0_6px_20px_rgba(136,255,87,0.2)]'
							: 'bg-transparent text-[#888] border border-[rgba(255,255,255,0.16)] hover:border-[rgba(255,255,255,0.25)] hover:text-white'
					}`}
				>
					Select {tier.tierName}
				</button>
			</div>
		</div>
	);
}
