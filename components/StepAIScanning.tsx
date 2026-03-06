'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import Lottie from 'lottie-react';
import { RoofData, AIRoofAnalysis } from '@/lib/types';
import { generateRoofAnalysis } from '@/lib/ai-engine';
import MapView from './MapView';
import RoofMapOverlay from './RoofMapOverlay';
import aiLoaderData from '@/public/animations/ai-loader.json';

interface StepAIScanningProps {
	roofData: RoofData;
	onComplete: (analysis: AIRoofAnalysis) => void;
}

const PHASES = [
	{ text: 'Connecting to satellite imagery\u2026' },
	{ text: 'Detecting roof boundaries\u2026' },
	{ text: 'Mapping roof sections\u2026' },
	{ text: 'Analyzing surface condition\u2026' },
	{ text: 'Identifying potential issues\u2026' },
	{ text: 'Generating inspection report\u2026' },
	{ text: 'Analysis complete' },
];

const PHASE_DURATION = 700;

export default function StepAIScanning({ roofData, onComplete }: StepAIScanningProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const scanLineRef = useRef<HTMLDivElement>(null);
	const [currentPhase, setCurrentPhase] = useState(-1);
	const [showOverlay, setShowOverlay] = useState(false);
	const analysisRef = useRef<AIRoofAnalysis | null>(null);
	const completedRef = useRef(false);

	useEffect(() => {
		analysisRef.current = generateRoofAnalysis(roofData);
	}, [roofData]);

	const finishScan = useCallback(() => {
		if (completedRef.current) return;
		completedRef.current = true;
		if (analysisRef.current) {
			setTimeout(() => onComplete(analysisRef.current!), 600);
		}
	}, [onComplete]);

	useEffect(() => {
		const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		if (prefersReduced) {
			setCurrentPhase(PHASES.length - 1);
			finishScan();
			return;
		}

		if (scanLineRef.current) {
			gsap.to(scanLineRef.current, {
				y: '100vh',
				duration: PHASES.length * (PHASE_DURATION / 1000),
				ease: 'none',
				repeat: 0,
			});
		}

		const timers: ReturnType<typeof setTimeout>[] = [];
		PHASES.forEach((_, i) => {
			timers.push(setTimeout(() => {
				setCurrentPhase(i);
				if (i === 2) setShowOverlay(true);
			}, i * PHASE_DURATION));
		});

		timers.push(setTimeout(finishScan, PHASES.length * PHASE_DURATION + 400));

		return () => timers.forEach(clearTimeout);
	}, [finishScan]);

	useEffect(() => {
		if (!containerRef.current) return;
		const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (prefersReduced) return;

		gsap.fromTo(containerRef.current, { opacity: 0 }, { opacity: 1, duration: 0.8, ease: 'power2.inOut' });
	}, []);

	return (
		<div ref={containerRef} className="fixed inset-0 z-40 bg-neutral-950">
			{/* Satellite map -- dimmed as ambient background */}
			<div className="absolute inset-0 opacity-30" style={{ width: '100vw', height: '100vh' }}>
				<MapView
					center={[roofData.lng, roofData.lat]}
					zoom={19}
					pitch={0}
					bearing={0}
					className="w-full h-full"
					interactive={false}
				/>
				{showOverlay && (
					<RoofMapOverlay sections={roofData.sections} animate={true} />
				)}
			</div>

			{/* Heavy dark overlay to push map far back */}
			<div className="absolute inset-0 pointer-events-none bg-black/60" />

			{/* Subtle scan grid */}
			<div className="absolute inset-0 pointer-events-none overflow-hidden">
				<div
					className="absolute inset-0"
					style={{
						backgroundImage: `
							linear-gradient(rgba(139,92,246,0.04) 1px, transparent 1px),
							linear-gradient(90deg, rgba(139,92,246,0.04) 1px, transparent 1px)
						`,
						backgroundSize: '48px 48px',
					}}
				/>
				<div
					ref={scanLineRef}
					className="absolute left-0 right-0"
					style={{
						top: 0,
						height: '2px',
						background: 'linear-gradient(90deg, transparent 5%, rgba(139,92,246,0.6) 30%, rgba(139,92,246,0.8) 50%, rgba(139,92,246,0.6) 70%, transparent 95%)',
						boxShadow: '0 0 30px 8px rgba(139,92,246,0.15)',
					}}
				/>
			</div>

			{/* Center content with solid backdrop card */}
			<div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-5">
				<div className="flex flex-col items-center rounded-2xl bg-neutral-950/80 backdrop-blur-sm border border-white/5 px-10 py-12 sm:px-14 sm:py-14 max-w-sm w-full">
					{/* Lottie AI loader */}
					<div className="w-20 h-20 sm:w-24 sm:h-24 mb-6">
						<Lottie
							animationData={aiLoaderData}
							loop
							autoplay
							className="w-full h-full"
						/>
					</div>

					<h2 className="font-display text-lg sm:text-xl font-semibold text-white mb-1 text-center tracking-tight">
						AI Roof Inspection
					</h2>
					<p className="text-xs text-neutral-500 mb-8 text-center">
						{roofData.address}
					</p>

					{/* Phase list */}
					<div className="w-full space-y-2.5">
						{PHASES.map((phase, i) => {
							const isActive = i === currentPhase;
							const isDone = i < currentPhase;
							const isVisible = i <= currentPhase;

							if (!isVisible) return <div key={i} className="h-5" />;

							return (
								<div
									key={i}
									className="flex items-center gap-2.5 h-5"
									style={{
										opacity: isDone ? 0.4 : 1,
										transition: 'opacity 400ms ease',
									}}
								>
									<div className="w-4 flex items-center justify-center shrink-0">
										{isDone ? (
											<svg className="h-3.5 w-3.5 text-ai-400" viewBox="0 0 16 16" fill="none">
												<path d="M3 8.5l3.5 3.5L13 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
											</svg>
										) : isActive ? (
											<span className="relative flex h-2 w-2">
												<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ai-400 opacity-75" />
												<span className="relative inline-flex h-2 w-2 rounded-full bg-ai-400" />
											</span>
										) : null}
									</div>

									<span className={`text-sm ${
										isActive ? 'text-white font-medium' : 'text-neutral-500'
									}`}>
										{phase.text}
									</span>

									{isActive && i < PHASES.length - 1 && (
										<span className="w-0.5 h-3.5 bg-ai-400/70 animate-pulse rounded-full" />
									)}
								</div>
							);
						})}
					</div>
				</div>
			</div>
		</div>
	);
}
