'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Check, ArrowRight } from 'lucide-react';
import gsap from 'gsap';
import { cn } from '@/lib/utils';
import { RoofData, DesiredMaterial, ProjectTimeline } from '@/lib/types';
import { MATERIAL_OPTIONS } from '@/lib/mock-data';

interface StepMaterialsProps {
	roofData: RoofData;
	onContinue: (material: DesiredMaterial, timeline: ProjectTimeline) => void;
}

const TIMELINE_OPTIONS: { value: ProjectTimeline; label: string; sub: string }[] = [
	{ value: 'now', label: 'ASAP', sub: 'Ready to start' },
	{ value: '1-3months', label: '1\u20133 Months', sub: 'Planning ahead' },
	{ value: 'no-timeline', label: 'No Rush', sub: 'Just exploring' },
];

export default function StepMaterials({ roofData, onContinue }: StepMaterialsProps) {
	const [material, setMaterial] = useState<DesiredMaterial>('asphalt');
	const [timeline, setTimeline] = useState<ProjectTimeline | null>(null);
	const containerRef = useRef<HTMLDivElement>(null);

	const materials = MATERIAL_OPTIONS.filter((m) => ['asphalt', 'metal', 'tile'].includes(m.id));

	useEffect(() => {
		if (!containerRef.current) return;
		const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (prefersReduced) return;

		const sections = containerRef.current.querySelectorAll<HTMLElement>('[data-animate]');
		gsap.fromTo(
			sections,
			{ opacity: 0, y: 24 },
			{ opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power3.out', delay: 0.15 },
		);
	}, []);

	return (
		<div ref={containerRef} className="min-h-screen bg-[#111] pb-20">
			<div className="mx-auto max-w-3xl px-5 sm:px-8">

				{/* Header */}
				<header data-animate className="pt-20 sm:pt-24 pb-10 text-center">
					<h1 className="font-display text-3xl sm:text-[2.75rem] font-bold text-white mb-3" style={{ textWrap: 'balance' }}>
						Choose Your Roofing Material
					</h1>
					<p className="text-sm text-neutral-500 max-w-md mx-auto">
						Select the material that fits your budget and style. Your {roofData.roofAreaSqFt.toLocaleString()} sq ft roof has many great options.
					</p>
				</header>

				{/* Material cards */}
				<div data-animate className="mb-10">
					<div
						role="radiogroup"
						aria-label="Roofing material"
						className="grid sm:grid-cols-3 gap-3"
					>
						{materials.map((mat) => {
							const active = material === mat.id;
							return (
								<button
									key={mat.id}
									role="radio"
									aria-checked={active}
									onClick={() => setMaterial(mat.id as DesiredMaterial)}
									className={cn(
										'group relative text-left rounded-2xl border outline-none overflow-hidden',
										'focus-visible:ring-2 focus-visible:ring-emerald-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#111]',
										active
											? 'border-emerald-500/30 bg-emerald-500/[0.06] shadow-[0_0_0_1px_rgba(52,211,153,0.12)]'
											: 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.035]',
									)}
									style={{ touchAction: 'manipulation', transition: 'background-color 200ms, border-color 200ms, box-shadow 200ms' }}
								>
									<div className="relative aspect-[16/9] w-full overflow-hidden bg-neutral-900">
										<Image
											src={mat.imageUrl}
											alt={`${mat.name} texture`}
											fill
											sizes="(max-width: 640px) 100vw, 33vw"
											className="object-cover opacity-80 group-hover:opacity-100 group-hover:scale-[1.03]"
											style={{ transition: 'opacity 300ms, transform 500ms' }}
										/>
										{active && (
											<div className="absolute inset-0 bg-emerald-500/10 border-b border-emerald-500/20" />
										)}
										<div className="absolute top-3 right-3">
											<div className={cn(
												'h-6 w-6 rounded-full flex items-center justify-center backdrop-blur-sm',
												active
													? 'bg-emerald-400 shadow-lg shadow-emerald-500/30'
													: 'bg-black/40 border border-white/20',
											)}>
												{active && <Check className="h-3.5 w-3.5 text-[#111]" strokeWidth={3} aria-hidden="true" />}
											</div>
										</div>
									</div>

									<div className="p-4">
										<span className={cn(
											'text-sm font-semibold block mb-1',
											active ? 'text-emerald-400' : 'text-neutral-200 group-hover:text-white',
										)}>
											{mat.name}
										</span>
										<p className="text-xs leading-relaxed text-neutral-500 mb-3">{mat.description}</p>
										<div className="flex items-center gap-1.5">
											<span className="rounded-full bg-white/[0.04] px-2 py-0.5 text-[10px] font-medium text-neutral-500">{mat.lifespan}</span>
											<span className="rounded-full bg-white/[0.04] px-2 py-0.5 text-[10px] font-medium text-neutral-500">{mat.priceRange}</span>
										</div>
									</div>
								</button>
							);
						})}
					</div>
				</div>

				{/* Timeline */}
				<div data-animate className="mb-10">
					<h2 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-500 mb-4 px-1">
						When Do You Want to Start?
					</h2>
					<div
						role="radiogroup"
						aria-label="Project timeline"
						className="grid grid-cols-3 gap-3"
					>
						{TIMELINE_OPTIONS.map((opt) => {
							const active = timeline === opt.value;
							return (
								<button
									key={opt.value}
									role="radio"
									aria-checked={active}
									onClick={() => setTimeline(opt.value)}
									className={cn(
										'rounded-2xl py-4 px-3 text-center border outline-none',
										'focus-visible:ring-2 focus-visible:ring-emerald-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#111]',
										active
											? 'border-emerald-500/30 bg-emerald-500/[0.06] shadow-[0_0_0_1px_rgba(52,211,153,0.12)]'
											: 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.035]',
									)}
									style={{ touchAction: 'manipulation', transition: 'background-color 200ms, border-color 200ms, box-shadow 200ms' }}
								>
									<span className={cn(
										'block text-sm font-bold',
										active ? 'text-emerald-400' : 'text-neutral-300',
									)}>
										{opt.label}
									</span>
									<span className="block text-[11px] mt-0.5 text-neutral-500">{opt.sub}</span>
								</button>
							);
						})}
					</div>
				</div>

				{/* CTA */}
				<div data-animate>
					<button
						onClick={() => timeline && onContinue(material, timeline)}
						disabled={!timeline}
						aria-label="Continue to get your quote"
						className={cn(
							'w-full h-13 rounded-2xl text-sm font-bold tracking-wide',
							'inline-flex items-center justify-center gap-2 outline-none',
							'focus-visible:ring-2 focus-visible:ring-emerald-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#111]',
							'disabled:opacity-25 disabled:cursor-not-allowed',
							'bg-emerald-500 text-white hover:bg-emerald-400 active:bg-emerald-600',
						)}
						style={{ touchAction: 'manipulation', transition: 'background-color 200ms, opacity 200ms' }}
					>
						Get My Quote
						<ArrowRight className="h-4 w-4" aria-hidden="true" />
					</button>
					{!timeline && (
						<p className="text-center text-xs text-neutral-600 mt-3" aria-live="polite">
							Select a timeline above to continue
						</p>
					)}
				</div>
			</div>
		</div>
	);
}
