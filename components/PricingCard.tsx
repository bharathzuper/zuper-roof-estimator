'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TierEstimate } from '@/lib/types';
import AnimatedCounter from './AnimatedCounter';

export default function PricingCard({
	estimate,
	isPopular,
	delay,
	financingMonths,
}: {
	estimate: TierEstimate;
	isPopular: boolean;
	delay: number;
	financingMonths: number;
}) {
	const [showBreakdown, setShowBreakdown] = useState(false);
	const { tier, breakdown, monthlyPayments } = estimate;

	return (
		<motion.div
			className={`relative rounded-2xl overflow-hidden transition-all ${
				isPopular
					? 'bg-gradient-to-b from-blue-500/10 to-blue-500/5 ring-1 ring-blue-500/30 shadow-2xl shadow-blue-500/10 scale-[1.02] z-10'
					: 'bg-white/[0.03] border border-white/5'
			}`}
			initial={{ opacity: 0, y: 40 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay, duration: 0.5, type: 'spring', stiffness: 100 }}
		>
			{isPopular && (
				<div className="bg-blue-600 text-white text-xs font-bold tracking-wider uppercase py-1.5 text-center">
					Recommended
				</div>
			)}

			<div className={`p-6 ${isPopular ? '' : 'pt-8'}`}>
				<div className="mb-4">
					<div className="text-xs font-semibold text-blue-400 uppercase tracking-wider">{tier.label}</div>
					<div className="text-sm text-slate-500 mt-0.5">{tier.tagline}</div>
				</div>

				<div className="relative h-28 rounded-xl overflow-hidden mb-4 bg-slate-800/50">
					<div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${tier.materialImage})` }} />
					<div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
					<div className="absolute bottom-2 left-3 text-white text-sm font-semibold">{tier.materialName}</div>
				</div>

				<div className="mb-4">
					<div className="text-3xl font-bold text-white">
						<AnimatedCounter value={breakdown.total} prefix="$" duration={1} className="text-white" />
					</div>
					<div className="text-xs text-slate-500 mt-1">
						or <span className="font-semibold text-blue-400">${monthlyPayments[financingMonths]}/mo</span> for {financingMonths} months
					</div>
				</div>

				<div className="text-xs text-slate-400 mb-1 font-medium">{tier.warranty}</div>

				<div className="border-t border-white/5 pt-3 mt-3">
					<ul className="space-y-2">
						{tier.features.map((f) => (
							<li key={f} className="flex items-start gap-2 text-xs text-slate-400">
								<svg className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
									<polyline points="20 6 9 17 4 12" />
								</svg>
								{f}
							</li>
						))}
					</ul>
				</div>

				<button
					onClick={() => setShowBreakdown(!showBreakdown)}
					className="mt-4 w-full text-xs text-blue-400 font-medium flex items-center justify-center gap-1 hover:text-blue-300 transition-colors"
				>
					{showBreakdown ? 'Hide' : 'View'} breakdown
					<motion.svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" animate={{ rotate: showBreakdown ? 180 : 0 }}>
						<polyline points="6 9 12 15 18 9" />
					</motion.svg>
				</button>

				<AnimatePresence>
					{showBreakdown && (
						<motion.div
							initial={{ height: 0, opacity: 0 }}
							animate={{ height: 'auto', opacity: 1 }}
							exit={{ height: 0, opacity: 0 }}
							className="overflow-hidden"
						>
							<div className="mt-3 pt-3 border-t border-white/5 space-y-2 text-xs">
								{[
									{ label: 'Materials', value: breakdown.materials },
									{ label: 'Labor', value: breakdown.labor },
									{ label: 'Tear-off & Disposal', value: breakdown.tearOff },
									{ label: 'Permits & Fees', value: breakdown.permits },
								].map((item) => (
									<div key={item.label} className="flex justify-between text-slate-400">
										<span>{item.label}</span>
										<span className="font-medium text-slate-300">${item.value.toLocaleString()}</span>
									</div>
								))}
								<div className="flex justify-between text-white font-bold pt-1 border-t border-white/5">
									<span>Total</span>
									<span>${breakdown.total.toLocaleString()}</span>
								</div>
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</motion.div>
	);
}
