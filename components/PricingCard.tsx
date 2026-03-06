'use client';

import { cn } from '@/lib/utils';
import { TierEstimate } from '@/lib/types';

interface PricingCardProps {
	tier: TierEstimate;
	isPopular: boolean;
	onSelect: () => void;
}

export default function PricingCard({ tier, isPopular, onSelect }: PricingCardProps) {
	return (
		<div
			className={cn(
				'pricing-card relative rounded-2xl overflow-hidden',
				isPopular ? 'sm:-translate-y-2 z-10 border-2 border-emerald-400' : 'border border-white/[0.06]',
			)}
			style={{
				background: isPopular ? '#1a1a1a' : 'rgba(255,255,255,0.015)',
				boxShadow: isPopular
					? '0 0 0 1px rgba(52,211,153,0.1), 0 8px 32px rgba(52,211,153,0.08)'
					: undefined,
			}}
		>
			{isPopular && <div className="h-0.5 bg-emerald-400" />}

			<div className="p-6">
				{/* Label */}
				<div className="flex items-center justify-between mb-1.5">
					<span className={cn(
						'text-[10px] font-bold tracking-[0.12em] uppercase',
						isPopular ? 'text-emerald-400' : 'text-neutral-500',
					)}>
						{tier.tierName}
					</span>
					{isPopular && (
						<span className="text-[9px] font-bold tracking-wider uppercase px-2.5 py-1 rounded bg-emerald-400/10 text-emerald-400 border border-emerald-400/20">
							Recommended
						</span>
					)}
				</div>

				{/* Material */}
				<h3 className="font-display text-lg font-bold text-white mb-0.5">{tier.materialName}</h3>
				<p className="text-xs text-neutral-500 mb-5">{tier.warranty}</p>

				{/* Price */}
				<div className="mb-5">
					<span
						className={cn(
							'font-display text-4xl font-extrabold',
							isPopular ? 'text-emerald-400' : 'text-white',
						)}
						style={{ fontVariantNumeric: 'tabular-nums' }}
					>
						${tier.totalCost.toLocaleString()}
					</span>
					<div className="text-xs mt-1.5 text-neutral-500" style={{ fontVariantNumeric: 'tabular-nums' }}>
						${tier.costPerSqFt.toFixed(2)} / sq ft
					</div>
				</div>

				{/* Monthly */}
				<div className={cn(
					'rounded-lg p-3.5 mb-5 border',
					isPopular
						? 'bg-emerald-400/[0.04] border-emerald-400/15'
						: 'bg-white/[0.02] border-white/[0.06]',
				)}>
					<span
						className={cn(
							'font-display text-xl font-bold',
							isPopular ? 'text-emerald-400' : 'text-neutral-400',
						)}
						style={{ fontVariantNumeric: 'tabular-nums' }}
					>
						${tier.monthlyPayment}
					</span>
					<span className="text-xs ml-1 text-neutral-500">/mo</span>
					<div className="text-[10px] mt-0.5 text-neutral-600">60 mo &middot; 6.9% APR</div>
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
							<span className="text-xs text-neutral-500">{row.label}</span>
							<span className="text-xs font-medium text-neutral-400" style={{ fontVariantNumeric: 'tabular-nums' }}>
								${row.value.toLocaleString()}
							</span>
						</div>
					))}
				</div>

				{/* CTA */}
				<button
					onClick={onSelect}
					aria-label={`Select ${tier.tierName} plan`}
					className={cn(
						'w-full h-11 rounded-xl text-sm font-bold tracking-wide outline-none',
						'focus-visible:ring-2 focus-visible:ring-emerald-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#111]',
						isPopular
							? 'bg-emerald-400 text-[#111] hover:bg-emerald-300'
							: 'bg-transparent text-neutral-400 border border-white/[0.1] hover:border-white/[0.2] hover:text-white',
					)}
					style={{ touchAction: 'manipulation', transition: 'background-color 200ms, border-color 200ms, color 200ms' }}
				>
					Select {tier.tierName}
				</button>
			</div>
		</div>
	);
}
