'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RoofData } from '@/lib/types';
import { MOCK_ADDRESSES, filterAddresses } from '@/lib/mock-data';
import { hasGoogleApiKey, geocodeAddress, fetchBuildingInsights, getSatelliteImageUrl } from '@/lib/google-apis';

const isLiveMode = hasGoogleApiKey();

const STATS = [
	{ value: '2,000+', label: 'Roofing pros' },
	{ value: '15,000+', label: 'Reports generated' },
	{ value: '4.9', label: 'Average rating' },
	{ value: '50', label: 'States covered' },
];

const SCAN_STEPS = [
	{ label: 'Locating property...', duration: 700 },
	{ label: 'Analyzing satellite imagery...', duration: 900 },
	{ label: 'Measuring roof dimensions...', duration: 800 },
	{ label: 'Calculating estimates...', duration: 600 },
];

function MapPlaceholder({ scanPhase, roofData }: { scanPhase: number; roofData: RoofData | null }) {
	return (
		<div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden bg-slate-800/50 border border-white/5">
			{/* Idle state — dark map grid */}
			{!roofData && (
				<>
					<div className="absolute inset-0 opacity-30" style={{
						backgroundImage: `
							linear-gradient(rgba(59,130,246,0.15) 1px, transparent 1px),
							linear-gradient(90deg, rgba(59,130,246,0.15) 1px, transparent 1px)
						`,
						backgroundSize: '40px 40px',
					}} />
					<div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-900/80" />
					<div className="absolute inset-0 flex items-center justify-center">
						<motion.div
							className="text-slate-500 flex flex-col items-center gap-3"
							animate={{ opacity: [0.4, 0.7, 0.4] }}
							transition={{ repeat: Infinity, duration: 3 }}
						>
							<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
								<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
								<circle cx="12" cy="10" r="3" />
							</svg>
							<span className="text-sm">Enter an address to begin</span>
						</motion.div>
					</div>
				</>
			)}

			{/* Active state — satellite image */}
			{roofData && (
				<>
					<motion.div
						className="absolute inset-0 bg-cover bg-center"
						style={{ backgroundImage: `url(${roofData.satelliteImageUrl})` }}
						initial={{ scale: 3, filter: 'blur(12px)', opacity: 0 }}
						animate={{
							scale: scanPhase >= 1 ? 1 : 3,
							filter: scanPhase >= 1 ? 'blur(0px)' : 'blur(12px)',
							opacity: 1,
						}}
						transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
					/>

					{/* Scan overlay */}
					{scanPhase >= 2 && scanPhase < 4 && (
						<div className="absolute inset-0 overflow-hidden pointer-events-none">
							<motion.div
								className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent"
								initial={{ top: '-2px' }}
								animate={{ top: '100%' }}
								transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
							/>
							<div className="absolute inset-0" style={{
								backgroundImage: `
									linear-gradient(rgba(59,130,246,0.1) 1px, transparent 1px),
									linear-gradient(90deg, rgba(59,130,246,0.1) 1px, transparent 1px)
								`,
								backgroundSize: '25px 25px',
							}} />
						</div>
					)}

					{/* Roof overlays */}
					{scanPhase >= 3 && (
						<svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
							{roofData.sections.map((section, i) => {
								const points = section.polygon.map((p) => `${p.x},${p.y}`).join(' ');
								return (
									<motion.polygon
										key={section.id}
										points={points}
										fill="rgba(59, 130, 246, 0.2)"
										stroke="rgba(59, 130, 246, 0.8)"
										strokeWidth="0.6"
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										transition={{ delay: i * 0.3, duration: 0.6 }}
									/>
								);
							})}

							{scanPhase >= 4 && roofData.sections.map((section, i) => {
								const cx = section.polygon.reduce((s, p) => s + p.x, 0) / section.polygon.length;
								const cy = section.polygon.reduce((s, p) => s + p.y, 0) / section.polygon.length;
								return (
									<motion.g
										key={`lbl-${section.id}`}
										initial={{ opacity: 0, scale: 0 }}
										animate={{ opacity: 1, scale: 1 }}
										transition={{ delay: 0.3 + i * 0.15, type: 'spring' }}
									>
										<circle cx={cx} cy={cy} r="3.5" fill="rgba(59,130,246,0.95)" />
										<text x={cx} y={cy + 1} textAnchor="middle" fill="white" fontSize="2.8" fontWeight="bold">
											{section.id}
										</text>
									</motion.g>
								);
							})}

							{scanPhase >= 4 && roofData.sections.flatMap((section) =>
								section.dimensions.map((dim, di) => (
									<motion.text
										key={`d-${section.id}-${di}`}
										x={dim.x}
										y={dim.y}
										textAnchor="middle"
										fill="white"
										fontSize="2.2"
										fontWeight="600"
										transform={dim.rotation ? `rotate(${dim.rotation} ${dim.x} ${dim.y})` : undefined}
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										transition={{ delay: 0.6 + di * 0.1 }}
										style={{ textShadow: '0 1px 4px rgba(0,0,0,0.9)' }}
									>
										{dim.label}
									</motion.text>
								))
							)}
						</svg>
					)}

					{scanPhase < 4 && (
						<div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 to-transparent" />
					)}
				</>
			)}
		</div>
	);
}

export default function Step1Welcome({ onAddressSelected }: { onAddressSelected: (data: RoofData) => void }) {
	const [query, setQuery] = useState('');
	const [suggestions, setSuggestions] = useState<RoofData[]>([]);
	const [showSuggestions, setShowSuggestions] = useState(false);
	const [selectedAddress, setSelectedAddress] = useState<RoofData | null>(null);
	const [scanPhase, setScanPhase] = useState(0);
	const [scanStepIdx, setScanStepIdx] = useState(-1);
	const [completedSteps, setCompletedSteps] = useState<number[]>([]);
	const [isLoadingLive, setIsLoadingLive] = useState(false);
	const [liveError, setLiveError] = useState('');
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (!isLiveMode && query.length >= 2) {
			const results = filterAddresses(query);
			setSuggestions(results.length > 0 ? results : MOCK_ADDRESSES);
			setShowSuggestions(true);
		} else if (!isLiveMode) {
			setSuggestions([]);
			setShowSuggestions(false);
		}
	}, [query]);

	const runScanAnimation = (data: RoofData) => {
		setSelectedAddress(data);
		setScanPhase(1);
		setScanStepIdx(0);
		setCompletedSteps([]);

		let elapsed = 0;
		SCAN_STEPS.forEach((step, i) => {
			elapsed += step.duration;
			setTimeout(() => {
				setScanStepIdx(i);
				setScanPhase(i + 1);
				if (i > 0) setCompletedSteps((prev) => [...prev, i - 1]);
			}, elapsed);
		});

		const totalTime = SCAN_STEPS.reduce((s, st) => s + st.duration, 0);
		setTimeout(() => {
			setCompletedSteps([0, 1, 2, 3]);
			setTimeout(() => onAddressSelected(data), 800);
		}, totalTime + 300);
	};

	const handleSelectMock = (data: RoofData) => {
		setQuery(`${data.address}, ${data.city}, ${data.state} ${data.zip}`);
		setShowSuggestions(false);
		runScanAnimation(data);
	};

	const handleLiveSearch = async () => {
		if (!query.trim()) return;
		setIsLoadingLive(true);
		setLiveError('');
		try {
			const coords = await geocodeAddress(query);
			if (!coords) {
				setLiveError('Address not found. Try a more specific address.');
				setIsLoadingLive(false);
				return;
			}
			const satelliteUrl = getSatelliteImageUrl(coords.lat, coords.lng);
			const partialData: RoofData = {
				address: query, city: '', state: '', zip: '',
				roofAreaSqFt: 0, pitch: '0/12', pitchLabel: '',
				sections: [], stories: 1, buildingType: 'residential',
				currentMaterial: 'asphalt', satelliteImageUrl: satelliteUrl, confidence: 0,
			};
			setSelectedAddress(partialData);
			setScanPhase(1);
			setScanStepIdx(0);
			const roofData = await fetchBuildingInsights(coords.lat, coords.lng);
			if (roofData) {
				roofData.address = query;
				runScanAnimation(roofData);
			} else {
				setLiveError('Roof analysis not available for this location.');
				setSelectedAddress(null);
				setScanPhase(0);
				setScanStepIdx(-1);
			}
		} catch {
			setLiveError('Something went wrong. Please try again.');
		} finally {
			setIsLoadingLive(false);
		}
	};

	const isScanning = selectedAddress !== null;

	return (
		<div className="min-h-screen relative">
			{/* Background gradient */}
			<div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950" />
			<div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-blue-500/5 rounded-full blur-3xl" />

			<div className="relative z-10 max-w-6xl mx-auto px-6 pt-8 pb-16">
				{/* Header */}
				<motion.header
					className="flex items-center justify-between mb-16"
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
				>
					<div className="flex items-center gap-2.5">
						<div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
							<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
								<path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
								<polyline points="9 22 9 12 15 12 15 22" />
							</svg>
						</div>
						<span className="text-lg font-bold text-white">Zuper Roofing</span>
					</div>
					<div className="flex items-center gap-2 text-sm text-slate-400">
						<div className="flex items-center gap-1">
							<svg width="14" height="14" viewBox="0 0 24 24" fill="#facc15" stroke="none">
								<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
							</svg>
							<span className="font-semibold text-white">4.9</span>
						</div>
						<span className="text-slate-600">·</span>
						<span>2,000+ roofers</span>
					</div>
				</motion.header>

				{/* Hero */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
					{/* Left: headline + input */}
					<div>
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.1 }}
						>
							{isLiveMode && (
								<div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
									<div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
									<span className="text-xs font-medium text-emerald-400">Live — Google Solar API</span>
								</div>
							)}

							<h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] mb-5">
								AI Roof Reports
								<br />
								<span className="gradient-text">in 30 Seconds.</span>
							</h1>
							<p className="text-lg text-slate-400 mb-8 max-w-md leading-relaxed">
								Search any address — get roof area, pitch, and cost estimates instantly.
							</p>
						</motion.div>

						{/* Address input */}
						<motion.div
							className="relative mb-4"
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.3 }}
						>
							<div className="relative flex gap-2">
								<div className="relative flex-1">
									<svg className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
										<circle cx="11" cy="11" r="8" />
										<path d="M21 21l-4.35-4.35" />
									</svg>
									<input
										ref={inputRef}
										type="text"
										value={query}
										onChange={(e) => setQuery(e.target.value)}
										onKeyDown={(e) => {
											if (e.key === 'Enter' && isLiveMode && !isScanning) handleLiveSearch();
										}}
										placeholder="Enter property address..."
										disabled={isScanning}
										className="w-full pl-11 pr-4 py-4 text-base bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all disabled:opacity-50"
									/>
								</div>
								<button
									onClick={isLiveMode ? handleLiveSearch : undefined}
									disabled={isScanning || isLoadingLive}
									className="px-6 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:bg-blue-600/50 disabled:cursor-not-allowed shrink-0 flex items-center gap-2 shadow-lg shadow-blue-600/20"
								>
									{isLoadingLive ? (
										<motion.div
											className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
											animate={{ rotate: 360 }}
											transition={{ repeat: Infinity, duration: 0.7, ease: 'linear' }}
										/>
									) : (
										<>
											Get Report
											<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
												<path d="M5 12h14M12 5l7 7-7 7" />
											</svg>
										</>
									)}
								</button>
							</div>

							{liveError && (
								<motion.p className="mt-2 text-sm text-red-400" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
									{liveError}
								</motion.p>
							)}

							{/* Mock suggestions dropdown */}
							<AnimatePresence>
								{!isLiveMode && showSuggestions && suggestions.length > 0 && !isScanning && (
									<motion.div
										className="absolute z-30 left-0 right-0 mt-2 bg-slate-800 border border-white/10 rounded-xl shadow-2xl overflow-hidden"
										initial={{ opacity: 0, y: -8 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: -8 }}
									>
										{suggestions.map((s) => (
											<button
												key={s.address}
												onClick={() => handleSelectMock(s)}
												className="w-full text-left px-4 py-3 hover:bg-white/5 transition-colors flex items-center gap-3 border-b border-white/5 last:border-0"
											>
												<svg className="text-slate-500 shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
													<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
													<circle cx="12" cy="10" r="3" />
												</svg>
												<div>
													<div className="text-sm font-medium text-white">{s.address}</div>
													<div className="text-xs text-slate-500">{s.city}, {s.state} {s.zip}</div>
												</div>
											</button>
										))}
									</motion.div>
								)}
							</AnimatePresence>
						</motion.div>

						{!isScanning && (
							<motion.p
								className="text-xs text-slate-600 mb-8"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ delay: 0.5 }}
							>
								{isLiveMode
									? 'Enter any US address — powered by Google Solar API'
									: '1 free report — try "742 Evergreen", "1247 Oakwood", "891 Cedar", or "2055 Sunset"'}
							</motion.p>
						)}

						{/* Scan progress — shows during analysis */}
						<AnimatePresence>
							{isScanning && (
								<motion.div
									className="space-y-2.5 mb-8"
									initial={{ opacity: 0, height: 0 }}
									animate={{ opacity: 1, height: 'auto' }}
									exit={{ opacity: 0, height: 0 }}
								>
									{SCAN_STEPS.map((step, i) => {
										const isActive = scanStepIdx === i && !completedSteps.includes(i);
										const isDone = completedSteps.includes(i);
										return (
											<motion.div
												key={step.label}
												className="flex items-center gap-3"
												initial={{ opacity: 0, x: -15 }}
												animate={{ opacity: scanStepIdx >= i ? 1 : 0.25, x: 0 }}
												transition={{ delay: i * 0.08, duration: 0.25 }}
											>
												<div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 transition-all ${
													isDone ? 'bg-emerald-500/20 text-emerald-400'
													: isActive ? 'bg-blue-500/20 text-blue-400'
													: 'bg-white/5 text-slate-600'
												}`}>
													{isDone ? (
														<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
															<polyline points="20 6 9 17 4 12" />
														</svg>
													) : isActive ? (
														<motion.div
															className="w-1.5 h-1.5 bg-blue-400 rounded-full"
															animate={{ scale: [1, 1.5, 1] }}
															transition={{ repeat: Infinity, duration: 0.7 }}
														/>
													) : (
														<div className="w-1.5 h-1.5 bg-slate-700 rounded-full" />
													)}
												</div>
												<span className={`text-sm ${isDone ? 'text-emerald-400' : isActive ? 'text-white' : 'text-slate-600'}`}>
													{step.label}
												</span>
											</motion.div>
										);
									})}
								</motion.div>
							)}
						</AnimatePresence>

						{/* Stats */}
						{!isScanning && (
							<motion.div
								className="grid grid-cols-4 gap-4 pt-8 border-t border-white/5"
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.6 }}
							>
								{STATS.map((stat, i) => (
									<motion.div
										key={stat.label}
										className="text-center"
										initial={{ opacity: 0, y: 10 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ delay: 0.7 + i * 0.1 }}
									>
										<div className="text-xl font-bold text-white">{stat.value}</div>
										<div className="text-xs text-slate-500 mt-0.5">{stat.label}</div>
									</motion.div>
								))}
							</motion.div>
						)}
					</div>

					{/* Right: Map / satellite view */}
					<motion.div
						initial={{ opacity: 0, x: 30 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.6, delay: 0.2 }}
					>
						<MapPlaceholder scanPhase={scanPhase} roofData={selectedAddress} />
					</motion.div>
				</div>

				{/* Trust bar */}
				{!isScanning && (
					<motion.div
						className="mt-16 text-center"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 1 }}
					>
						<p className="text-xs text-slate-600 mb-4">Powered by industry-leading data</p>
						<div className="flex items-center justify-center gap-8">
							{['Google Maps', 'Solar API', 'Satellite Imagery', 'AI Analysis'].map((label) => (
								<span key={label} className="text-xs font-medium text-slate-500 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/5">
									{label}
								</span>
							))}
						</div>
					</motion.div>
				)}

				{/* Footer */}
				<motion.div
					className="mt-12 text-center text-xs text-slate-700 flex items-center justify-center gap-2"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 1.2 }}
				>
					<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
						<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
					</svg>
					Powered by Zuper
				</motion.div>
			</div>
		</div>
	);
}
