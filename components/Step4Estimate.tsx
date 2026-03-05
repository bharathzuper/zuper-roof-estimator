'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { RoofData, DesiredMaterial } from '@/lib/types';
import { calculateEstimates } from '@/lib/pricing';
import PricingCard from './PricingCard';
import AnimatedCounter from './AnimatedCounter';

const FINANCING_OPTIONS = [12, 24, 36, 60];

export default function Step4Estimate({
	roofData,
	desiredMaterial,
	onGetQuote,
	onBack,
}: {
	roofData: RoofData;
	desiredMaterial: DesiredMaterial;
	onGetQuote: () => void;
	onBack: () => void;
}) {
	const [financingMonths, setFinancingMonths] = useState(36);
	const estimates = calculateEstimates(roofData.roofAreaSqFt, roofData.pitch, desiredMaterial);

	return (
		<div className="min-h-screen pt-16 pb-12 px-4 bg-gradient-to-b from-slate-900 to-slate-950">
			<div className="max-w-5xl mx-auto">
				<motion.button
					onClick={onBack}
					className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-300 mb-6 transition-colors"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
				>
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
						<path d="M19 12H5M12 19l-7-7 7-7" />
					</svg>
					Back
				</motion.button>

				<motion.div
					className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 mb-8"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
				>
					<div className="flex flex-col sm:flex-row gap-6">
						<div className="relative w-full sm:w-48 h-36 rounded-xl overflow-hidden shrink-0 border border-white/5">
							<div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${roofData.satelliteImageUrl})` }} />
							<svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
								{roofData.sections.map((s) => (
									<polygon key={s.id} points={s.polygon.map((p) => `${p.x},${p.y}`).join(' ')} fill="rgba(59,130,246,0.25)" stroke="rgba(59,130,246,0.8)" strokeWidth="0.6" />
								))}
							</svg>
						</div>
						<div className="flex-1">
							<h2 className="text-2xl font-bold text-white mb-1">Your Roof Estimate</h2>
							<p className="text-sm text-slate-500 mb-4">
								{roofData.address}{roofData.city ? `, ${roofData.city}, ${roofData.state} ${roofData.zip}` : ''}
							</p>
							<div className="flex flex-wrap gap-3">
								{[
									{ label: 'Area', value: `${roofData.roofAreaSqFt.toLocaleString()} sq ft` },
									{ label: 'Pitch', value: roofData.pitch },
									{ label: 'Sections', value: `${roofData.sections.length}` },
									{ label: 'Stories', value: `${roofData.stories}` },
								].map((item) => (
									<div key={item.label} className="flex items-center gap-2 px-3 py-1.5 bg-white/[0.03] border border-white/5 rounded-lg">
										<span className="text-xs text-slate-500">{item.label}</span>
										<span className="text-sm font-semibold text-white">{item.value}</span>
									</div>
								))}
							</div>
						</div>
					</div>
				</motion.div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
					{estimates.map((est, i) => (
						<PricingCard
							key={est.tier.id}
							estimate={est}
							isPopular={est.tier.id === 'better'}
							delay={0.3 + i * 0.15}
							financingMonths={financingMonths}
						/>
					))}
				</div>

				<motion.div
					className="bg-gradient-to-r from-blue-600/20 to-blue-500/10 border border-blue-500/20 rounded-2xl p-6 mb-8"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.8 }}
				>
					<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
						<div>
							<h3 className="text-lg font-semibold text-white mb-1">Financing Available</h3>
							<p className="text-sm text-slate-400">0% APR for 18 months | Low monthly payments</p>
						</div>
						<div className="flex gap-2">
							{FINANCING_OPTIONS.map((months) => (
								<button
									key={months}
									onClick={() => setFinancingMonths(months)}
									className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
										financingMonths === months
											? 'bg-blue-600 text-white'
											: 'bg-white/5 text-slate-400 hover:bg-white/10'
									}`}
								>
									{months}mo
								</button>
							))}
						</div>
					</div>
					<div className="grid grid-cols-3 gap-4 mt-6">
						{estimates.map((est) => (
							<div key={est.tier.id} className="text-center">
								<div className="text-xs text-slate-400 mb-1">{est.tier.label}</div>
								<div className="text-2xl font-bold text-white">
									<AnimatedCounter value={est.monthlyPayments[financingMonths]} prefix="$" suffix="/mo" className="text-white" />
								</div>
							</div>
						))}
					</div>
				</motion.div>

				<motion.div className="text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
					<button
						onClick={onGetQuote}
						className="inline-flex items-center gap-3 px-10 py-4 bg-blue-600 text-white text-lg font-semibold rounded-full hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/25"
					>
						Get Your Detailed Quote
						<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
							<path d="M5 12h14M12 5l7 7-7 7" />
						</svg>
					</button>
					<p className="text-xs text-slate-600 mt-3">A roofing specialist will prepare a detailed quote tailored to your home</p>
				</motion.div>
			</div>
		</div>
	);
}
