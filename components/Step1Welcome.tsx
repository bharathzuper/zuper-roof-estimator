'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import gsap from 'gsap';
import { Home, Search, MapPin, ArrowRight, Loader2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Command, CommandInput, CommandList, CommandGroup, CommandItem, CommandEmpty } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverAnchor } from '@/components/ui/popover';
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
	const [open, setOpen] = useState(false);
	const [isScanning, setIsScanning] = useState(false);
	const [scanStepIdx, setScanStepIdx] = useState(-1);
	const [completedSteps, setCompletedSteps] = useState<number[]>([]);
	const [isLoadingLive, setIsLoadingLive] = useState(false);
	const [liveError, setLiveError] = useState('');

	useEffect(() => {
		if (!containerRef.current) return;
		const ctx = gsap.context(() => {
			const tl = gsap.timeline({ delay: 0.5 });
			tl.from('.hero-title-line', {
				y: 40, opacity: 0, duration: 0.8, ease: 'power4.out', stagger: 0.1,
			})
			.from('.hero-sub', {
				y: 16, opacity: 0, duration: 0.5, ease: 'power3.out',
			}, '-=0.35')
			.from('.hero-search', {
				y: 20, opacity: 0, duration: 0.6, ease: 'power3.out',
			}, '-=0.2')
			.from('.hero-hints', {
				opacity: 0, duration: 0.4, ease: 'power2.out',
			}, '-=0.1');
		}, containerRef);
		return () => ctx.revert();
	}, []);

	useEffect(() => {
		if (!isLiveMode && query.length >= 2 && !isScanning) {
			const results = filterAddresses(query);
			setSuggestions(results.length > 0 ? results : MOCK_ADDRESSES);
			setOpen(true);
		} else {
			setSuggestions([]);
			setOpen(false);
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
		setOpen(false);
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
			<MapView ref={mapRef} className="absolute inset-0 z-0" pitch={50} bearing={-20} />

			<div className="absolute inset-0 z-[1] bg-black/40 pointer-events-none" />
			<div className="vignette absolute inset-0 z-[2] pointer-events-none" />

			{/* Header */}
			<header className={`absolute top-0 inset-x-0 z-40 transition-opacity duration-300 ${isScanning ? 'opacity-0 pointer-events-none' : ''}`}>
				<nav className="mx-auto max-w-5xl flex items-center justify-between px-6 h-16">
					<div className="flex items-center gap-2.5">
						<div className="h-8 w-8 rounded-lg bg-teal-600 flex items-center justify-center">
							<Home className="h-4 w-4 text-white" />
						</div>
						<span className="font-display text-sm font-bold text-white tracking-wide">
							zuper roofing
						</span>
					</div>
					<div className="flex items-center gap-1">
						<Button variant="ghost" size="sm" className="text-white/80 hover:text-white hover:bg-white/10">
							Sign In
						</Button>
						<Button size="sm" className="bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm border-0 shadow-none">
							Get Started
						</Button>
					</div>
				</nav>
			</header>

			{/* Hero */}
			{!isScanning && (
				<div className="absolute inset-0 z-30 pointer-events-none">
					<div className="h-full flex flex-col items-center justify-center px-6 search-ui">
						<h1
							className="font-display font-bold text-center mb-5"
							style={{ fontSize: 'clamp(2.2rem, 6vw, 4.2rem)', lineHeight: 1.08 }}
						>
							<span className="hero-title-line block text-teal-400 drop-shadow-lg">
								AI Roof Reports
							</span>
							<span className="hero-title-line block text-white drop-shadow-lg">
								in 30 Seconds.
							</span>
						</h1>

						<p className="hero-sub text-center text-white/55 text-[15px] leading-relaxed mb-8 max-w-sm">
							Enter any address to get roof area, pitch, and cost estimates.
						</p>

						{/* Search combobox */}
						<div className="hero-search w-full max-w-md pointer-events-auto">
							<Popover open={open} onOpenChange={setOpen}>
								<PopoverAnchor asChild>
									<div className="flex items-center gap-2 h-12 rounded-xl bg-white shadow-2xl ring-1 ring-black/5 px-3">
										<Search className="h-4 w-4 text-gray-400 shrink-0" />
										<input
											type="text"
											value={query}
											onChange={(e) => setQuery(e.target.value)}
											onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
											placeholder="Enter your property address"
											className="flex-1 h-full bg-transparent text-sm text-gray-900 placeholder:text-gray-400 outline-none"
										/>
										<Button
											size="sm"
											onClick={handleSubmit}
											disabled={isLoadingLive}
											className="h-8 px-3 rounded-lg bg-gray-900 text-white hover:bg-gray-800"
										>
											{isLoadingLive ? (
												<Loader2 className="h-4 w-4 animate-spin" />
											) : (
												<>
													Analyze
													<ArrowRight className="h-3.5 w-3.5" />
												</>
											)}
										</Button>
									</div>
								</PopoverAnchor>

								{suggestions.length > 0 && (
									<PopoverContent
										className="w-[var(--radix-popover-trigger-width)] p-0 border shadow-xl"
										align="start"
										onOpenAutoFocus={(e) => e.preventDefault()}
									>
										<Command>
											<CommandList>
												<CommandGroup>
													{suggestions.map((s) => (
														<CommandItem
															key={s.address}
															value={s.address}
															onSelect={() => handleSelectMock(s)}
															className="flex items-center gap-3 px-3 py-2.5 cursor-pointer"
														>
															<MapPin className="h-4 w-4 text-gray-400 shrink-0" />
															<div className="min-w-0">
																<div className="text-sm font-medium truncate">{s.address}</div>
																<div className="text-xs text-muted-foreground">{s.city}, {s.state} {s.zip}</div>
															</div>
														</CommandItem>
													))}
												</CommandGroup>
												<CommandEmpty>No addresses found.</CommandEmpty>
											</CommandList>
										</Command>
									</PopoverContent>
								)}
							</Popover>

							{liveError && (
								<p className="mt-2 text-xs text-red-400 font-medium pl-1">{liveError}</p>
							)}
						</div>

						{!isLiveMode && (
							<div className="hero-hints mt-5 flex items-center gap-2 text-xs text-white/40 pointer-events-auto">
								<span>Try:</span>
								{['742 Evergreen', '1247 Oakwood', '891 Cedar'].map((addr, i) => (
									<button
										key={addr}
										onClick={() => setQuery(addr)}
										className="text-white/60 hover:text-white underline underline-offset-2 decoration-white/20 transition-colors"
									>
										{addr}
									</button>
								))}
							</div>
						)}
					</div>
				</div>
			)}

			{/* Scan overlay */}
			{isScanning && (
				<>
					<div
						className="absolute inset-x-0 h-[2px] z-20"
						style={{
							background: 'linear-gradient(90deg, transparent, rgba(52,211,153,0.5), transparent)',
							boxShadow: '0 0 30px rgba(52,211,153,0.2)',
							animation: 'scan-sweep 2.8s linear infinite',
						}}
					/>
					<div className="absolute inset-0 z-30 grid place-items-center px-6">
						<div className="scan-card w-full max-w-sm rounded-2xl p-6 bg-[#111]/95 backdrop-blur-xl border border-white/[0.06] shadow-2xl">
							<div className="text-center mb-6">
								<div className="h-12 w-12 rounded-xl mx-auto mb-3 flex items-center justify-center bg-emerald-400/10">
									<Loader2 className="h-5 w-5 text-emerald-400 animate-spin" />
								</div>
								<h3 className="font-display text-lg font-bold text-white">Analyzing Property</h3>
								<p className="text-xs mt-1 text-white/40 truncate max-w-[260px] mx-auto">{query}</p>
							</div>

							<div className="space-y-3">
								{SCAN_STEPS.map((step, i) => {
									const isActive = scanStepIdx === i && !completedSteps.includes(i);
									const isDone = completedSteps.includes(i);
									const isPending = scanStepIdx < i;
									return (
										<div
											key={step.label}
											className={`flex items-center gap-3 transition-opacity duration-300 ${isPending ? 'opacity-20' : 'opacity-100'}`}
										>
											<div className={cn(
												'h-6 w-6 rounded-full flex items-center justify-center shrink-0',
												isDone ? 'bg-emerald-400' : isActive ? 'bg-emerald-400/15' : 'bg-white/5',
											)}>
												{isDone ? (
													<Check className="h-3 w-3 text-[#0a0a0a]" strokeWidth={3} />
												) : isActive ? (
													<span className="h-2 w-2 rounded-full animate-pulse bg-emerald-400" />
												) : (
													<span className="h-1.5 w-1.5 rounded-full bg-white/10" />
												)}
											</div>
											<span className={cn(
												'text-sm',
												isDone ? 'text-emerald-400 font-medium' : isActive ? 'text-white font-medium' : 'text-white/30',
											)}>
												{step.label}
											</span>
										</div>
									);
								})}
							</div>
						</div>
					</div>
				</>
			)}

			<div className="absolute bottom-3 right-4 z-40 text-[10px] text-white/25 pointer-events-none">
				Imagery &copy; Esri
			</div>
		</div>
	);
}
