'use client';

import { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { LeadFormData, TierEstimate, RoofData } from '@/lib/types';

interface Step5Props {
	selectedTier: TierEstimate;
	roofData?: RoofData;
	onSubmit?: (data: LeadFormData) => void;
}

export default function Step5LeadCapture({ selectedTier, onSubmit, roofData: _roofData }: Step5Props) {
	const containerRef = useRef<HTMLDivElement>(null);
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [phone, setPhone] = useState('');
	const [contactPref, setContactPref] = useState<'email' | 'call' | 'text'>('email');
	const [submitted, setSubmitted] = useState(false);

	useEffect(() => {
		if (!containerRef.current) return;
		const ctx = gsap.context(() => {
			gsap.from('.lead-banner', { y: 20, opacity: 0, duration: 0.5, ease: 'power3.out', delay: 0.2 });
			gsap.from('.lead-heading', { y: 30, opacity: 0, duration: 0.7, ease: 'power4.out', delay: 0.35 });
			gsap.from('.lead-sub', { y: 12, opacity: 0, duration: 0.5, ease: 'power3.out', delay: 0.5 });
			gsap.from('.lead-field', { y: 16, opacity: 0, duration: 0.4, ease: 'power2.out', stagger: 0.07, delay: 0.6 });
			gsap.from('.lead-cta', { y: 12, opacity: 0, duration: 0.5, ease: 'power3.out', delay: 0.9 });
		}, containerRef);
		return () => ctx.revert();
	}, []);

	useEffect(() => {
		if (!submitted || !containerRef.current) return;
		const ctx = gsap.context(() => {
			gsap.from('.success-icon', { scale: 0, duration: 0.6, ease: 'back.out(1.7)' });
			gsap.from('.success-heading', { y: 20, opacity: 0, duration: 0.5, ease: 'power3.out', delay: 0.3 });
			gsap.from('.success-sub', { y: 12, opacity: 0, duration: 0.4, ease: 'power2.out', delay: 0.5 });
		}, containerRef);
		return () => ctx.revert();
	}, [submitted]);

	const handleSubmit = () => {
		if (!name || !email) return;
		onSubmit?.({ name, email, phone, preferredContact: contactPref });
		setSubmitted(true);
	};

	if (submitted) {
		return (
			<div ref={containerRef} className="min-h-screen bg-[#080808] flex items-center justify-center px-5">
				<div className="text-center">
					<div className="success-icon mx-auto w-20 h-20 rounded-2xl mb-6 flex items-center justify-center bg-[rgba(136,255,87,0.12)] border border-[rgba(136,255,87,0.3)]">
						<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#88ff57" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
							<polyline points="20 6 9 17 4 12" />
						</svg>
					</div>
					<h2 className="success-heading font-display font-bold text-white mb-2" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)' }}>
						You&apos;re All Set!
					</h2>
					<p className="success-sub text-sm text-[#555] max-w-sm mx-auto">
						A certified roofer will reach out within 24 hours with a detailed proposal for your <span className="text-[#88ff57] font-medium">{selectedTier.tierName}</span> roof.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div ref={containerRef} className="min-h-screen bg-[#080808] relative overflow-hidden">
			<div
				className="absolute pointer-events-none"
				style={{ width: 500, height: 500, bottom: -200, left: -100, background: 'radial-gradient(circle, rgba(136,255,87,0.05) 0%, transparent 70%)' }}
			/>

			<div className="relative z-10 max-w-md mx-auto px-5 sm:px-0 py-16 sm:py-24">
				{/* Selected tier banner */}
				<div className="lead-banner card-surface p-5 mb-8">
					<div className="flex items-center justify-between">
						<div>
							<div className="text-[10px] font-semibold tracking-[0.12em] uppercase text-[#555]">Selected Plan</div>
							<span className="font-display text-lg font-bold text-white">{selectedTier.tierName} · {selectedTier.materialName}</span>
						</div>
						<div className="text-right">
							<div className="tabular font-display text-2xl font-extrabold text-[#88ff57]">
								${selectedTier.totalCost.toLocaleString()}
							</div>
							<div className="text-xs tabular text-[#555]">${selectedTier.monthlyPayment}/mo</div>
						</div>
					</div>
				</div>

				{/* Heading */}
				<h2 className="lead-heading font-display font-bold text-white mb-1" style={{ fontSize: 'clamp(1.6rem, 4vw, 2.2rem)' }}>
					Connect with a Pro
				</h2>
				<p className="lead-sub text-sm text-[#555] mb-8">
					A certified roofer will follow up with a detailed proposal.
				</p>

				{/* Form */}
				<div className="space-y-4">
					<div className="lead-field">
						<label className="block text-xs font-medium text-[#888] mb-1.5">Full Name *</label>
						<input
							type="text"
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder="Jane Smith"
							className="input-field"
						/>
					</div>
					<div className="lead-field">
						<label className="block text-xs font-medium text-[#888] mb-1.5">Email *</label>
						<input
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder="jane@example.com"
							className="input-field"
						/>
					</div>
					<div className="lead-field">
						<label className="block text-xs font-medium text-[#888] mb-1.5">Phone</label>
						<input
							type="tel"
							value={phone}
							onChange={(e) => setPhone(e.target.value)}
							placeholder="(555) 000-0000"
							className="input-field"
						/>
					</div>

					{/* Contact preference */}
					<div className="lead-field">
						<label className="block text-xs font-medium text-[#888] mb-2">Preferred Contact</label>
						<div className="flex gap-2">
							{(['email', 'call', 'text'] as const).map((opt) => {
								const isActive = contactPref === opt;
								return (
									<button
										key={opt}
										onClick={() => setContactPref(opt)}
										className={`flex-1 h-10 rounded-lg text-xs font-semibold capitalize transition-all border ${
											isActive
												? 'bg-[rgba(136,255,87,0.1)] text-[#88ff57] border-[rgba(136,255,87,0.3)]'
												: 'text-[#555] border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.16)] hover:text-[#888]'
										}`}
									>
										{opt}
									</button>
								);
							})}
						</div>
					</div>

					{/* Submit */}
					<button
						onClick={handleSubmit}
						disabled={!name || !email}
						className="lead-cta btn-primary mt-2"
					>
						Get My Proposal
					</button>

					<p className="text-center text-[10px] text-[#555] mt-3">
						By submitting, you agree to our Terms and Privacy Policy.
					</p>
				</div>
			</div>
		</div>
	);
}
