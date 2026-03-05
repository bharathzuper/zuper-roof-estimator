'use client';

import { motion } from 'framer-motion';
import { WizardStep } from '@/lib/types';

const STEPS: { step: WizardStep; label: string }[] = [
	{ step: 1, label: 'Welcome' },
	{ step: 2, label: 'Address' },
	{ step: 3, label: 'Analysis' },
	{ step: 4, label: 'Estimate' },
	{ step: 5, label: 'Quote' },
];

export default function WizardProgress({ currentStep }: { currentStep: WizardStep }) {
	if (currentStep === 1) return null;

	const progress = ((currentStep - 1) / (STEPS.length - 1)) * 100;

	return (
		<div className="fixed top-0 left-0 right-0 z-50 glass">
			<div className="max-w-3xl mx-auto px-6 py-3">
				<div className="flex items-center justify-between mb-2">
					<span className="text-xs font-medium text-slate-500">
						Step {currentStep} of {STEPS.length}
					</span>
					<span className="text-xs font-medium text-slate-500">
						{STEPS[currentStep - 1].label}
					</span>
				</div>
				<div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
					<motion.div
						className="h-full bg-gradient-to-r from-sky-500 to-blue-600 rounded-full"
						initial={{ width: 0 }}
						animate={{ width: `${progress}%` }}
						transition={{ duration: 0.5, ease: 'easeInOut' }}
					/>
				</div>
			</div>
		</div>
	);
}
