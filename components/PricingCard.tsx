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
			className={`relative bg-white rounded-2xl overflow-hidden transition-all ${
				isPopular
					? 'ring-2 ring-sky-500 shadow-xl shadow-sky-100/50 scale-[1.02] z-10'
					: 'border border-slate-200 shadow-lg shadow-slate-100/50'
			}`}
			initial={{ opacity: 0, y: 40 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay, duration: 0.5, type: 'spring', stiffness: 100 }}
		>
			{isPopular && (
				<div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-sky-500 to-blue-600 text-white text-xs font-bold tracking-wider uppercase py-1.5 text-center">
					Recommended
				</div>
			)}

			<div className={`p-6 ${isPopular ? 'pt-10' : ''}`}>
				<div className="mb-4">
					<div className="text-xs font-semibold text-sky-600 uppercase tracking-wider">
						{tier.label}
					</div>
					<div className="text-sm text-slate-500 mt-0.5">{tier.tagline}</div>
				</div>

				<div className="relative h-32 rounded-xl overflow-hidden mb-4 bg-slate-100">
					<div
						className="absolute inset-0 bg-cover bg-center"
						style={{ backgroundImage: `url(${tier.materialImage})` }}
					/>
					<div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
					<div className="absolute bottom-2 left-3 text-white text-sm font-semibold">
						{tier.materialName}
					</div>
				</div>

				<div className="mb-4">
					<div className="text-3xl font-bold text-slate-900">
						<AnimatedCounter value={breakdown.total} prefix="$" duration={1} />
					</div>
					<div className="text-xs text-slate-500 mt-1">
						or{' '}
						<span className="font-semibold text-sky-600">
							${monthlyPayments[financingMonths]}/mo
						</span>{' '}
						for {financingMonths} months
					</div>
				</div>

				<div className="text-xs text-slate-600 mb-1 font-medium">{tier.warranty}</div>

				<div className="border-t border-slate-100 pt-3 mt-3">
					<ul className="space-y-2">
						{tier.features.map((f) => (
							<li key={f} className="flex items-start gap-2 text-xs text-slate-600">
								<svg className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
									<polyline points="20 6 9 17 4 12" />
								</svg>
								{f}
							</li>
						))}
					</ul>
				</div>

				<button
					onClick={() => setShowBreakdown(!showBreakdown)}
					className="mt-4 w-full text-xs text-sky-600 font-medium flex items-center justify-center gap-1 hover:text-sky-700 transition-colors"
				>
					{showBreakdown ? 'Hide' : 'View'} breakdown
					<motion.svg
						width="12"
						height="12"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2.5"
						animate={{ rotate: showBreakdown ? 180 : 0 }}
					>
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
							<div className="mt-3 pt-3 border-t border-slate-100 space-y-2 text-xs">
								{[
									{ label: 'Materials', value: breakdown.materials },
									{ label: 'Labor', value: breakdown.labor },
									{ label: 'Tear-off & Disposal', value: breakdown.tearOff },
									{ label: 'Permits & Fees', value: breakdown.permits },
								].map((item) => (
									<div key={item.label} className="flex justify-between text-slate-600">
										<span>{item.label}</span>
										<span className="font-medium">${item.value.toLocaleString()}</span>
									</div>
								))}
								<div className="flex justify-between text-slate-900 font-bold pt-1 border-t border-slate-100">
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
