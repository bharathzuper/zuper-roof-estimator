'use client';

import { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { WizardStep, RoofData, DesiredMaterial, ProjectTimeline } from '@/lib/types';
import WizardProgress from '@/components/WizardProgress';
import Step1Welcome from '@/components/Step1Welcome';
import Step2Address from '@/components/Step2Address';
import Step3Analysis from '@/components/Step3Analysis';
import Step4Estimate from '@/components/Step4Estimate';
import Step5LeadCapture from '@/components/Step5LeadCapture';

const slideVariants = {
	enter: (direction: number) => ({
		x: direction > 0 ? 400 : -400,
		opacity: 0,
	}),
	center: {
		x: 0,
		opacity: 1,
	},
	exit: (direction: number) => ({
		x: direction > 0 ? -400 : 400,
		opacity: 0,
	}),
};

export default function Home() {
	const [step, setStep] = useState<WizardStep>(1);
	const [direction, setDirection] = useState(1);
	const [roofData, setRoofData] = useState<RoofData | null>(null);
	const [desiredMaterial, setDesiredMaterial] = useState<DesiredMaterial>('asphalt');
	const [timeline, setTimeline] = useState<ProjectTimeline>('no-timeline');

	const goToStep = useCallback(
		(next: WizardStep) => {
			setDirection(next > step ? 1 : -1);
			setStep(next);
		},
		[step]
	);

	const handleAddressSelected = useCallback(
		(data: RoofData) => {
			setRoofData(data);
			goToStep(3);
		},
		[goToStep]
	);

	return (
		<main className="min-h-screen relative">
			<WizardProgress currentStep={step} />

			<AnimatePresence mode="wait" custom={direction}>
				<motion.div
					key={step}
					custom={direction}
					variants={slideVariants}
					initial="enter"
					animate="center"
					exit="exit"
					transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
					className="min-h-screen"
				>
					{step === 1 && <Step1Welcome onStart={() => goToStep(2)} />}

					{step === 2 && (
						<Step2Address
							onAddressSelected={handleAddressSelected}
							onBack={() => goToStep(1)}
						/>
					)}

					{step === 3 && roofData && (
						<Step3Analysis
							roofData={roofData}
							desiredMaterial={desiredMaterial}
							timeline={timeline}
							onMaterialChange={setDesiredMaterial}
							onTimelineChange={setTimeline}
							onContinue={() => goToStep(4)}
							onBack={() => goToStep(2)}
						/>
					)}

					{step === 4 && roofData && (
						<Step4Estimate
							roofData={roofData}
							desiredMaterial={desiredMaterial}
							onGetQuote={() => goToStep(5)}
							onBack={() => goToStep(3)}
						/>
					)}

					{step === 5 && <Step5LeadCapture onBack={() => goToStep(4)} />}
				</motion.div>
			</AnimatePresence>
		</main>
	);
}
