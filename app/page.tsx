'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { RoofData, DesiredMaterial, ProjectTimeline, AIRoofAnalysis } from '@/lib/types';
import WizardProgress from '@/components/WizardProgress';
import Step1Welcome from '@/components/Step1Welcome';
import StepAIScanning from '@/components/StepAIScanning';
import Step3Analysis from '@/components/Step3Analysis';
import StepMaterials from '@/components/StepMaterials';
import Step5LeadCapture from '@/components/Step5LeadCapture';

type WizardStep = 'hero' | 'scanning' | 'analysis' | 'materials' | 'lead';

const stepToNumber: Record<WizardStep, number> = {
	hero: 1,
	scanning: 2,
	analysis: 3,
	materials: 4,
	lead: 5,
};

export default function Home() {
	const [step, setStep] = useState<WizardStep>('hero');
	const [roofData, setRoofData] = useState<RoofData | null>(null);
	const [aiAnalysis, setAiAnalysis] = useState<AIRoofAnalysis | null>(null);
	const [desiredMaterial, setDesiredMaterial] = useState<DesiredMaterial>('asphalt');
	const [timeline, setTimeline] = useState<ProjectTimeline>('no-timeline');
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
			setStep('scanning');
		},
		[],
	);

	const handleScanComplete = useCallback(
		(analysis: AIRoofAnalysis) => {
			setAiAnalysis(analysis);
			transitionTo('analysis');
		},
		[transitionTo],
	);

	const handleAnalysisContinue = useCallback(() => {
		transitionTo('materials');
	}, [transitionTo]);

	const handleMaterialsContinue = useCallback(
		(material: DesiredMaterial, tl: ProjectTimeline) => {
			setDesiredMaterial(material);
			setTimeline(tl);
			transitionTo('lead');
		},
		[transitionTo],
	);

	useEffect(() => {
		if (step === 'hero' || step === 'scanning') return;

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
				{step === 'scanning' && roofData && <StepAIScanning roofData={roofData} onComplete={handleScanComplete} />}
				{step === 'analysis' && roofData && <Step3Analysis roofData={roofData} aiAnalysis={aiAnalysis} onContinue={handleAnalysisContinue} />}
				{step === 'materials' && roofData && <StepMaterials roofData={roofData} aiAnalysis={aiAnalysis} onContinue={handleMaterialsContinue} />}
				{step === 'lead' && roofData && (
					<Step5LeadCapture
						roofData={roofData}
						desiredMaterial={desiredMaterial}
						timeline={timeline}
						aiAnalysis={aiAnalysis}
					/>
				)}
			</div>
		</main>
	);
}
