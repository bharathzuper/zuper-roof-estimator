'use client';

import { motion } from 'framer-motion';

const STEPS = ['Address', 'Analysis', 'Estimate', 'Quote'];

export default function WizardProgress({ currentStep }: { currentStep: number }) {
	if (currentStep <= 1) return null;
	const progress = ((currentStep - 1) / (STEPS.length - 1)) * 100;

	return (
		<div className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-white/5">
			<div className="max-w-3xl mx-auto px-6 py-3">
				<div className="flex items-center justify-between mb-2">
					<span className="text-xs font-medium text-slate-500">
						Step {currentStep} of {STEPS.length}
					</span>
					<span className="text-xs font-medium text-slate-400">
						{STEPS[currentStep - 1]}
					</span>
				</div>
				<div className="h-1 bg-white/5 rounded-full overflow-hidden">
					<motion.div
						className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full"
						initial={{ width: 0 }}
						animate={{ width: `${progress}%` }}
						transition={{ duration: 0.5, ease: 'easeInOut' }}
					/>
				</div>
			</div>
		</div>
	);
}
