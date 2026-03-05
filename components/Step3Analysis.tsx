'use client';

import { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { RoofData, DesiredMaterial, ProjectTimeline } from '@/lib/types';
import { MATERIAL_OPTIONS } from '@/lib/mock-data';
import AnimatedCounter from './AnimatedCounter';

interface Step3Props {
	roofData: RoofData;
	onContinue: (material: DesiredMaterial, timeline: ProjectTimeline) => void;
}

const TIMELINE_OPTIONS: { value: ProjectTimeline; label: string; sub: string }[] = [
	{ value: 'now', label: 'ASAP', sub: 'Ready to start' },
	{ value: '1-3months', label: '1–3 mo', sub: 'Planning ahead' },
	{ value: 'no-timeline', label: 'No rush', sub: 'Just exploring' },
];

export default function Step3Analysis({ roofData, onContinue }: Step3Props) {
	const containerRef = useRef<HTMLDivElement>(null);
	const [material, setMaterial] = useState<DesiredMaterial>('asphalt');
	const [timeline, setTimeline] = useState<ProjectTimeline | null>(null);

	useEffect(() => {
		if (!containerRef.current) return;
		const ctx = gsap.context(() => {
			gsap.from('.analysis-badge', { y: 16, opacity: 0, duration: 0.5, ease: 'power3.out', delay: 0.2 });
			gsap.from('.analysis-heading', { y: 30, opacity: 0, duration: 0.7, ease: 'power4.out', delay: 0.35 });
			gsap.from('.analysis-address', { y: 12, opacity: 0, duration: 0.5, ease: 'power3.out', delay: 0.5 });
			gsap.from('.stat-card', { y: 24, opacity: 0, duration: 0.5, ease: 'power3.out', stagger: 0.08, delay: 0.6 });
			gsap.from('.analysis-panel', { y: 20, opacity: 0, duration: 0.6, ease: 'power3.out', delay: 0.9 });
			gsap.from('.material-card', { y: 16, opacity: 0, duration: 0.4, ease: 'power3.out', stagger: 0.06, delay: 1.1 });
			gsap.from('.timeline-btn', { y: 10, opacity: 0, duration: 0.35, ease: 'power2.out', stagger: 0.05, delay: 1.3 });
			gsap.from('.analysis-cta', { y: 12, opacity: 0, duration: 0.5, ease: 'power3.out', delay: 1.5 });
		}, containerRef);
		return () => ctx.revert();
	}, []);

	return (
		<div ref={containerRef} className="min-h-screen relative overflow-hidden" style={{ background: 'var(--color-base)' }}>
			{/* Oversized background number — the "surprising thing" */}
			<div
				className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-display font-bold pointer-events-none select-none"
				style={{
					fontSize: 'clamp(200px, 30vw, 400px)',
					color: 'rgba(255,255,255,0.015)',
					lineHeight: 1,
					whiteSpace: 'nowrap',
				}}
			>
				{roofData.roofAreaSqFt.toLocaleString()}
			</div>

			{/* Accent glow */}
			<div className="glow-accent absolute inset-0 pointer-events-none" />

			<div className="relative z-10 max-w-4xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
				{/* Badge */}
				<div className="analysis-badge text-center mb-4">
					<span
						className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.12em] uppercase px-3 py-1.5 rounded-md"
						style={{
							border: '1px solid rgba(136,255,87,0.2)',
							color: 'var(--color-accent)',
							background: 'var(--color-accent-muted)',
						}}
					>
						<span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--color-accent)' }} />
						Analysis Complete
					</span>
				</div>

				{/* Heading */}
				<h2
					className="analysis-heading font-display font-bold text-center mb-2"
					style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)', color: 'var(--color-text-primary)' }}
				>
					Your Roof at a Glance
				</h2>
				<p className="analysis-address text-center text-sm mb-10" style={{ color: 'var(--color-text-tertiary)' }}>
					{roofData.address}{roofData.city ? `, ${roofData.city}, ${roofData.state} ${roofData.zip}` : ''}
				</p>

				{/* Stat cards */}
				<div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
					{[
						{ label: 'Roof Area', value: roofData.roofAreaSqFt, suffix: ' sq ft', numeric: true },
						{ label: 'Pitch', value: roofData.pitch, suffix: '', numeric: false },
						{ label: 'Sections', value: roofData.sections.length, suffix: '', numeric: false },
						{ label: 'Confidence', value: roofData.confidence, suffix: '%', numeric: true },
					].map((stat) => (
						<div
							key={stat.label}
							className="stat-card rounded-lg p-4 transition-colors hover:border-white/10"
							style={{
								background: 'var(--color-surface)',
								border: '1px solid var(--color-border)',
							}}
						>
							<div className="tabular font-display text-xl sm:text-2xl font-bold text-white">
								{stat.numeric ? (
									<>
										<AnimatedCounter value={stat.value as number} />
										{stat.suffix}
									</>
								) : (
									<>{stat.value}{stat.suffix}</>
								)}
							</div>
							<div className="text-xs mt-1" style={{ color: 'var(--color-text-tertiary)' }}>{stat.label}</div>
						</div>
					))}
				</div>

				{/* Satellite + sections panel */}
				<div className="analysis-panel grid sm:grid-cols-5 gap-4 mb-10">
					<div
						className="sm:col-span-2 rounded-lg overflow-hidden"
						style={{ border: '1px solid var(--color-border)' }}
					>
						{roofData.satelliteImageUrl ? (
							<div
								className="w-full aspect-[4/3] bg-cover bg-center"
								style={{ backgroundImage: `url(${roofData.satelliteImageUrl})` }}
							/>
						) : (
							<div
								className="w-full aspect-[4/3] flex items-center justify-center"
								style={{ background: 'var(--color-surface)' }}
							>
								<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-tertiary)" strokeWidth="1.5">
									<rect x="3" y="3" width="18" height="18" rx="2" />
									<circle cx="8.5" cy="8.5" r="1.5" />
									<polyline points="21 15 16 10 5 21" />
								</svg>
							</div>
						)}
					</div>
					<div className="sm:col-span-3 space-y-2">
						<h3 className="text-xs font-semibold tracking-[0.1em] uppercase mb-3" style={{ color: 'var(--color-text-tertiary)' }}>
							Detected Sections
						</h3>
						{roofData.sections.map((section) => (
							<div
								key={section.id}
								className="flex items-center gap-3 rounded-lg px-4 py-3 transition-colors hover:bg-white/[0.02]"
								style={{
									background: 'var(--color-surface)',
									border: '1px solid var(--color-border)',
								}}
							>
								<div
									className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
									style={{ background: 'var(--color-accent-muted)', color: 'var(--color-accent)' }}
								>
									{section.id}
								</div>
								<div className="flex-1">
									<span className="text-sm font-medium text-white tabular">{section.areaSqFt.toLocaleString()} sq ft</span>
									{section.pitch && (
										<span className="text-xs ml-2" style={{ color: 'var(--color-text-tertiary)' }}>
											{section.pitch}
										</span>
									)}
								</div>
								{section.azimuth && (
									<span className="text-[10px] tracking-wider uppercase" style={{ color: 'var(--color-text-tertiary)' }}>
										{section.azimuth}
									</span>
								)}
							</div>
						))}
					</div>
				</div>

				{/* Material selection */}
				<div className="mb-10">
					<h3 className="text-xs font-semibold tracking-[0.1em] uppercase mb-4" style={{ color: 'var(--color-text-tertiary)' }}>
						Desired Material
					</h3>
					<div className="grid sm:grid-cols-3 gap-3">
						{MATERIAL_OPTIONS.filter((m) => ['asphalt', 'metal', 'tile'].includes(m.id)).map((mat) => {
							const active = material === mat.id;
							return (
								<button
									key={mat.id}
									onClick={() => setMaterial(mat.id as DesiredMaterial)}
									className="material-card text-left rounded-lg p-4 transition-all hover:-translate-y-px"
									style={{
										background: active ? 'var(--color-accent-muted)' : 'var(--color-surface)',
										border: `1px solid ${active ? 'rgba(136,255,87,0.3)' : 'var(--color-border)'}`,
									}}
								>
									<div className="flex items-center gap-2.5 mb-2">
										<div
											className="w-3 h-3 rounded-full transition-all"
											style={{
												border: `2px solid ${active ? 'var(--color-accent)' : 'var(--color-text-tertiary)'}`,
												background: active ? 'var(--color-accent)' : 'transparent',
											}}
										/>
										<span className="text-sm font-semibold" style={{ color: active ? 'var(--color-accent)' : 'var(--color-text-secondary)' }}>
											{mat.name}
										</span>
									</div>
									<p className="text-xs leading-relaxed pl-5" style={{ color: 'var(--color-text-tertiary)' }}>
										{mat.description}
									</p>
									<div className="flex gap-2 mt-2 pl-5 text-[10px] tracking-wider uppercase" style={{ color: 'var(--color-text-tertiary)' }}>
										<span>{mat.lifespan}</span>
										<span>·</span>
										<span>{mat.priceRange}</span>
									</div>
								</button>
							);
						})}
					</div>
				</div>

				{/* Timeline */}
				<div className="mb-10">
					<h3 className="text-xs font-semibold tracking-[0.1em] uppercase mb-4" style={{ color: 'var(--color-text-tertiary)' }}>
						Project Timeline
					</h3>
					<div className="flex gap-3">
						{TIMELINE_OPTIONS.map((opt) => {
							const active = timeline === opt.value;
							return (
								<button
									key={opt.value}
									onClick={() => setTimeline(opt.value)}
									className="timeline-btn flex-1 rounded-lg p-3 text-center transition-all hover:-translate-y-px"
									style={{
										background: active ? 'var(--color-accent-muted)' : 'var(--color-surface)',
										border: `1px solid ${active ? 'rgba(136,255,87,0.3)' : 'var(--color-border)'}`,
									}}
								>
									<div className="text-sm font-bold" style={{ color: active ? 'var(--color-accent)' : 'var(--color-text-secondary)' }}>
										{opt.label}
									</div>
									<div className="text-[10px] mt-0.5" style={{ color: 'var(--color-text-tertiary)' }}>
										{opt.sub}
									</div>
								</button>
							);
						})}
					</div>
				</div>

				{/* CTA */}
				<button
					onClick={() => timeline && onContinue(material, timeline)}
					disabled={!timeline}
					className="analysis-cta w-full py-4 rounded-lg font-display font-bold text-sm tracking-wide transition-all hover:-translate-y-px disabled:opacity-25 disabled:cursor-not-allowed"
					style={{ background: 'var(--color-accent)', color: '#080808' }}
				>
					See My Estimate →
				</button>
			</div>
		</div>
	);
}
