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
			className={`pricing-card relative rounded-lg overflow-hidden transition-all group ${
				isPopular ? 'sm:-translate-y-3 z-10' : ''
			}`}
			style={{
				background: isPopular ? 'var(--color-elevated)' : 'var(--color-surface)',
				border: `1px solid ${isPopular ? 'rgba(136,255,87,0.25)' : 'var(--color-border)'}`,
			}}
		>
			{/* Top accent line — only on popular */}
			{isPopular && (
				<div className="h-[2px]" style={{ background: 'var(--color-accent)' }} />
			)}

			<div className="p-5 sm:p-6">
				{/* Label */}
				<div className="flex items-center justify-between mb-1">
					<span
						className="text-[10px] font-bold tracking-[0.12em] uppercase"
						style={{ color: isPopular ? 'var(--color-accent)' : 'var(--color-text-tertiary)' }}
					>
						{tier.tierName}
					</span>
					{isPopular && (
						<span
							className="text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded"
							style={{
								background: 'var(--color-accent-muted)',
								color: 'var(--color-accent)',
								border: '1px solid rgba(136,255,87,0.2)',
							}}
						>
							Recommended
						</span>
					)}
				</div>

				{/* Material */}
				<h3 className="font-display text-lg font-bold text-white mb-0.5">{tier.materialName}</h3>
				<p className="text-xs mb-5" style={{ color: 'var(--color-text-tertiary)' }}>{tier.warranty}</p>

				{/* Price */}
				<div className="mb-5">
					<span className="tabular font-display text-4xl font-extrabold" style={{ color: isPopular ? 'var(--color-accent)' : 'white' }}>
						${tier.totalCost.toLocaleString()}
					</span>
					<div className="text-xs mt-1 tabular" style={{ color: 'var(--color-text-tertiary)' }}>
						${tier.costPerSqFt.toFixed(2)} / sq ft
					</div>
				</div>

				{/* Monthly */}
				<div
					className="rounded-md p-3 mb-5"
					style={{
						background: isPopular ? 'var(--color-accent-muted)' : 'rgba(255,255,255,0.02)',
						border: `1px solid ${isPopular ? 'rgba(136,255,87,0.15)' : 'var(--color-border)'}`,
					}}
				>
					<span className="tabular font-display text-xl font-bold" style={{ color: isPopular ? 'var(--color-accent)' : 'var(--color-text-secondary)' }}>
						${tier.monthlyPayment}
					</span>
					<span className="text-xs ml-1" style={{ color: 'var(--color-text-tertiary)' }}>/mo</span>
					<div className="text-[10px] mt-0.5" style={{ color: 'var(--color-text-tertiary)' }}>60 mo · 6.9% APR</div>
				</div>

				{/* Breakdown */}
				<div className="space-y-2 mb-6">
					{[
						{ label: 'Materials', value: tier.breakdown.materials },
						{ label: 'Labor', value: tier.breakdown.labor },
						{ label: 'Tear-off & Removal', value: tier.breakdown.removal },
						{ label: 'Permits & Cleanup', value: tier.breakdown.permits + tier.breakdown.dumpster },
					].map((row) => (
						<div key={row.label} className="flex justify-between items-center">
							<span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>{row.label}</span>
							<span className="text-xs tabular font-medium" style={{ color: 'var(--color-text-secondary)' }}>
								${row.value.toLocaleString()}
							</span>
						</div>
					))}
				</div>

				{/* CTA */}
				<button
					onClick={onSelect}
					className="w-full py-3 rounded-md text-sm font-bold tracking-wide transition-all hover:-translate-y-px"
					style={{
						background: isPopular ? 'var(--color-accent)' : 'transparent',
						color: isPopular ? '#080808' : 'var(--color-text-secondary)',
						border: isPopular ? 'none' : '1px solid var(--color-border-strong)',
					}}
				>
					Select {tier.tierName}
				</button>
			</div>
		</div>
	);
}
