'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RoofData } from '@/lib/types';
import { MOCK_ADDRESSES, filterAddresses } from '@/lib/mock-data';
import { hasGoogleApiKey, geocodeAddress, fetchBuildingInsights, getSatelliteImageUrl } from '@/lib/google-apis';

const SCAN_STEPS = [
	{ label: 'Locating your property...', icon: '📍', duration: 800 },
	{ label: 'Analyzing satellite imagery...', icon: '🛰️', duration: 1000 },
	{ label: 'Measuring roof dimensions...', icon: '📐', duration: 900 },
	{ label: 'Detecting roof features...', icon: '✨', duration: 700 },
];

const isLiveMode = hasGoogleApiKey();

function SatelliteOverlay({ roofData, scanPhase }: { roofData: RoofData; scanPhase: number }) {
	return (
		<div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-slate-800">
			<motion.div
				className="absolute inset-0 bg-cover bg-center"
				style={{ backgroundImage: `url(${roofData.satelliteImageUrl})` }}
				initial={{ scale: 2, filter: 'blur(8px)' }}
				animate={{
					scale: scanPhase >= 1 ? 1 : 2,
					filter: scanPhase >= 1 ? 'blur(0px)' : 'blur(8px)',
				}}
				transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
			/>

			{scanPhase >= 2 && (
				<div className="absolute inset-0 overflow-hidden pointer-events-none">
					<motion.div
						className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-sky-400 to-transparent opacity-60"
						initial={{ top: '-4px' }}
						animate={{ top: '100%' }}
						transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
					/>
					<div className="absolute inset-0" style={{
						backgroundImage: `
							linear-gradient(rgba(14, 165, 233, 0.08) 1px, transparent 1px),
							linear-gradient(90deg, rgba(14, 165, 233, 0.08) 1px, transparent 1px)
						`,
						backgroundSize: '30px 30px',
					}} />
				</div>
			)}

			{scanPhase >= 3 && (
				<svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
					{roofData.sections.map((section, i) => {
						const points = section.polygon.map((p) => `${p.x},${p.y}`).join(' ');
						return (
							<motion.polygon
								key={section.id}
								points={points}
								fill="rgba(14, 165, 233, 0.2)"
								stroke="rgba(14, 165, 233, 0.8)"
								strokeWidth="0.5"
								className="animate-draw-path"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ delay: i * 0.3, duration: 0.5 }}
							/>
						);
					})}

					{scanPhase >= 4 &&
						roofData.sections.map((section, i) => (
							<motion.g
								key={`label-${section.id}`}
								initial={{ opacity: 0, scale: 0 }}
								animate={{ opacity: 1, scale: 1 }}
								transition={{ delay: 0.5 + i * 0.2, type: 'spring' }}
							>
								<circle
									cx={section.polygon.reduce((s, p) => s + p.x, 0) / section.polygon.length}
									cy={section.polygon.reduce((s, p) => s + p.y, 0) / section.polygon.length}
									r="4"
									fill="rgba(14, 165, 233, 0.9)"
								/>
								<text
									x={section.polygon.reduce((s, p) => s + p.x, 0) / section.polygon.length}
									y={section.polygon.reduce((s, p) => s + p.y, 0) / section.polygon.length + 1}
									textAnchor="middle"
									fill="white"
									fontSize="3"
									fontWeight="bold"
								>
									{section.id}
								</text>
							</motion.g>
						))}

					{scanPhase >= 4 &&
						roofData.sections.flatMap((section) =>
							section.dimensions.map((dim, di) => (
								<motion.text
									key={`dim-${section.id}-${di}`}
									x={dim.x}
									y={dim.y}
									textAnchor="middle"
									fill="white"
									fontSize="2.5"
									fontWeight="600"
									transform={dim.rotation ? `rotate(${dim.rotation} ${dim.x} ${dim.y})` : undefined}
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									transition={{ delay: 0.8 + di * 0.15 }}
									style={{ textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}
								>
									{dim.label}
								</motion.text>
							))
						)}
				</svg>
			)}

			{scanPhase < 4 && (
				<div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
			)}
		</div>
	);
}

export default function Step2Address({
	onAddressSelected,
	onBack,
}: {
	onAddressSelected: (data: RoofData) => void;
	onBack: () => void;
}) {
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
	const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

	const searchLiveAddresses = useCallback(async (q: string) => {
		if (!isLiveMode || q.length < 5) return;
		// In live mode, we show a "Search" button instead of suggestions
		// since we'll geocode the full address when they submit
	}, []);

	useEffect(() => {
		if (!isLiveMode) {
			if (query.length >= 2) {
				const results = filterAddresses(query);
				setSuggestions(results.length > 0 ? results : MOCK_ADDRESSES);
				setShowSuggestions(true);
			} else {
				setSuggestions([]);
				setShowSuggestions(false);
			}
		} else {
			if (debounceRef.current) clearTimeout(debounceRef.current);
			debounceRef.current = setTimeout(() => searchLiveAddresses(query), 300);
		}
	}, [query, searchLiveAddresses]);

	const handleSelectMock = (data: RoofData) => {
		setQuery(`${data.address}, ${data.city}, ${data.state} ${data.zip}`);
		setSelectedAddress(data);
		setShowSuggestions(false);
		startScan(data);
	};

	const handleLiveSearch = async () => {
		if (!query.trim()) return;
		setIsLoadingLive(true);
		setLiveError('');

		try {
			const coords = await geocodeAddress(query);
			if (!coords) {
				setLiveError('Could not find that address. Please try a more specific address.');
				setIsLoadingLive(false);
				return;
			}

			const satelliteUrl = getSatelliteImageUrl(coords.lat, coords.lng);

			// Start the scan animation with satellite image while Solar API loads
			const partialData: RoofData = {
				address: query,
				city: '',
				state: '',
				zip: '',
				roofAreaSqFt: 0,
				pitch: '0/12',
				pitchLabel: '',
				sections: [],
				stories: 1,
				buildingType: 'residential',
				currentMaterial: 'asphalt',
				satelliteImageUrl: satelliteUrl,
				confidence: 0,
			};

			setSelectedAddress(partialData);
			setScanPhase(1);
			setScanStepIdx(0);

			// Fetch real roof data from Solar API
			const roofData = await fetchBuildingInsights(coords.lat, coords.lng);

			if (roofData) {
				roofData.address = query;
				setSelectedAddress(roofData);
				runScanAnimation(roofData);
			} else {
				setLiveError('Roof analysis not available for this address. Solar API coverage may be limited.');
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

	const runScanAnimation = (data: RoofData) => {
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
			setTimeout(() => onAddressSelected(data), 600);
		}, totalTime + 300);
	};

	const startScan = (data: RoofData) => {
		runScanAnimation(data);
	};

	const isScanning = selectedAddress !== null;

	return (
		<div className="min-h-screen flex items-center justify-center pt-16 pb-8 px-4">
			<div className="w-full max-w-2xl">
				<motion.button
					onClick={onBack}
					className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 mb-6 transition-colors"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
				>
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
						<path d="M19 12H5M12 19l-7-7 7-7" />
					</svg>
					Back
				</motion.button>

				<motion.div
					className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-8"
					initial={{ opacity: 0, y: 30 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
				>
					<motion.h2
						className="text-2xl font-bold text-slate-900 mb-2"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.2 }}
					>
						What&apos;s your address?
					</motion.h2>
					<motion.p
						className="text-slate-500 text-sm mb-6"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.3 }}
					>
						{isLiveMode
							? 'Enter your full address — we\'ll analyze the real satellite imagery'
							: 'We\'ll use satellite imagery to analyze your roof'}
					</motion.p>

					{/* Mode indicator */}
					{isLiveMode && (
						<motion.div
							className="flex items-center gap-2 mb-4 px-3 py-2 bg-emerald-50 rounded-lg border border-emerald-200"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.25 }}
						>
							<div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
							<span className="text-xs font-medium text-emerald-700">
								Live Mode — Using Google Solar API for real satellite analysis
							</span>
						</motion.div>
					)}

					<div className="relative mb-6">
						<div className="relative flex gap-2">
							<div className="relative flex-1">
								<svg className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
									placeholder={isLiveMode ? 'Enter your full street address' : 'Enter your street address'}
									disabled={isScanning}
									className="w-full pl-11 pr-10 py-4 text-base border-2 border-slate-200 rounded-xl focus:border-sky-400 focus:ring-4 focus:ring-sky-100 outline-none transition-all disabled:bg-slate-50 disabled:text-slate-500"
								/>
								{query && !isScanning && (
									<button
										onClick={() => { setQuery(''); setSuggestions([]); setLiveError(''); }}
										className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
									>
										<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
											<circle cx="12" cy="12" r="10" />
											<path d="M15 9l-6 6M9 9l6 6" />
										</svg>
									</button>
								)}
							</div>

							{isLiveMode && !isScanning && (
								<button
									onClick={handleLiveSearch}
									disabled={!query.trim() || isLoadingLive}
									className="px-6 py-4 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed shrink-0 flex items-center gap-2"
								>
									{isLoadingLive ? (
										<>
											<motion.div
												className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
												animate={{ rotate: 360 }}
												transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
											/>
											Analyzing...
										</>
									) : (
										<>
											Search
											<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
												<path d="M5 12h14M12 5l7 7-7 7" />
											</svg>
										</>
									)}
								</button>
							)}
						</div>

						{liveError && (
							<motion.p
								className="mt-2 text-sm text-red-500 flex items-center gap-1"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
							>
								<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
									<circle cx="12" cy="12" r="10" />
									<path d="M15 9l-6 6M9 9l6 6" />
								</svg>
								{liveError}
							</motion.p>
						)}

						{/* Mock mode suggestions */}
						<AnimatePresence>
							{!isLiveMode && showSuggestions && suggestions.length > 0 && !isScanning && (
								<motion.div
									className="absolute z-20 left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden"
									initial={{ opacity: 0, y: -10 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -10 }}
								>
									{suggestions.map((s) => (
										<button
											key={s.address}
											onClick={() => handleSelectMock(s)}
											className="w-full text-left px-4 py-3 hover:bg-sky-50 transition-colors flex items-center gap-3 border-b border-slate-100 last:border-0"
										>
											<svg className="text-slate-400 shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
												<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
												<circle cx="12" cy="10" r="3" />
											</svg>
											<div>
												<div className="text-sm font-medium text-slate-900">{s.address}</div>
												<div className="text-xs text-slate-500">
													{s.city}, {s.state} {s.zip}
												</div>
											</div>
										</button>
									))}
								</motion.div>
							)}
						</AnimatePresence>
					</div>

					{selectedAddress && (
						<motion.div
							initial={{ opacity: 0, height: 0 }}
							animate={{ opacity: 1, height: 'auto' }}
							transition={{ duration: 0.5 }}
						>
							<SatelliteOverlay roofData={selectedAddress} scanPhase={scanPhase} />

							<div className="mt-6 space-y-3">
								{SCAN_STEPS.map((step, i) => {
									const isActive = scanStepIdx === i && !completedSteps.includes(i);
									const isDone = completedSteps.includes(i);
									return (
										<motion.div
											key={step.label}
											className="flex items-center gap-3"
											initial={{ opacity: 0, x: -20 }}
											animate={{ opacity: scanStepIdx >= i ? 1 : 0.3, x: 0 }}
											transition={{ delay: i * 0.1, duration: 0.3 }}
										>
											<div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm shrink-0 transition-colors ${
												isDone
													? 'bg-emerald-100 text-emerald-600'
													: isActive
													? 'bg-sky-100 text-sky-600'
													: 'bg-slate-100 text-slate-400'
											}`}>
												{isDone ? (
													<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
														<polyline points="20 6 9 17 4 12" />
													</svg>
												) : isActive ? (
													<motion.div
														className="w-2 h-2 bg-sky-500 rounded-full"
														animate={{ scale: [1, 1.5, 1] }}
														transition={{ repeat: Infinity, duration: 0.8 }}
													/>
												) : (
													<div className="w-2 h-2 bg-slate-300 rounded-full" />
												)}
											</div>
											<span className={`text-sm ${isDone ? 'text-emerald-700 font-medium' : isActive ? 'text-slate-900 font-medium' : 'text-slate-400'}`}>
												{step.label}
											</span>
										</motion.div>
									);
								})}
							</div>
						</motion.div>
					)}

					{!isScanning && !isLiveMode && (
						<motion.p
							className="text-xs text-slate-400 text-center mt-4"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.5 }}
						>
							Try: &quot;742 Evergreen&quot;, &quot;1247 Oakwood&quot;, &quot;891 Cedar&quot;, or &quot;2055 Sunset&quot;
						</motion.p>
					)}

					{!isScanning && isLiveMode && (
						<motion.p
							className="text-xs text-slate-400 text-center mt-4"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.5 }}
						>
							Enter any US address — we use Google Solar API to analyze real satellite imagery
						</motion.p>
					)}
				</motion.div>
			</div>
		</div>
	);
}
