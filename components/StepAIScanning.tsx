'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { RoofData, AIRoofAnalysis } from '@/lib/types';
import { generateRoofAnalysis } from '@/lib/ai-engine';
import MapView from './MapView';
import RoofMapOverlay from './RoofMapOverlay';

interface StepAIScanningProps {
	roofData: RoofData;
	onComplete: (analysis: AIRoofAnalysis) => void;
}

const PHASES = [
	{ text: 'Connecting to satellite imagery\u2026', pct: 12 },
	{ text: 'Detecting roof boundaries\u2026', pct: 28 },
	{ text: 'Mapping roof sections\u2026', pct: 42 },
	{ text: 'Analyzing surface condition\u2026', pct: 58 },
	{ text: 'Identifying potential issues\u2026', pct: 74 },
	{ text: 'Generating inspection report\u2026', pct: 90 },
	{ text: 'Analysis complete', pct: 100 },
];

const PHASE_DURATION = 700;

export default function StepAIScanning({ roofData, onComplete }: StepAIScanningProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const scanLineRef = useRef<HTMLDivElement>(null);
	const progressRef = useRef<SVGCircleElement>(null);
	const [currentPhase, setCurrentPhase] = useState(-1);
	const [progress, setProgress] = useState(0);
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
			setProgress(100);
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
		PHASES.forEach((phase, i) => {
			timers.push(setTimeout(() => {
				setCurrentPhase(i);
				setProgress(phase.pct);
				if (i === 2) setShowOverlay(true);
			}, i * PHASE_DURATION));
		});

		timers.push(setTimeout(finishScan, PHASES.length * PHASE_DURATION + 400));

		return () => timers.forEach(clearTimeout);
	}, [finishScan]);

	useEffect(() => {
		if (!progressRef.current) return;
		const circumference = 2 * Math.PI * 54;
		const offset = circumference - (progress / 100) * circumference;
		gsap.to(progressRef.current, {
			strokeDashoffset: offset,
			duration: 0.5,
			ease: 'power2.out',
		});
	}, [progress]);

	useEffect(() => {
		if (!containerRef.current) return;
		const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (prefersReduced) return;

		gsap.fromTo(containerRef.current, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'power2.out' });
	}, []);

	const circumference = 2 * Math.PI * 54;

	return (
		<div ref={containerRef} className="fixed inset-0 z-40 bg-[#111]">
			{/* Satellite map background */}
			<div className="absolute inset-0 opacity-40">
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

			{/* Scan grid overlay */}
			<div className="absolute inset-0 pointer-events-none overflow-hidden">
				<div
					className="absolute inset-0"
					style={{
						backgroundImage: `
							linear-gradient(rgba(52,211,153,0.04) 1px, transparent 1px),
							linear-gradient(90deg, rgba(52,211,153,0.04) 1px, transparent 1px)
						`,
						backgroundSize: '40px 40px',
					}}
				/>
				{/* Sweep line */}
				<div
					ref={scanLineRef}
					className="absolute left-0 right-0 h-px"
					style={{
						top: 0,
						background: 'linear-gradient(90deg, transparent, rgba(52,211,153,0.6), transparent)',
						boxShadow: '0 0 20px 4px rgba(52,211,153,0.15)',
					}}
				/>
			</div>

			{/* Dark center overlay for readability */}
			<div className="absolute inset-0 bg-gradient-radial from-transparent via-[#111]/60 to-[#111]/90" style={{
				background: 'radial-gradient(circle at center, rgba(17,17,17,0.3) 0%, rgba(17,17,17,0.75) 60%, rgba(17,17,17,0.95) 100%)',
			}} />

			{/* Center content */}
			<div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-5">
				{/* Progress ring */}
				<div className="relative mb-8">
					<svg width="128" height="128" viewBox="0 0 128 128" className="rotate-[-90deg]">
						<circle
							cx="64" cy="64" r="54"
							fill="none"
							stroke="rgba(255,255,255,0.06)"
							strokeWidth="3"
						/>
						<circle
							ref={progressRef}
							cx="64" cy="64" r="54"
							fill="none"
							stroke="rgb(52,211,153)"
							strokeWidth="3"
							strokeLinecap="round"
							strokeDasharray={circumference}
							strokeDashoffset={circumference}
							style={{ filter: 'drop-shadow(0 0 6px rgba(52,211,153,0.4))' }}
						/>
					</svg>
					<div className="absolute inset-0 flex items-center justify-center">
						<span
							className="font-display text-2xl font-bold text-white"
							style={{ fontVariantNumeric: 'tabular-nums' }}
						>
							{progress}%
						</span>
					</div>
				</div>

				{/* Title */}
				<h2 className="font-display text-xl sm:text-2xl font-bold text-white mb-2 text-center">
					AI Roof Inspection
				</h2>
				<p className="text-xs text-neutral-500 mb-8">
					Analyzing satellite imagery at {roofData.address}
				</p>

				{/* Phase lines */}
				<div className="w-full max-w-sm space-y-2">
					{PHASES.map((phase, i) => {
						const isActive = i === currentPhase;
						const isDone = i < currentPhase;
						const isVisible = i <= currentPhase;

						if (!isVisible) return <div key={i} className="h-6" />;

						return (
							<div
								key={i}
								className="flex items-center gap-3 h-6"
								style={{
									opacity: isDone ? 0.4 : 1,
									transition: 'opacity 400ms ease',
								}}
							>
								{/* Status indicator */}
								<div className="w-4 flex items-center justify-center shrink-0">
									{isDone ? (
										<svg className="h-3.5 w-3.5 text-emerald-400" viewBox="0 0 16 16" fill="none">
											<path d="M3 8.5l3.5 3.5L13 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
										</svg>
									) : isActive ? (
										<span className="relative flex h-2 w-2">
											<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
											<span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
										</span>
									) : null}
								</div>

								{/* Text with typewriter effect */}
								<span className={`text-sm font-medium ${
									isActive ? 'text-emerald-400' : 'text-neutral-500'
								}`}>
									{phase.text}
								</span>

								{/* Blinking cursor on active line */}
								{isActive && phase.pct < 100 && (
									<span className="w-0.5 h-4 bg-emerald-400 animate-pulse" />
								)}
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
}
