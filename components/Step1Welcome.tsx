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
	const [isScanning, setIsScanning] = useState(false);
	const [scanStepIdx, setScanStepIdx] = useState(-1);
	const [completedSteps, setCompletedSteps] = useState<number[]>([]);
	const [isLoadingLive, setIsLoadingLive] = useState(false);
	const [liveError, setLiveError] = useState('');

	useEffect(() => {
		if (!containerRef.current) return;
		const ctx = gsap.context(() => {
			const tl = gsap.timeline({ delay: 0.6 });
			tl.from('.hero-label', {
				y: 20, opacity: 0, duration: 0.6, ease: 'power3.out',
			})
			.from('.hero-title-line', {
				y: 50, opacity: 0, duration: 0.9, ease: 'power4.out', stagger: 0.12,
			}, '-=0.3')
			.from('.hero-sub', {
				y: 20, opacity: 0, duration: 0.6, ease: 'power3.out',
			}, '-=0.4')
			.from('.search-card', {
				y: 30, opacity: 0, duration: 0.7, ease: 'power3.out',
			}, '-=0.3')
			.from('.hero-trust', {
				y: 10, opacity: 0, duration: 0.5, ease: 'power2.out',
			}, '-=0.2')
			.from('.hero-hint', {
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
				y: -30,
				opacity: 0,
				duration: 0.45,
				ease: 'power2.in',
				onComplete: () => {
					setIsScanning(true);
					mapRef.current?.flyTo(data.lng, data.lat);

					gsap.from('.scan-card', {
						scale: 0.92,
						opacity: 0,
						duration: 0.5,
						ease: 'power3.out',
						delay: 0.3,
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
			if (!coords) {
				setLiveError('Address not found.');
				setIsLoadingLive(false);
				return;
			}
			const roofData = await fetchBuildingInsights(coords.lat, coords.lng);
			if (roofData) {
				roofData.address = query;
				runScan(roofData);
			} else {
				setLiveError('Roof data not available for this location.');
			}
		} catch {
			setLiveError('Something went wrong.');
		} finally {
			setIsLoadingLive(false);
		}
	};

	return (
		<div ref={containerRef} className="relative w-full h-screen overflow-hidden">
			{/* Interactive satellite map */}
			<MapView ref={mapRef} className="absolute inset-0 z-0" />

			{/* Vignette */}
			<div className="vignette absolute inset-0 z-10" />

			{/* Scan line during analysis */}
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
				className="absolute top-0 left-0 right-0 z-40 flex items-center justify-between px-6 sm:px-10 py-5"
				style={{ opacity: isScanning ? 0 : 1, transition: 'opacity 0.4s' }}
			>
				<div className="flex items-center gap-2.5">
					<div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: 'var(--color-accent)' }}>
						<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#080808" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
							<path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
							<polyline points="9 22 9 12 15 12 15 22" />
						</svg>
					</div>
					<span className="font-display text-sm font-bold tracking-[0.1em] uppercase" style={{ color: 'var(--color-text-secondary)' }}>
						Zuper
					</span>
				</div>
				<div className="flex items-center gap-4">
					<button className="text-sm hover:text-white transition-colors" style={{ color: 'var(--color-text-tertiary)' }}>
						Sign In
					</button>
					<button
						className="text-sm font-semibold px-4 py-1.5 rounded-md transition-all hover:-translate-y-px"
						style={{ background: 'var(--color-accent)', color: '#080808' }}
					>
						Get Started
					</button>
				</div>
			</header>

			{/* ── Search UI ── */}
			{!isScanning && (
				<div className="absolute inset-0 z-30 flex flex-col items-center justify-center px-4 search-ui">
					{/* Label */}
					<div className="hero-label mb-5">
						<span
							className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.12em] uppercase px-3 py-1.5 rounded-md"
							style={{
								border: '1px solid var(--color-border-strong)',
								color: 'var(--color-accent)',
								background: 'var(--color-accent-muted)',
							}}
						>
							<span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--color-accent)' }} />
							Satellite AI Analysis
						</span>
					</div>

					{/* Title — big Syne, tight leading */}
					<h1 className="font-display font-bold text-center mb-5" style={{ fontSize: 'clamp(3rem, 8vw, 6.5rem)', lineHeight: '0.95' }}>
						<span className="hero-title-line block text-white">AI Roof Reports</span>
						<span className="hero-title-line block" style={{ color: 'var(--color-accent)' }}>
							in 30 Seconds.
						</span>
					</h1>

					{/* Subtitle */}
					<p className="hero-sub text-center max-w-md mb-8" style={{ color: 'var(--color-text-secondary)', fontSize: '16px' }}>
						Search any address — get roof area, pitch, and cost estimates instantly.
					</p>

					{/* Search card */}
					<div className="search-card w-full max-w-lg">
						<div
							className="rounded-xl p-1.5"
							style={{
								background: 'var(--color-surface)',
								border: '1px solid var(--color-border-strong)',
							}}
						>
							{/* Input row */}
							<div className="relative">
								<svg
									className="absolute left-4 top-1/2 -translate-y-1/2"
									width="16" height="16" viewBox="0 0 24 24" fill="none"
									stroke="var(--color-text-tertiary)" strokeWidth="2"
								>
									<circle cx="11" cy="11" r="8" />
									<path d="M21 21l-4.35-4.35" />
								</svg>
								<input
									type="text"
									value={query}
									onChange={(e) => setQuery(e.target.value)}
									onKeyDown={(e) => {
										if (e.key === 'Enter') {
											if (isLiveMode) handleLiveSearch();
											else if (suggestions.length > 0) handleSelectMock(suggestions[0]);
										}
									}}
									placeholder="Enter any address..."
									className="w-full pl-11 pr-4 py-3.5 text-sm rounded-lg bg-transparent text-white placeholder:text-[var(--color-text-tertiary)] focus:outline-none"
								/>
							</div>

							{liveError && (
								<p className="px-4 py-1 text-xs" style={{ color: '#ff5757' }}>{liveError}</p>
							)}

							{/* Suggestions */}
							{showSuggestions && suggestions.length > 0 && (
								<div
									className="mt-1 rounded-lg overflow-hidden"
									style={{ border: '1px solid var(--color-border)' }}
								>
									{suggestions.map((s) => (
										<button
											key={s.address}
											onClick={() => handleSelectMock(s)}
											className="w-full text-left px-4 py-3 flex items-center gap-3 transition-colors hover:bg-white/[0.03]"
											style={{ borderBottom: '1px solid var(--color-border)' }}
										>
											<svg className="shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-tertiary)" strokeWidth="2">
												<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
												<circle cx="12" cy="10" r="3" />
											</svg>
											<div>
												<div className="text-sm font-medium text-white">{s.address}</div>
												<div className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
													{s.city}, {s.state} {s.zip}
												</div>
											</div>
										</button>
									))}
								</div>
							)}

							{/* CTA */}
							<button
								onClick={() => {
									if (isLiveMode) handleLiveSearch();
									else if (suggestions.length > 0) handleSelectMock(suggestions[0]);
								}}
								disabled={isLoadingLive}
								className="w-full mt-1.5 py-3.5 rounded-lg text-sm font-bold tracking-wide transition-all hover:-translate-y-px disabled:opacity-40"
								style={{ background: 'var(--color-accent)', color: '#080808' }}
							>
								{isLoadingLive ? (
									<span className="inline-flex items-center gap-2">
										<span className="w-3.5 h-3.5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
										Searching...
									</span>
								) : (
									'Get Free Roof Report'
								)}
							</button>
						</div>

						{/* Trust */}
						<div className="hero-trust flex items-center justify-center gap-3 mt-4 text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
							<div className="flex items-center gap-1">
								{[1, 2, 3, 4, 5].map((i) => (
									<svg key={i} width="11" height="11" viewBox="0 0 24 24" fill="var(--color-accent)" stroke="none">
										<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
									</svg>
								))}
								<span className="font-semibold text-white/60 ml-0.5">4.9</span>
							</div>
							<span style={{ color: 'var(--color-border-strong)' }}>·</span>
							<span>2,000+ contractors</span>
						</div>
					</div>

					{!isLiveMode && (
						<p className="hero-hint mt-4 text-[11px]" style={{ color: 'var(--color-text-tertiary)' }}>
							Try: &quot;742 Evergreen&quot;, &quot;1247 Oakwood&quot;, &quot;891 Cedar&quot;, or &quot;2055 Sunset&quot;
						</p>
					)}
				</div>
			)}

			{/* ── Scan overlay ── */}
			{isScanning && (
				<div className="absolute inset-0 z-30 flex items-center justify-center px-4">
					<div
						className="scan-card w-full max-w-sm rounded-xl p-6"
						style={{
							background: 'rgba(15,15,15,0.88)',
							backdropFilter: 'blur(12px)',
							border: '1px solid var(--color-border-strong)',
						}}
					>
						<div className="text-center mb-6">
							<div
								className="w-11 h-11 rounded-lg mx-auto mb-3 flex items-center justify-center"
								style={{ background: 'var(--color-accent-muted)' }}
							>
								<svg
									width="20" height="20" viewBox="0 0 24 24" fill="none"
									stroke="var(--color-accent)" strokeWidth="2"
									className="animate-spin"
									style={{ animationDuration: '2s' }}
								>
									<path d="M21 12a9 9 0 11-6.219-8.56" />
								</svg>
							</div>
							<h3 className="font-display text-base font-bold text-white">Analyzing Property</h3>
							<p className="text-xs mt-1" style={{ color: 'var(--color-text-tertiary)' }}>{query}</p>
						</div>

						<div className="space-y-3">
							{SCAN_STEPS.map((step, i) => {
								const isActive = scanStepIdx === i && !completedSteps.includes(i);
								const isDone = completedSteps.includes(i);
								const isPending = scanStepIdx < i;
								return (
									<div
										key={step.label}
										className="flex items-center gap-3 transition-all"
										style={{ opacity: isPending ? 0.2 : 1 }}
									>
										<div
											className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all"
											style={{
												background: isDone ? 'var(--color-accent)' : isActive ? 'var(--color-accent-muted)' : 'rgba(255,255,255,0.04)',
											}}
										>
											{isDone ? (
												<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#080808" strokeWidth="3">
													<polyline points="20 6 9 17 4 12" />
												</svg>
											) : isActive ? (
												<span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--color-accent)' }} />
											) : (
												<span className="w-1 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }} />
											)}
										</div>
										<span
											className="text-sm"
											style={{
												color: isDone ? 'var(--color-accent)' : isActive ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)',
												fontWeight: isActive ? 500 : 400,
											}}
										>
											{step.label}
										</span>
									</div>
								);
							})}
						</div>
					</div>
				</div>
			)}

			{/* Bottom attribution */}
			<div
				className="absolute bottom-3 right-4 z-40 text-[10px]"
				style={{ color: 'var(--color-text-tertiary)', opacity: 0.5 }}
			>
				Imagery © Esri · Powered by Zuper AI
			</div>
		</div>
	);
}
