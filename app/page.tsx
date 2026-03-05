'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RoofData, DesiredMaterial, ProjectTimeline, TierEstimate } from '@/lib/types';
import WizardProgress from '@/components/WizardProgress';
import Step1Welcome from '@/components/Step1Welcome';
import Step3Analysis from '@/components/Step3Analysis';
import Step4Estimate from '@/components/Step4Estimate';
import Step5LeadCapture from '@/components/Step5LeadCapture';

type WizardStep = 'hero' | 'analysis' | 'estimate' | 'lead';

const stepToNumber: Record<WizardStep, number> = {
	hero: 1,
	analysis: 2,
	estimate: 3,
	lead: 4,
};

export default function Home() {
	const [step, setStep] = useState<WizardStep>('hero');
	const [roofData, setRoofData] = useState<RoofData | null>(null);
	const [desiredMaterial, setDesiredMaterial] = useState<DesiredMaterial>('asphalt');
	const [selectedTier, setSelectedTier] = useState<TierEstimate | null>(null);

	const handleAddressSelected = useCallback((data: RoofData) => {
		setRoofData(data);
		setStep('analysis');
	}, []);

	const handleAnalysisContinue = useCallback((material: DesiredMaterial, _timeline: ProjectTimeline) => {
		setDesiredMaterial(material);
		setStep('estimate');
	}, []);

	const handleTierSelected = useCallback((tier: TierEstimate) => {
		setSelectedTier(tier);
		setStep('lead');
	}, []);

	return (
		<main className="relative">
			<WizardProgress currentStep={stepToNumber[step]} />

			<AnimatePresence mode="wait">
				{step === 'hero' && (
					<motion.div
						key="hero"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.4 }}
					>
						<Step1Welcome onAddressSelected={handleAddressSelected} />
					</motion.div>
				)}

				{step === 'analysis' && roofData && (
					<motion.div
						key="analysis"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.4 }}
					>
						<Step3Analysis roofData={roofData} onContinue={handleAnalysisContinue} />
					</motion.div>
				)}

				{step === 'estimate' && roofData && (
					<motion.div
						key="estimate"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.4 }}
					>
						<Step4Estimate roofData={roofData} desiredMaterial={desiredMaterial} onSelectTier={handleTierSelected} />
					</motion.div>
				)}

				{step === 'lead' && roofData && selectedTier && (
					<motion.div
						key="lead"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.4 }}
					>
						<Step5LeadCapture selectedTier={selectedTier} roofData={roofData} />
					</motion.div>
				)}
			</AnimatePresence>
		</main>
	);
}
