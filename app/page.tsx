'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import gsap from 'gsap';
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
	const mainRef = useRef<HTMLDivElement>(null);

	const transitionTo = useCallback((nextStep: WizardStep) => {
		if (!mainRef.current) {
			setStep(nextStep);
			return;
		}
		gsap.to(mainRef.current, {
			opacity: 0,
			y: -20,
			duration: 0.35,
			ease: 'power2.in',
			onComplete: () => {
				setStep(nextStep);
				window.scrollTo(0, 0);
				gsap.fromTo(
					mainRef.current,
					{ opacity: 0, y: 20 },
					{ opacity: 1, y: 0, duration: 0.45, ease: 'power3.out', delay: 0.05 },
				);
			},
		});
	}, []);

	const handleAddressSelected = useCallback(
		(data: RoofData) => {
			setRoofData(data);
			transitionTo('analysis');
		},
		[transitionTo],
	);

	const handleAnalysisContinue = useCallback(
		(material: DesiredMaterial, _timeline: ProjectTimeline) => {
			setDesiredMaterial(material);
			transitionTo('estimate');
		},
		[transitionTo],
	);

	const handleTierSelected = useCallback(
		(tier: TierEstimate) => {
			setSelectedTier(tier);
			transitionTo('lead');
		},
		[transitionTo],
	);

	// Lenis smooth scroll (only for scrollable steps, not the hero)
	useEffect(() => {
		if (step === 'hero') return;

		let lenis: InstanceType<typeof import('lenis').default> | null = null;
		let raf: number;

		import('lenis').then(({ default: Lenis }) => {
			lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
			function tick(time: number) {
				lenis?.raf(time);
				raf = requestAnimationFrame(tick);
			}
			raf = requestAnimationFrame(tick);
		});

		return () => {
			cancelAnimationFrame(raf);
			lenis?.destroy();
		};
	}, [step]);

	return (
		<main>
			<WizardProgress currentStep={stepToNumber[step]} />
			<div ref={mainRef}>
				{step === 'hero' && <Step1Welcome onAddressSelected={handleAddressSelected} />}
				{step === 'analysis' && roofData && <Step3Analysis roofData={roofData} onContinue={handleAnalysisContinue} />}
				{step === 'estimate' && roofData && <Step4Estimate roofData={roofData} desiredMaterial={desiredMaterial} onSelectTier={handleTierSelected} />}
				{step === 'lead' && roofData && selectedTier && <Step5LeadCapture selectedTier={selectedTier} roofData={roofData} />}
			</div>
		</main>
	);
}
