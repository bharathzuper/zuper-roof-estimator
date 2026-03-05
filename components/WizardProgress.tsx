'use client';

import { motion } from 'framer-motion';

const STEPS = [
	{ id: 1, label: 'Address' },
	{ id: 2, label: 'Analysis' },
	{ id: 3, label: 'Estimate' },
	{ id: 4, label: 'Quote' },
];

export default function WizardProgress({ currentStep }: { currentStep: number }) {
	if (currentStep <= 1) return null;

	return (
		<motion.div
			className="fixed top-0 left-0 right-0 z-50"
			initial={{ opacity: 0, y: -10 }}
			animate={{ opacity: 1, y: 0 }}
		>
			{/* Progress bar */}
			<div className="h-0.5 bg-white/[0.04]">
				<motion.div
					className="h-full bg-gradient-to-r from-teal-500 to-cyan-400"
					initial={{ width: '0%' }}
					animate={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
					transition={{ duration: 0.5, ease: 'easeInOut' }}
				/>
			</div>

			{/* Step indicators */}
			<div className="bg-surface/80 backdrop-blur-xl border-b border-white/[0.04]">
				<div className="max-w-4xl mx-auto px-4 py-2.5 flex items-center justify-between">
					<div className="flex items-center gap-1.5">
						<div className="w-5 h-5 rounded-md bg-teal-500 flex items-center justify-center">
							<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
								<path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
							</svg>
						</div>
						<span className="font-display text-xs font-bold text-white/70">zuper</span>
					</div>

					<div className="flex items-center gap-6">
						{STEPS.map((step) => (
							<div key={step.id} className="flex items-center gap-2">
								<div
									className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
										step.id < currentStep
											? 'bg-teal-500 text-white'
											: step.id === currentStep
												? 'bg-teal-500/20 text-teal-400 border border-teal-500/40'
												: 'bg-white/[0.04] text-white/20'
									}`}
								>
									{step.id < currentStep ? (
										<svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
											<polyline points="20 6 9 17 4 12" />
										</svg>
									) : (
										step.id
									)}
								</div>
								<span className={`text-xs font-medium hidden sm:inline ${
									step.id === currentStep ? 'text-white/60' : 'text-white/20'
								}`}>
									{step.label}
								</span>
							</div>
						))}
					</div>
				</div>
			</div>
		</motion.div>
	);
}
