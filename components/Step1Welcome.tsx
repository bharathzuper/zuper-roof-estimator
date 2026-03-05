'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RoofData } from '@/lib/types';
import { MOCK_ADDRESSES, filterAddresses } from '@/lib/mock-data';
import { hasGoogleApiKey, geocodeAddress, fetchBuildingInsights, getSatelliteImageUrl } from '@/lib/google-apis';

const isLiveMode = hasGoogleApiKey();

const SCAN_STEPS = [
	{ label: 'Locating property...', duration: 700 },
	{ label: 'Analyzing satellite imagery...', duration: 900 },
	{ label: 'Measuring roof dimensions...', duration: 800 },
	{ label: 'Calculating estimates...', duration: 600 },
];

function MapControls() {
	return (
		<div className="absolute bottom-6 left-6 z-20 flex flex-col gap-1">
			<button className="w-8 h-8 bg-white/90 rounded-sm shadow-md flex items-center justify-center text-gray-600 hover:bg-white transition text-lg font-light">+</button>
			<button className="w-8 h-8 bg-white/90 rounded-sm shadow-md flex items-center justify-center text-gray-600 hover:bg-white transition text-lg font-light">−</button>
		</div>
	);
}

function MapAttribution() {
	return (
		<div className="absolute bottom-2 right-2 z-20 flex items-center gap-2 text-[10px] text-white/50">
			<span>Imagery ©2026 Google</span>
			<span>·</span>
			<span>Terms</span>
		</div>
	);
}

function StreetLabels() {
	return (
		<div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
			{[
				{ text: 'Mockingbird Ln', x: '12%', y: '78%', rotate: 0 },
				{ text: 'High School Ave', x: '82%', y: '25%', rotate: -90 },
				{ text: 'Oxford Ave', x: '8%', y: '50%', rotate: -90 },
				{ text: 'Cambridge Ave', x: '65%', y: '88%', rotate: 0 },
				{ text: 'Victoria Ave', x: '28%', y: '30%', rotate: -75 },
			].map((label) => (
				<span
					key={label.text}
					className="absolute text-[11px] font-medium text-white/30 tracking-wider uppercase whitespace-nowrap"
					style={{
						left: label.x,
						top: label.y,
						transform: `rotate(${label.rotate}deg)`,
					}}
				>
					{label.text}
				</span>
			))}
		</div>
	);
}

function ScanOverlay({ roofData, scanPhase }: { roofData: RoofData; scanPhase: number }) {
	if (scanPhase < 2) return null;

	return (
		<div className="absolute inset-0 z-30 pointer-events-none">
			{/* Scan line */}
			{scanPhase < 4 && (
				<motion.div
					className="absolute left-0 right-0 h-[2px]"
					style={{
						background: 'linear-gradient(90deg, transparent, rgba(45,212,191,0.6), transparent)',
						boxShadow: '0 0 20px rgba(45,212,191,0.3)',
					}}
					initial={{ top: '0%' }}
					animate={{ top: '100%' }}
					transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
				/>
			)}

			{/* Grid overlay */}
			{scanPhase >= 2 && scanPhase < 4 && (
				<motion.div
					className="absolute inset-0"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					style={{
						backgroundImage: `
							linear-gradient(rgba(45,212,191,0.07) 1px, transparent 1px),
							linear-gradient(90deg, rgba(45,212,191,0.07) 1px, transparent 1px)
						`,
						backgroundSize: '35px 35px',
					}}
				/>
			)}

			{/* Roof polygons */}
			{scanPhase >= 3 && (
				<svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
					{roofData.sections.map((section, i) => {
						const pts = section.polygon.map((p) => `${p.x},${p.y}`).join(' ');
						return (
							<motion.polygon
								key={section.id}
								points={pts}
								fill="rgba(45,212,191,0.15)"
								stroke="rgba(45,212,191,0.7)"
								strokeWidth="0.5"
								initial={{ opacity: 0, pathLength: 0 }}
								animate={{ opacity: 1, pathLength: 1 }}
								transition={{ delay: i * 0.25, duration: 0.8 }}
							/>
						);
					})}

					{scanPhase >= 4 && roofData.sections.map((section, i) => {
						const cx = section.polygon.reduce((s, p) => s + p.x, 0) / section.polygon.length;
						const cy = section.polygon.reduce((s, p) => s + p.y, 0) / section.polygon.length;
						return (
							<motion.g key={`tag-${section.id}`} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 + i * 0.15, type: 'spring', stiffness: 300 }}>
								<circle cx={cx} cy={cy} r="3" fill="rgba(45,212,191,0.95)" />
								<text x={cx} y={cy + 1} textAnchor="middle" fill="white" fontSize="2.5" fontWeight="700">{section.id}</text>
							</motion.g>
						);
					})}

					{scanPhase >= 4 && roofData.sections.flatMap((section) =>
						section.dimensions.map((dim, di) => (
							<motion.text
								key={`dim-${section.id}-${di}`}
								x={dim.x} y={dim.y}
								textAnchor="middle" fill="white" fontSize="2" fontWeight="600"
								transform={dim.rotation ? `rotate(${dim.rotation} ${dim.x} ${dim.y})` : undefined}
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ delay: 0.6 + di * 0.1 }}
								style={{ textShadow: '0 1px 6px rgba(0,0,0,0.9)' }}
							>{dim.label}</motion.text>
						))
					)}
				</svg>
			)}
		</div>
	);
}

export default function Step1Welcome({ onAddressSelected }: { onAddressSelected: (data: RoofData) => void }) {
	const [query, setQuery] = useState('');
	const [suggestions, setSuggestions] = useState<RoofData[]>([]);
	const [showSuggestions, setShowSuggestions] = useState(false);
	const [activeTab, setActiveTab] = useState<'report' | 'chat'>('report');
	const [selectedAddress, setSelectedAddress] = useState<RoofData | null>(null);
	const [scanPhase, setScanPhase] = useState(0);
	const [scanStepIdx, setScanStepIdx] = useState(-1);
	const [completedSteps, setCompletedSteps] = useState<number[]>([]);
	const [mapZoomed, setMapZoomed] = useState(false);
	const [isLoadingLive, setIsLoadingLive] = useState(false);
	const [liveError, setLiveError] = useState('');
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (!isLiveMode && query.length >= 2 && !selectedAddress) {
			const results = filterAddresses(query);
			setSuggestions(results.length > 0 ? results : MOCK_ADDRESSES);
			setShowSuggestions(true);
		} else {
			setSuggestions([]);
			setShowSuggestions(false);
		}
	}, [query, selectedAddress]);

	const runScanAnimation = useCallback((data: RoofData) => {
		setSelectedAddress(data);
		setMapZoomed(true);
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
			setTimeout(() => onAddressSelected(data), 1000);
		}, totalTime + 400);
	}, [onAddressSelected]);

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
			if (!coords) { setLiveError('Address not found.'); setIsLoadingLive(false); return; }
			const satelliteUrl = getSatelliteImageUrl(coords.lat, coords.lng);
			const partial: RoofData = {
				address: query, city: '', state: '', zip: '',
				roofAreaSqFt: 0, pitch: '0/12', pitchLabel: '', sections: [], stories: 1,
				buildingType: 'residential', currentMaterial: 'asphalt',
				satelliteImageUrl: satelliteUrl, confidence: 0,
			};
			setSelectedAddress(partial);
			setMapZoomed(true);
			setScanPhase(1);
			const roofData = await fetchBuildingInsights(coords.lat, coords.lng);
			if (roofData) { roofData.address = query; runScanAnimation(roofData); }
			else { setLiveError('Roof data not available for this location.'); setSelectedAddress(null); setMapZoomed(false); setScanPhase(0); }
		} catch { setLiveError('Something went wrong.'); }
		finally { setIsLoadingLive(false); }
	};

	const isScanning = selectedAddress !== null;

	return (
		<div className="relative w-full h-screen overflow-hidden">
			{/* Full-bleed satellite map background */}
			<motion.div
				className="absolute inset-0"
				animate={{
					scale: mapZoomed ? 1.8 : 1,
					filter: mapZoomed ? 'brightness(0.6)' : 'brightness(0.85)',
				}}
				transition={{ duration: 2.5, ease: [0.22, 1, 0.36, 1] }}
			>
				{/* Base satellite imagery */}
				{selectedAddress?.satelliteImageUrl ? (
					<motion.div
						className="absolute inset-0 bg-cover bg-center"
						style={{ backgroundImage: `url(${selectedAddress.satelliteImageUrl})` }}
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 1 }}
					/>
				) : (
					<div className="absolute inset-0 satellite-bg">
						{/* Multi-layer CSS satellite effect */}
						<div className="absolute inset-0" style={{
							background: `
								radial-gradient(ellipse 800px 600px at 30% 40%, #1e3a2f 0%, transparent 70%),
								radial-gradient(ellipse 600px 500px at 70% 60%, #2a3020 0%, transparent 70%),
								radial-gradient(ellipse 400px 300px at 50% 30%, #2d3a2a 0%, transparent 60%),
								linear-gradient(135deg, #1a2a1e 0%, #1c2620 30%, #202820 60%, #1a2218 100%)
							`,
						}} />
						{/* Grid: streets */}
						<div className="absolute inset-0 opacity-[0.12]" style={{
							backgroundImage: `
								linear-gradient(0deg, rgba(180,190,170,0.4) 1px, transparent 1px),
								linear-gradient(90deg, rgba(180,190,170,0.4) 1px, transparent 1px),
								linear-gradient(0deg, rgba(200,210,190,0.15) 1px, transparent 1px),
								linear-gradient(90deg, rgba(200,210,190,0.15) 1px, transparent 1px)
							`,
							backgroundSize: '180px 180px, 180px 180px, 45px 45px, 45px 45px',
						}} />
						{/* Rooftop shapes */}
						<svg className="absolute inset-0 w-full h-full opacity-[0.08]" viewBox="0 0 100 100" preserveAspectRatio="none">
							{[
								'10,15 18,15 18,22 10,22', '22,10 30,10 30,18 22,18',
								'35,20 45,20 45,30 35,30', '55,12 65,12 65,22 55,22',
								'72,18 82,18 82,28 72,28', '15,35 25,35 25,45 15,45',
								'40,40 50,40 50,50 40,50', '60,35 72,35 72,48 60,48',
								'80,40 90,40 90,50 80,50', '20,55 32,55 32,65 20,65',
								'45,58 55,58 55,68 45,68', '65,55 78,55 78,68 65,68',
								'10,72 22,72 22,82 10,82', '30,75 42,75 42,85 30,85',
								'55,72 65,72 65,82 55,82', '75,70 88,70 88,82 75,82',
							].map((pts, i) => (
								<polygon key={i} points={pts} fill="rgba(100,120,90,0.6)" stroke="rgba(80,100,70,0.3)" strokeWidth="0.3" />
							))}
						</svg>
					</div>
				)}
			</motion.div>

			{/* Vignette + noise */}
			<div className="vignette noise absolute inset-0 z-10" />

			{/* Street labels (decorative) */}
			{!mapZoomed && <StreetLabels />}

			{/* Scan overlay during analysis */}
			{selectedAddress && <ScanOverlay roofData={selectedAddress} scanPhase={scanPhase} />}

			{/* Map controls */}
			{!isScanning && <MapControls />}
			<MapAttribution />

			{/* Header */}
			<motion.header
				className="absolute top-0 left-0 right-0 z-40 flex items-center justify-between px-6 py-4"
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: isScanning ? 0 : 1, y: isScanning ? -20 : 0 }}
				transition={{ duration: 0.5 }}
			>
				<div className="flex items-center gap-2">
					<div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center">
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
							<path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
							<polyline points="9 22 9 12 15 12 15 22" />
						</svg>
					</div>
					<span className="font-display text-lg font-bold text-white">zuper roofing</span>
				</div>
				<div className="flex items-center gap-3">
					<button className="text-sm text-white/70 hover:text-white transition px-3 py-1.5">Sign In</button>
					<button className="text-sm font-semibold text-white bg-teal-500 hover:bg-teal-600 transition px-4 py-1.5 rounded-lg">Sign Up Free</button>
				</div>
			</motion.header>

			{/* Central content */}
			<div className="absolute inset-0 z-30 flex flex-col items-center justify-center px-4">
				<AnimatePresence>
					{!isScanning && (
						<motion.div
							className="flex flex-col items-center w-full max-w-xl"
							initial={{ opacity: 0, y: 30 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -40, scale: 0.95 }}
							transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
						>
							{/* Headline */}
							<h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-center leading-[1.05] mb-4">
								<span className="text-gradient-teal">AI Roof Reports</span>
								<br />
								<span className="text-white">in 30 Seconds.</span>
							</h1>

							<p className="text-white/60 text-base sm:text-lg text-center mb-6 max-w-md">
								Search any address — get roof area, pitch, and cost estimates instantly.
							</p>

							{/* Badge */}
							<motion.div
								className="inline-flex items-center gap-2 mb-5 px-4 py-1.5 rounded-full bg-black/30 backdrop-blur-sm border border-white/10"
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.3 }}
							>
								<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-teal-400">
									<rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
								</svg>
								<span className="text-xs text-white/70">1 free report — no signup needed</span>
							</motion.div>

							{/* Search card */}
							<motion.div
								className="glass-card w-full rounded-2xl overflow-hidden"
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.2, type: 'spring', stiffness: 120 }}
							>
								{/* Tabs */}
								<div className="flex border-b border-gray-200">
									<button
										onClick={() => setActiveTab('chat')}
										className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
											activeTab === 'chat' ? 'text-gray-900 border-b-2 border-teal-500' : 'text-gray-400 hover:text-gray-600'
										}`}
									>
										<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
											<path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
										</svg>
										AI Chat
									</button>
									<button
										onClick={() => setActiveTab('report')}
										className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
											activeTab === 'report' ? 'text-gray-900 border-b-2 border-teal-500' : 'text-gray-400 hover:text-gray-600'
										}`}
									>
										<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
											<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" />
										</svg>
										Instant Report
									</button>
								</div>

								{/* Input */}
								<div className="p-4">
									<div className="relative">
										<svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
											<circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
										</svg>
										<input
											ref={inputRef}
											type="text"
											value={query}
											onChange={(e) => setQuery(e.target.value)}
											onKeyDown={(e) => {
												if (e.key === 'Enter') {
													if (isLiveMode) handleLiveSearch();
													else if (suggestions.length > 0) handleSelectMock(suggestions[0]);
												}
											}}
											placeholder="Try it — enter any address"
											className="w-full pl-10 pr-10 py-3 text-sm text-gray-900 bg-white border border-gray-200 rounded-xl focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all"
										/>
										<button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition">
											<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
												<circle cx="12" cy="12" r="10" /><line x1="22" y1="22" x2="16.65" y2="16.65" />
											</svg>
										</button>
									</div>

									{liveError && (
										<p className="mt-2 text-xs text-red-500">{liveError}</p>
									)}

									{/* Suggestions dropdown */}
									<AnimatePresence>
										{showSuggestions && suggestions.length > 0 && (
											<motion.div
												className="mt-2 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden"
												initial={{ opacity: 0, y: -5 }}
												animate={{ opacity: 1, y: 0 }}
												exit={{ opacity: 0, y: -5 }}
											>
												{suggestions.map((s) => (
													<button
														key={s.address}
														onClick={() => handleSelectMock(s)}
														className="w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors flex items-center gap-3 border-b border-gray-50 last:border-0"
													>
														<svg className="text-gray-400 shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
															<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
														</svg>
														<div>
															<div className="text-sm font-medium text-gray-900">{s.address}</div>
															<div className="text-xs text-gray-500">{s.city}, {s.state} {s.zip}</div>
														</div>
													</button>
												))}
											</motion.div>
										)}
									</AnimatePresence>

									{/* CTA Button */}
									<button
										onClick={() => {
											if (isLiveMode) handleLiveSearch();
											else if (suggestions.length > 0) handleSelectMock(suggestions[0]);
										}}
										disabled={isLoadingLive}
										className="w-full mt-3 py-3 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
									>
										{isLoadingLive ? (
											<motion.div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.7, ease: 'linear' }} />
										) : (
											'Get Free Roof Report'
										)}
									</button>
								</div>

								{/* Rating bar */}
								<div className="flex items-center justify-center gap-3 pb-4 text-xs text-gray-500">
									<div className="flex items-center gap-1">
										{[1, 2, 3, 4, 5].map((i) => (
											<svg key={i} width="12" height="12" viewBox="0 0 24 24" fill="#facc15" stroke="none">
												<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
											</svg>
										))}
										<span className="font-semibold text-gray-700 ml-0.5">4.9</span>
									</div>
									<span className="text-gray-300">·</span>
									<span>2,000+ roofers</span>
								</div>
							</motion.div>

							{!isLiveMode && (
								<p className="mt-3 text-[11px] text-white/30">
									Try: &quot;742 Evergreen&quot;, &quot;1247 Oakwood&quot;, &quot;891 Cedar&quot;, or &quot;2055 Sunset&quot;
								</p>
							)}
						</motion.div>
					)}
				</AnimatePresence>

				{/* Scan progress overlay (during analysis) */}
				<AnimatePresence>
					{isScanning && (
						<motion.div
							className="glass-dark rounded-2xl p-6 w-full max-w-sm"
							initial={{ opacity: 0, scale: 0.9 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ delay: 0.3, type: 'spring', stiffness: 150 }}
						>
							<div className="text-center mb-5">
								<div className="w-12 h-12 rounded-full bg-teal-500/15 flex items-center justify-center mx-auto mb-3">
									<motion.div
										animate={{ rotate: 360 }}
										transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
									>
										<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2dd4bf" strokeWidth="2">
											<path d="M21 12a9 9 0 11-6.219-8.56" />
										</svg>
									</motion.div>
								</div>
								<h3 className="font-display text-lg font-bold text-white">Analyzing Property</h3>
								<p className="text-xs text-white/40 mt-1">{query}</p>
							</div>

							<div className="space-y-3">
								{SCAN_STEPS.map((step, i) => {
									const isActive = scanStepIdx === i && !completedSteps.includes(i);
									const isDone = completedSteps.includes(i);
									return (
										<motion.div
											key={step.label}
											className="flex items-center gap-3"
											initial={{ opacity: 0, x: -10 }}
											animate={{ opacity: scanStepIdx >= i ? 1 : 0.2, x: 0 }}
											transition={{ delay: i * 0.08, duration: 0.2 }}
										>
											<div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all ${
												isDone ? 'bg-teal-500' : isActive ? 'bg-teal-500/20' : 'bg-white/5'
											}`}>
												{isDone ? (
													<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
												) : isActive ? (
													<motion.div className="w-1.5 h-1.5 bg-teal-400 rounded-full" animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 0.6 }} />
												) : (
													<div className="w-1.5 h-1.5 bg-white/10 rounded-full" />
												)}
											</div>
											<span className={`text-sm ${isDone ? 'text-teal-400 font-medium' : isActive ? 'text-white' : 'text-white/20'}`}>
												{step.label}
											</span>
										</motion.div>
									);
								})}
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</div>

			{/* Bottom: "Learn More" */}
			{!isScanning && (
				<motion.div
					className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 1 }}
				>
					<button className="text-xs text-white/40 hover:text-white/60 transition flex flex-col items-center gap-1">
						Learn More
						<motion.svg
							width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
							animate={{ y: [0, 3, 0] }}
							transition={{ repeat: Infinity, duration: 1.5 }}
						>
							<polyline points="6 9 12 15 18 9" />
						</motion.svg>
					</button>
				</motion.div>
			)}
		</div>
	);
}
