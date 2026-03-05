'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { RoofData, DesiredMaterial, ProjectTimeline } from '@/lib/types';
import { MATERIAL_OPTIONS } from '@/lib/mock-data';
import AnimatedCounter from './AnimatedCounter';

interface Step3Props {
	roofData: RoofData;
	onContinue: (material: DesiredMaterial, timeline: ProjectTimeline) => void;
}

const TIMELINE_OPTIONS: { value: ProjectTimeline; label: string; desc: string }[] = [
	{ value: 'now', label: 'ASAP', desc: 'Ready to start' },
	{ value: '1-3months', label: '1–3 mo', desc: 'Planning ahead' },
	{ value: 'no-timeline', label: 'No rush', desc: 'Just exploring' },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function Step3Analysis({ roofData, onContinue }: Step3Props) {
	const [selectedMaterial, setSelectedMaterial] = useState<DesiredMaterial>('asphalt');
	const [selectedTimeline, setSelectedTimeline] = useState<ProjectTimeline | null>(null);

	return (
		<div className="min-h-screen bg-surface relative overflow-hidden">
			{/* Ambient glow */}
			<div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-teal-500/[0.05] blur-[120px] rounded-full pointer-events-none" />

			<motion.div
				className="relative z-10 max-w-4xl mx-auto px-4 py-12 sm:py-16"
				variants={container}
				initial="hidden"
				animate="show"
			>
				{/* Header */}
				<motion.div className="text-center mb-12" variants={item}>
					<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-xs text-teal-400 font-semibold uppercase tracking-wider mb-4">
						<div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
						AI Analysis Complete
					</div>
					<h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-2">
						Your Roof at a Glance
					</h2>
					<p className="text-white/40 text-sm">{roofData.address}, {roofData.city}, {roofData.state} {roofData.zip}</p>
				</motion.div>

				{/* Roof metrics grid */}
				<motion.div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10" variants={container}>
					{[
						{ label: 'Roof Area', value: roofData.roofAreaSqFt, suffix: ' sq ft', icon: '⬡' },
						{ label: 'Pitch', value: roofData.pitch, suffix: '', icon: '△' },
						{ label: 'Sections', value: roofData.sections.length, suffix: '', icon: '⊞' },
						{ label: 'Confidence', value: roofData.confidence, suffix: '%', icon: '◎' },
					].map((stat) => (
						<motion.div
							key={stat.label}
							className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4 hover:border-teal-500/30 transition-colors group"
							variants={item}
						>
							<div className="text-xl mb-1 opacity-30 group-hover:opacity-60 transition">{stat.icon}</div>
							<div className="font-display text-xl sm:text-2xl font-bold text-white">
								{typeof stat.value === 'number' && stat.label !== 'Sections' ? (
									<>
										<AnimatedCounter value={stat.value} />{stat.suffix}
									</>
								) : (
									<>{stat.value}{stat.suffix}</>
								)}
							</div>
							<div className="text-xs text-white/40 mt-0.5">{stat.label}</div>
						</motion.div>
					))}
				</motion.div>

				{/* Satellite + sections panel */}
				<motion.div className="grid sm:grid-cols-5 gap-4 mb-10" variants={item}>
					{/* Map thumbnail */}
					<div className="sm:col-span-2 rounded-xl overflow-hidden border border-white/[0.06] bg-white/[0.03]">
						{roofData.satelliteImageUrl ? (
							<div
								className="w-full aspect-[4/3] bg-cover bg-center"
								style={{ backgroundImage: `url(${roofData.satelliteImageUrl})` }}
							/>
						) : (
							<div className="w-full aspect-[4/3] bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
								<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/10">
									<rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
								</svg>
							</div>
						)}
					</div>

					{/* Sections list */}
					<div className="sm:col-span-3 space-y-2">
						<h3 className="font-display text-sm font-semibold text-white/50 uppercase tracking-wider mb-3">Detected Sections</h3>
						{roofData.sections.map((section, i) => (
							<motion.div
								key={section.id}
								className="flex items-center gap-3 rounded-lg bg-white/[0.03] border border-white/[0.06] px-4 py-3 hover:border-teal-500/20 transition-colors"
								initial={{ opacity: 0, x: 20 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ delay: 0.4 + i * 0.08 }}
							>
								<div className="w-7 h-7 rounded-full bg-teal-500/15 flex items-center justify-center text-xs font-bold text-teal-400 shrink-0">
									{section.id}
								</div>
								<div className="flex-1 min-w-0">
									<div className="text-sm text-white font-medium">{section.areaSqFt.toLocaleString()} sq ft</div>
									<div className="text-xs text-white/30">Pitch: {section.pitch}</div>
								</div>
								<div className="text-xs text-white/20">{section.azimuth}</div>
							</motion.div>
						))}
					</div>
				</motion.div>

				{/* Material selection */}
				<motion.div className="mb-10" variants={item}>
					<h3 className="font-display text-sm font-semibold text-white/50 uppercase tracking-wider mb-4">Desired Material</h3>
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
						{MATERIAL_OPTIONS.filter((m) => ['asphalt', 'metal', 'tile'].includes(m.id)).map((mat) => {
							const active = selectedMaterial === mat.id;
							return (
								<button
									key={mat.id}
									onClick={() => setSelectedMaterial(mat.id as DesiredMaterial)}
									className={`relative rounded-xl border p-4 text-left transition-all group ${
										active
											? 'border-teal-500/60 bg-teal-500/[0.08]'
											: 'border-white/[0.06] bg-white/[0.02] hover:border-white/10'
									}`}
								>
									<div className="flex items-center gap-3 mb-2">
										<div className={`w-3 h-3 rounded-full border-2 transition ${active ? 'border-teal-400 bg-teal-400' : 'border-white/20'}`} />
										<span className={`text-sm font-semibold transition ${active ? 'text-teal-300' : 'text-white/70'}`}>{mat.name}</span>
									</div>
									<p className="text-xs text-white/30 leading-relaxed pl-6">{mat.description}</p>
									<div className="flex items-center gap-2 mt-2 pl-6">
										<span className="text-[10px] text-white/20 uppercase tracking-wider">{mat.lifespan}</span>
										<span className="text-white/10">·</span>
										<span className="text-[10px] text-white/20">{mat.priceRange}</span>
									</div>
								</button>
							);
						})}
					</div>
				</motion.div>

				{/* Timeline */}
				<motion.div className="mb-10" variants={item}>
					<h3 className="font-display text-sm font-semibold text-white/50 uppercase tracking-wider mb-4">Project Timeline</h3>
					<div className="flex gap-3">
						{TIMELINE_OPTIONS.map((opt) => {
							const active = selectedTimeline === opt.value;
							return (
								<button
									key={opt.value}
									onClick={() => setSelectedTimeline(opt.value)}
									className={`flex-1 rounded-xl border p-3 text-center transition-all ${
										active
											? 'border-teal-500/60 bg-teal-500/[0.08]'
											: 'border-white/[0.06] bg-white/[0.02] hover:border-white/10'
									}`}
								>
									<div className={`text-sm font-bold transition ${active ? 'text-teal-300' : 'text-white/60'}`}>{opt.label}</div>
									<div className="text-[10px] text-white/25 mt-0.5">{opt.desc}</div>
								</button>
							);
						})}
					</div>
				</motion.div>

				{/* CTA */}
				<motion.div variants={item}>
					<button
						onClick={() => selectedTimeline && onContinue(selectedMaterial, selectedTimeline)}
						disabled={!selectedTimeline}
						className="w-full py-4 rounded-xl font-display font-bold text-sm uppercase tracking-wider transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:from-teal-400 hover:to-cyan-400 shadow-lg shadow-teal-500/20"
					>
						See My Estimate →
					</button>
				</motion.div>
			</motion.div>
		</div>
	);
}
