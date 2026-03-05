'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import gsap from 'gsap';
import MapView, { MapViewHandle } from './MapView';
import { RoofData } from '@/lib/types';
import { MOCK_ADDRESSES, filterAddresses } from '@/lib/mock-data';
import { hasGoogleApiKey, geocodeAddress, fetchBuildingInsights } from '@/lib/google-apis';

const isLiveMode = hasGoogleApiKey();

const SCAN_STEPS = [
	{ label: 'Locating property', duration: 800 },
	{ label: 'Analyzing satellite imagery', duration: 1000 },
	{ label: 'Detecting roof geometry', duration: 900 },
	{ label: 'Computing estimates', duration: 700 },
];

export default function Step1Welcome({
	onAddressSelected,
}: {
	onAddressSelected: (data: RoofData) => void;
}) {
	const containerRef = useRef<HTMLDivElement>(null);
	const mapRef = useRef<MapViewHandle>(null);
	const [query, setQuery] = useState('');
	const [suggestions, setSuggestions] = useState<RoofData[]>([]);
	const [showSuggestions, setShowSuggestions] = useState(false);
	const [activeTab, setActiveTab] = useState<'report' | 'chat'>('report');
	const [isScanning, setIsScanning] = useState(false);
	const [scanStepIdx, setScanStepIdx] = useState(-1);
	const [completedSteps, setCompletedSteps] = useState<number[]>([]);
	const [isLoadingLive, setIsLoadingLive] = useState(false);
	const [liveError, setLiveError] = useState('');

	useEffect(() => {
		if (!containerRef.current) return;
		const ctx = gsap.context(() => {
			const tl = gsap.timeline({ delay: 0.6 });
			tl.from('.hero-title-line', {
				y: 50, opacity: 0, duration: 0.9, ease: 'power4.out', stagger: 0.12,
			})
			.from('.hero-sub', {
				y: 20, opacity: 0, duration: 0.6, ease: 'power3.out',
			}, '-=0.4')
			.from('.hero-badge', {
				y: 14, opacity: 0, duration: 0.5, ease: 'power3.out',
			}, '-=0.3')
			.from('.hero-card', {
				y: 30, opacity: 0, duration: 0.7, ease: 'power3.out',
			}, '-=0.25')
			.from('.hero-learn-more', {
				opacity: 0, duration: 0.6, ease: 'power2.out',
			}, '-=0.1');
		}, containerRef);
		return () => ctx.revert();
	}, []);

	useEffect(() => {
		if (!isLiveMode && query.length >= 2 && !isScanning) {
			const results = filterAddresses(query);
			setSuggestions(results.length > 0 ? results : MOCK_ADDRESSES);
			setShowSuggestions(true);
		} else {
			setSuggestions([]);
			setShowSuggestions(false);
		}
	}, [query, isScanning]);

	const runScan = useCallback(
		(data: RoofData) => {
			gsap.to('.search-ui', {
				y: -30, opacity: 0, duration: 0.45, ease: 'power2.in',
				onComplete: () => {
					setIsScanning(true);
					mapRef.current?.flyTo(data.lng, data.lat);

					gsap.from('.scan-card', {
						scale: 0.92, opacity: 0, duration: 0.5, ease: 'power3.out', delay: 0.3,
					});

					let elapsed = 800;
					SCAN_STEPS.forEach((step, i) => {
						elapsed += step.duration;
						setTimeout(() => {
							setScanStepIdx(i);
							if (i > 0) setCompletedSteps((prev) => [...prev, i - 1]);
						}, elapsed);
					});

					const total = SCAN_STEPS.reduce((s, st) => s + st.duration, 0) + 800;
					setTimeout(() => {
						setCompletedSteps([0, 1, 2, 3]);
						setTimeout(() => onAddressSelected(data), 900);
					}, total + 400);
				},
			});
		},
		[onAddressSelected],
	);

	const handleSelectMock = (data: RoofData) => {
		setQuery(`${data.address}, ${data.city}, ${data.state}`);
		setShowSuggestions(false);
		runScan(data);
	};

	const handleLiveSearch = async () => {
		if (!query.trim()) return;
		setIsLoadingLive(true);
		setLiveError('');
		try {
			const coords = await geocodeAddress(query);
			if (!coords) { setLiveError('Address not found.'); setIsLoadingLive(false); return; }
			const roofData = await fetchBuildingInsights(coords.lat, coords.lng);
			if (roofData) { roofData.address = query; runScan(roofData); }
			else { setLiveError('Roof data not available for this location.'); }
		} catch { setLiveError('Something went wrong.'); }
		finally { setIsLoadingLive(false); }
	};

	const handleSubmit = () => {
		if (isLiveMode) handleLiveSearch();
		else if (suggestions.length > 0) handleSelectMock(suggestions[0]);
	};

	return (
		<div ref={containerRef} className="relative w-full h-screen overflow-hidden">
			{/* Interactive satellite map */}
			<MapView ref={mapRef} className="absolute inset-0 z-0" />

			{/* Vignette */}
			<div className="vignette absolute inset-0 z-10" />

			{/* Scan line */}
			{isScanning && (
				<div
					className="absolute left-0 right-0 h-[2px] z-20"
					style={{
						background: 'linear-gradient(90deg, transparent, rgba(136,255,87,0.5), transparent)',
						boxShadow: '0 0 30px rgba(136,255,87,0.2)',
						animation: 'scan-sweep 2.8s linear infinite',
					}}
				/>
			)}

			{/* Header */}
			<header
				className="absolute top-0 left-0 right-0 z-40 flex items-center justify-between px-6 sm:px-10 py-4"
				style={{ opacity: isScanning ? 0 : 1, transition: 'opacity 0.4s' }}
			>
				<div className="flex items-center gap-3">
					<div className="w-9 h-9 rounded-lg flex items-center justify-center bg-[#2dd4bf]">
						<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
							<path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
							<polyline points="9 22 9 12 15 12 15 22" />
						</svg>
					</div>
					<span className="font-display text-base font-bold text-white tracking-wide">
						zuper roofing
					</span>
				</div>
				<div className="flex items-center gap-4">
					<button className="text-sm text-white/70 hover:text-white transition-colors">
						Sign In
					</button>
					<button className="text-sm font-semibold px-5 py-2 rounded-lg bg-[#2dd4bf] text-white hover:bg-[#14b8a6] transition-all">
						Sign Up Free
					</button>
				</div>
			</header>

			{/* ── Search UI ── */}
			{!isScanning && (
				<div className="absolute inset-0 z-30 flex flex-col items-center justify-center px-4 search-ui">
					{/* Title */}
					<h1 className="font-display font-bold text-center text-shadow-hero mb-3" style={{ fontSize: 'clamp(2.8rem, 7vw, 5.5rem)', lineHeight: '1.05' }}>
						<span className="hero-title-line block text-[#2dd4bf]">AI Roof Reports</span>
						<span className="hero-title-line block text-white">in 30 Seconds.</span>
					</h1>

					{/* Subtitle */}
					<p className="hero-sub text-center max-w-md mb-5 text-white/60 text-base">
						Search any address — get roof area, pitch, and cost estimates instantly.
					</p>

					{/* Badge */}
					<div className="hero-badge mb-4">
						<span className="inline-flex items-center gap-2 text-xs font-medium px-4 py-2 rounded-full bg-black/40 backdrop-blur-sm text-white/80 border border-white/10">
							<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-70">
								<rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
							</svg>
							1 free report — no signup needed
						</span>
					</div>

					{/* ── White search card ── */}
					<div
						className="hero-card w-full max-w-[520px] rounded-2xl overflow-hidden"
						style={{
							background: 'rgba(255,255,255,0.97)',
							backdropFilter: 'blur(20px)',
							boxShadow: '0 12px 48px rgba(0,0,0,0.25), 0 2px 8px rgba(0,0,0,0.1)',
						}}
					>
						{/* Tabs */}
						<div className="flex border-b border-gray-200">
							<button
								onClick={() => setActiveTab('chat')}
								className={`flex-1 py-3.5 text-sm font-medium flex items-center justify-center gap-2 transition-colors border-b-2 ${
									activeTab === 'chat'
										? 'text-gray-900 border-[#2dd4bf]'
										: 'text-gray-400 border-transparent hover:text-gray-600'
								}`}
							>
								<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
									<path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
								</svg>
								Rooftops Chat
							</button>
							<button
								onClick={() => setActiveTab('report')}
								className={`flex-1 py-3.5 text-sm font-medium flex items-center justify-center gap-2 transition-colors border-b-2 ${
									activeTab === 'report'
										? 'text-gray-900 border-[#2dd4bf]'
										: 'text-gray-400 border-transparent hover:text-gray-600'
								}`}
							>
								<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
									<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" />
								</svg>
								Instant Report
							</button>
						</div>

						{/* Card body */}
						<div className="px-5 pt-4 pb-5">
							{/* Input */}
							<div className="relative">
								<svg
									className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
									width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
								>
									<circle cx="11" cy="11" r="8" />
									<path d="M21 21l-4.35-4.35" />
								</svg>
								<input
									type="text"
									value={query}
									onChange={(e) => setQuery(e.target.value)}
									onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
									placeholder="Try it — enter any address"
									className="w-full h-12 pl-11 pr-11 text-sm text-gray-900 bg-white border border-gray-200 rounded-xl placeholder:text-gray-400 focus:outline-none focus:border-[#2dd4bf] focus:ring-2 focus:ring-[#2dd4bf]/20 transition-all"
								/>
								<button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors">
									<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
										<circle cx="12" cy="12" r="10" /><line x1="2" y1="2" x2="22" y2="22" className="hidden" />
									</svg>
								</button>
							</div>

							{liveError && (
								<p className="mt-2 text-xs text-red-500 font-medium">{liveError}</p>
							)}

							{/* Suggestions dropdown */}
							{showSuggestions && suggestions.length > 0 && (
								<div className="mt-2 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden">
									{suggestions.map((s) => (
										<button
											key={s.address}
											onClick={() => handleSelectMock(s)}
											className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
										>
											<svg className="text-gray-400 shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
												<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
												<circle cx="12" cy="10" r="3" />
											</svg>
											<div>
												<div className="text-sm font-medium text-gray-900">{s.address}</div>
												<div className="text-xs text-gray-500">{s.city}, {s.state} {s.zip}</div>
											</div>
										</button>
									))}
								</div>
							)}

							{/* CTA Button */}
							<button
								onClick={handleSubmit}
								disabled={isLoadingLive}
								className="w-full h-12 mt-3 rounded-xl text-sm font-semibold text-white bg-gray-900 hover:bg-gray-800 transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
							>
								{isLoadingLive ? (
									<>
										<span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
										Searching...
									</>
								) : (
									'Get Free Roof Report'
								)}
							</button>

							{/* Trust bar */}
							<div className="flex items-center justify-center gap-3 mt-4 text-xs text-gray-500">
								<div className="flex items-center gap-1">
									{[1, 2, 3, 4, 5].map((i) => (
										<svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="#facc15" stroke="none">
											<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
										</svg>
									))}
									<span className="font-bold text-gray-700 ml-0.5">4.9</span>
								</div>
								<span className="text-gray-300">·</span>
								<span>2,000+ roofers</span>
							</div>
						</div>
					</div>

					{!isLiveMode && (
						<p className="mt-3 text-[11px] text-white/30">
							Try: &quot;742 Evergreen&quot;, &quot;1247 Oakwood&quot;, &quot;891 Cedar&quot;, or &quot;2055 Sunset&quot;
						</p>
					)}
				</div>
			)}

			{/* ── Scan overlay ── */}
			{isScanning && (
				<div className="absolute inset-0 z-30 flex items-center justify-center px-4">
					<div
						className="scan-card w-full max-w-sm rounded-2xl p-6"
						style={{
							background: 'rgba(15,15,15,0.90)',
							backdropFilter: 'blur(16px)',
							border: '1px solid rgba(255,255,255,0.12)',
						}}
					>
						<div className="text-center mb-6">
							<div className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center bg-[rgba(136,255,87,0.1)]">
								<svg
									width="22" height="22" viewBox="0 0 24 24" fill="none"
									stroke="#88ff57" strokeWidth="2"
									className="animate-spin"
									style={{ animationDuration: '2s' }}
								>
									<path d="M21 12a9 9 0 11-6.219-8.56" />
								</svg>
							</div>
							<h3 className="font-display text-lg font-bold text-white">Analyzing Property</h3>
							<p className="text-xs mt-1 text-white/40">{query}</p>
						</div>

						<div className="space-y-3.5">
							{SCAN_STEPS.map((step, i) => {
								const isActive = scanStepIdx === i && !completedSteps.includes(i);
								const isDone = completedSteps.includes(i);
								const isPending = scanStepIdx < i;
								return (
									<div key={step.label} className="flex items-center gap-3" style={{ opacity: isPending ? 0.2 : 1, transition: 'opacity 0.3s' }}>
										<div
											className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all"
											style={{
												background: isDone ? '#88ff57' : isActive ? 'rgba(136,255,87,0.15)' : 'rgba(255,255,255,0.04)',
											}}
										>
											{isDone ? (
												<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#080808" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
											) : isActive ? (
												<span className="w-2 h-2 rounded-full animate-pulse bg-[#88ff57]" />
											) : (
												<span className="w-1.5 h-1.5 rounded-full bg-white/10" />
											)}
										</div>
										<span className="text-sm" style={{
											color: isDone ? '#88ff57' : isActive ? '#f0f0f0' : '#555',
											fontWeight: isActive ? 500 : 400,
										}}>
											{step.label}
										</span>
									</div>
								);
							})}
						</div>
					</div>
				</div>
			)}

			{/* Map controls */}
			{!isScanning && (
				<div className="absolute bottom-6 right-6 z-40 flex flex-col gap-0.5">
					<button className="w-10 h-10 bg-white/90 hover:bg-white rounded-t-lg shadow-md flex items-center justify-center text-gray-600 text-lg font-light transition-colors">+</button>
					<button className="w-10 h-10 bg-white/90 hover:bg-white rounded-b-lg shadow-md flex items-center justify-center text-gray-600 text-lg font-light transition-colors">−</button>
				</div>
			)}

			{/* Learn More */}
			{!isScanning && (
				<div className="hero-learn-more absolute bottom-6 left-1/2 -translate-x-1/2 z-40">
					<button className="text-xs text-white/40 hover:text-white/60 transition flex flex-col items-center gap-1">
						Learn More
						<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-bounce" style={{ animationDuration: '2s' }}>
							<polyline points="6 9 12 15 18 9" />
						</svg>
					</button>
				</div>
			)}

			{/* Attribution */}
			<div className="absolute bottom-3 right-20 z-40 text-[10px] text-white/30">
				Imagery © Esri
			</div>
		</div>
	);
}
