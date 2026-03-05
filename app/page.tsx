'use client';

import { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { RoofData, DesiredMaterial, ProjectTimeline } from '@/lib/types';
import WizardProgress from '@/components/WizardProgress';
import Step1Welcome from '@/components/Step1Welcome';
import Step3Analysis from '@/components/Step3Analysis';
import Step4Estimate from '@/components/Step4Estimate';
import Step5LeadCapture from '@/components/Step5LeadCapture';

type Step = 'hero' | 'analysis' | 'estimate' | 'lead';

const stepOrder: Step[] = ['hero', 'analysis', 'estimate', 'lead'];

const wizardStepMap: Record<Step, number> = {
	hero: 1,
	analysis: 2,
	estimate: 3,
	lead: 4,
};

const slideVariants = {
	enter: (direction: number) => ({
		x: direction > 0 ? 300 : -300,
		opacity: 0,
	}),
	center: { x: 0, opacity: 1 },
	exit: (direction: number) => ({
		x: direction > 0 ? -300 : 300,
		opacity: 0,
	}),
};

export default function Home() {
	const [step, setStep] = useState<Step>('hero');
	const [direction, setDirection] = useState(1);
	const [roofData, setRoofData] = useState<RoofData | null>(null);
	const [desiredMaterial, setDesiredMaterial] = useState<DesiredMaterial>('asphalt');
	const [timeline, setTimeline] = useState<ProjectTimeline>('no-timeline');

	const goTo = useCallback(
		(next: Step) => {
			const curIdx = stepOrder.indexOf(step);
			const nextIdx = stepOrder.indexOf(next);
			setDirection(nextIdx > curIdx ? 1 : -1);
			setStep(next);
		},
		[step]
	);

	const handleAddressSelected = useCallback(
		(data: RoofData) => {
			setRoofData(data);
			goTo('analysis');
		},
		[goTo]
	);

	return (
		<main className="min-h-screen relative">
			{step !== 'hero' && (
				<WizardProgress currentStep={wizardStepMap[step] as 1 | 2 | 3 | 4 | 5} />
			)}

			<AnimatePresence mode="wait" custom={direction}>
				<motion.div
					key={step}
					custom={direction}
					variants={slideVariants}
					initial="enter"
					animate="center"
					exit="exit"
					transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
					className="min-h-screen"
				>
					{step === 'hero' && (
						<Step1Welcome onAddressSelected={handleAddressSelected} />
					)}

					{step === 'analysis' && roofData && (
						<Step3Analysis
							roofData={roofData}
							desiredMaterial={desiredMaterial}
							timeline={timeline}
							onMaterialChange={setDesiredMaterial}
							onTimelineChange={setTimeline}
							onContinue={() => goTo('estimate')}
							onBack={() => goTo('hero')}
						/>
					)}

					{step === 'estimate' && roofData && (
						<Step4Estimate
							roofData={roofData}
							desiredMaterial={desiredMaterial}
							onGetQuote={() => goTo('lead')}
							onBack={() => goTo('analysis')}
						/>
					)}

					{step === 'lead' && <Step5LeadCapture onBack={() => goTo('estimate')} />}
				</motion.div>
			</AnimatePresence>
		</main>
	);
}
