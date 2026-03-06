'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import gsap from 'gsap';
import { Search, MapPin, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Command, CommandList, CommandGroup, CommandItem, CommandEmpty } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverAnchor } from '@/components/ui/popover';
import MapView, { MapViewHandle } from './MapView';
import { RoofData } from '@/lib/types';
import { MOCK_ADDRESSES, filterAddresses } from '@/lib/mock-data';
import { hasGoogleApiKey, geocodeAddress, fetchBuildingInsights } from '@/lib/google-apis';

const isLiveMode = hasGoogleApiKey();

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
		if (!isLiveMode && query.length >= 2) {
			const results = filterAddresses(query);
			setSuggestions(results.length > 0 ? results : MOCK_ADDRESSES);
			setOpen(true);
		} else {
			setSuggestions([]);
			setOpen(false);
		}
	}, [query]);

	const runScan = useCallback(
		(data: RoofData) => {
			gsap.to('.search-ui', {
				y: -30, opacity: 0, duration: 0.4, ease: 'power2.in',
				onComplete: () => {
					mapRef.current?.flyTo(data.lng, data.lat);
					setTimeout(() => onAddressSelected(data), 1200);
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

			<div className="absolute inset-0 z-[1] bg-black/50 pointer-events-none" />
			<div className="vignette absolute inset-0 z-[2] pointer-events-none" />
			<div className="absolute inset-0 z-[3] pointer-events-none" style={{
				background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.2) 50%, transparent 75%)',
			}} />

			{/* Header */}
			<header className="absolute top-0 inset-x-0 z-40">
				<nav className="mx-auto max-w-5xl flex items-center justify-between px-6 h-16">
					<img src="/brand/zuper-logo.png" alt="Zuper" className="h-8 w-auto" />
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
			<div className="absolute inset-0 z-30 pointer-events-none">
				<div className="h-full flex flex-col items-center justify-center px-6 search-ui">
					<h1
						className="font-display font-bold text-center mb-5"
						style={{ fontSize: 'clamp(2.2rem, 6vw, 4.2rem)', lineHeight: 1.08 }}
					>
						<span className="hero-title-line block text-zuper-400 drop-shadow-lg">
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
							{['742 Evergreen', '1247 Oakwood', '891 Cedar'].map((addr) => (
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

			<div className="absolute bottom-3 right-4 z-40 text-[10px] text-white/25 pointer-events-none">
				Imagery &copy; Esri
			</div>
		</div>
	);
}
