'use client';

import { motion } from 'framer-motion';
import { RoofData, DesiredMaterial, ProjectTimeline } from '@/lib/types';
import { MATERIAL_OPTIONS } from '@/lib/mock-data';
import AnimatedCounter from './AnimatedCounter';

const timelineOptions: { id: ProjectTimeline; label: string; sub: string }[] = [
	{ id: 'now', label: 'Now', sub: 'Start immediately' },
	{ id: '1-3months', label: '1-3 months', sub: 'Planning ahead' },
	{ id: 'no-timeline', label: 'Not sure yet', sub: 'Just exploring' },
];

function InfoCard({
	icon,
	label,
	value,
	confidence,
	delay,
}: {
	icon: React.ReactNode;
	label: string;
	value: string | React.ReactNode;
	confidence?: number;
	delay: number;
}) {
	return (
		<motion.div
			className="bg-white/[0.03] border border-white/5 rounded-xl p-4 relative group hover:bg-white/[0.06] hover:border-white/10 transition-all"
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay, duration: 0.4 }}
		>
			<div className="flex items-start gap-3">
				<div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
					{icon}
				</div>
				<div className="min-w-0">
					<div className="text-xs text-slate-500 mb-0.5">{label}</div>
					<div className="text-lg font-semibold text-white">{value}</div>
				</div>
			</div>
			{confidence && (
				<div className="absolute top-3 right-3">
					<span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-400 bg-emerald-500/10 rounded-full px-2 py-0.5">
						<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
							<polyline points="20 6 9 17 4 12" />
						</svg>
						{confidence}%
					</span>
				</div>
			)}
		</motion.div>
	);
}

export default function Step3Analysis({
	roofData,
	desiredMaterial,
	timeline,
	onMaterialChange,
	onTimelineChange,
	onContinue,
	onBack,
}: {
	roofData: RoofData;
	desiredMaterial: DesiredMaterial;
	timeline: ProjectTimeline;
	onMaterialChange: (m: DesiredMaterial) => void;
	onTimelineChange: (t: ProjectTimeline) => void;
	onContinue: () => void;
	onBack: () => void;
}) {
	return (
		<div className="min-h-screen pt-16 pb-8 px-4 bg-gradient-to-b from-slate-900 to-slate-950">
			<div className="max-w-4xl mx-auto">
				<motion.button
					onClick={onBack}
					className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-300 mb-6 transition-colors"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
				>
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
						<path d="M19 12H5M12 19l-7-7 7-7" />
					</svg>
					Back
				</motion.button>

				<motion.div className="mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
					<div className="flex items-center gap-3 mb-2">
						<div className="w-8 h-8 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
							<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
								<polyline points="20 6 9 17 4 12" />
							</svg>
						</div>
						<h2 className="text-2xl font-bold text-white">Here&apos;s what our AI found</h2>
					</div>
					<p className="text-slate-500 text-sm ml-11">
						{roofData.address}{roofData.city ? `, ${roofData.city}, ${roofData.state} ${roofData.zip}` : ''}
					</p>
				</motion.div>

				<div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
					<motion.div className="lg:col-span-2" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
						<div className="sticky top-20">
							<div className="relative aspect-square rounded-xl overflow-hidden border border-white/5">
								<div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${roofData.satelliteImageUrl})` }} />
								<svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
									{roofData.sections.map((section) => (
										<polygon
											key={section.id}
											points={section.polygon.map((p) => `${p.x},${p.y}`).join(' ')}
											fill="rgba(59,130,246,0.25)"
											stroke="rgba(59,130,246,0.9)"
											strokeWidth="0.6"
										/>
									))}
									{roofData.sections.map((section) => {
										const cx = section.polygon.reduce((s, p) => s + p.x, 0) / section.polygon.length;
										const cy = section.polygon.reduce((s, p) => s + p.y, 0) / section.polygon.length;
										return (
											<g key={`l-${section.id}`}>
												<circle cx={cx} cy={cy} r="4" fill="rgba(59,130,246,0.95)" />
												<text x={cx} y={cy + 1.2} textAnchor="middle" fill="white" fontSize="3.2" fontWeight="bold">{section.id}</text>
											</g>
										);
									})}
								</svg>
							</div>
							<div className="mt-3 space-y-1">
								{roofData.sections.map((s) => (
									<div key={s.id} className="flex items-center gap-2 text-xs text-slate-400">
										<div className="w-5 h-5 rounded-full bg-blue-500/15 text-blue-400 flex items-center justify-center text-[10px] font-bold">{s.id}</div>
										<span className="font-medium text-slate-300">{s.label}</span>
										<span className="text-slate-600">— {s.areaSqFt.toLocaleString()} sq ft</span>
									</div>
								))}
							</div>
						</div>
					</motion.div>

					<div className="lg:col-span-3 space-y-4">
						<div className="grid grid-cols-2 gap-3">
							<InfoCard
								icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 3v18" /></svg>}
								label="Total Roof Area"
								value={<AnimatedCounter value={roofData.roofAreaSqFt} suffix=" sq ft" className="text-white" />}
								confidence={roofData.confidence}
								delay={0.3}
							/>
							<InfoCard
								icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12L12 2 2 12" /><path d="M5.45 8.27V22h13.1V8.27" /></svg>}
								label="Roof Pitch"
								value={`${roofData.pitch} — ${roofData.pitchLabel}`}
								confidence={roofData.confidence - 2}
								delay={0.4}
							/>
							<InfoCard
								icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>}
								label="Roof Sections"
								value={`${roofData.sections.length} detected`}
								delay={0.5}
							/>
							<InfoCard
								icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 12h18" /></svg>}
								label="Stories"
								value={`${roofData.stories}-story`}
								delay={0.6}
							/>
							<InfoCard
								icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg>}
								label="Building Type"
								value={roofData.buildingType === 'residential' ? 'Residential' : 'Commercial'}
								delay={0.7}
							/>
							<InfoCard
								icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12L12 2 2 12" /><path d="M5.45 8.27V22h13.1V8.27" /></svg>}
								label="Current Material"
								value={roofData.currentMaterial === 'asphalt' ? 'Asphalt Shingles' : roofData.currentMaterial === 'metal' ? 'Metal' : 'Tile'}
								delay={0.8}
							/>
						</div>

						<motion.div className="mt-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}>
							<h3 className="text-sm font-semibold text-slate-300 mb-3">What type of roof would you like?</h3>
							<div className="grid grid-cols-3 gap-3">
								{MATERIAL_OPTIONS.map((mat) => (
									<button
										key={mat.id}
										onClick={() => onMaterialChange(mat.id as DesiredMaterial)}
										className={`relative rounded-xl overflow-hidden aspect-[3/2] group transition-all ${
											desiredMaterial === mat.id
												? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-slate-900'
												: 'border border-white/10 hover:border-white/20'
										}`}
									>
										<div className="absolute inset-0 bg-cover bg-center transition-transform group-hover:scale-105" style={{ backgroundImage: `url(${mat.imageUrl})` }} />
										<div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
										<div className="absolute bottom-2 left-3 text-white text-sm font-medium">{mat.label}</div>
										{desiredMaterial === mat.id && (
											<div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
												<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
											</div>
										)}
									</button>
								))}
							</div>
						</motion.div>

						<motion.div className="mt-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0 }}>
							<h3 className="text-sm font-semibold text-slate-300 mb-3">When would you like to start?</h3>
							<div className="grid grid-cols-3 gap-3">
								{timelineOptions.map((opt) => (
									<button
										key={opt.id}
										onClick={() => onTimelineChange(opt.id)}
										className={`p-3 rounded-xl text-left transition-all ${
											timeline === opt.id
												? 'bg-blue-500/10 border-2 border-blue-500/50 text-blue-300'
												: 'bg-white/[0.03] border border-white/5 text-slate-400 hover:bg-white/[0.06]'
										}`}
									>
										<div className="text-sm font-semibold">{opt.label}</div>
										<div className="text-xs text-slate-500 mt-0.5">{opt.sub}</div>
									</button>
								))}
							</div>
						</motion.div>

						<motion.div className="mt-8 pt-6 border-t border-white/5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }}>
							<button
								onClick={onContinue}
								className="w-full py-4 bg-blue-600 text-white text-base font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
							>
								Get My Estimate
								<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
									<path d="M5 12h14M12 5l7 7-7 7" />
								</svg>
							</button>
						</motion.div>
					</div>
				</div>
			</div>
		</div>
	);
}
