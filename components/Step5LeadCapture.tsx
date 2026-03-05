'use client';

import { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { LeadFormData, TierEstimate, RoofData } from '@/lib/types';

interface Step5Props {
	selectedTier: TierEstimate;
	roofData: RoofData;
}

export default function Step5LeadCapture({ selectedTier, roofData }: Step5Props) {
	const containerRef = useRef<HTMLDivElement>(null);
	const [submitted, setSubmitted] = useState(false);
	const [form, setForm] = useState<LeadFormData>({
		firstName: '',
		lastName: '',
		email: '',
		phone: '',
		preferredContact: 'email',
		notes: '',
	});

	const isValid = form.firstName && form.lastName && form.email && form.phone;

	useEffect(() => {
		if (!containerRef.current) return;
		const ctx = gsap.context(() => {
			gsap.from('.lead-banner', { y: 16, opacity: 0, duration: 0.5, ease: 'power3.out', delay: 0.2 });
			gsap.from('.lead-heading', { y: 24, opacity: 0, duration: 0.6, ease: 'power4.out', delay: 0.35 });
			gsap.from('.lead-sub', { y: 12, opacity: 0, duration: 0.5, ease: 'power3.out', delay: 0.45 });
			gsap.from('.lead-field', { y: 14, opacity: 0, duration: 0.4, ease: 'power3.out', stagger: 0.06, delay: 0.55 });
			gsap.from('.lead-cta', { y: 12, opacity: 0, duration: 0.5, ease: 'power3.out', delay: 0.9 });
		}, containerRef);
		return () => ctx.revert();
	}, []);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!isValid) return;

		setSubmitted(true);

		setTimeout(() => {
			if (!containerRef.current) return;
			gsap.context(() => {
				gsap.from('.success-icon', { scale: 0, duration: 0.6, ease: 'back.out(2)' });
				gsap.from('.success-check', { strokeDashoffset: 30, duration: 0.5, ease: 'power2.out', delay: 0.3 });
				gsap.from('.success-title', { y: 20, opacity: 0, duration: 0.5, ease: 'power3.out', delay: 0.5 });
				gsap.from('.success-desc', { y: 12, opacity: 0, duration: 0.4, ease: 'power3.out', delay: 0.6 });
				gsap.from('.success-detail', { y: 10, opacity: 0, duration: 0.4, ease: 'power3.out', stagger: 0.06, delay: 0.7 });
				gsap.from('.success-actions', { y: 10, opacity: 0, duration: 0.4, ease: 'power2.out', delay: 0.95 });
			}, containerRef);
		}, 50);
	};

	const inputStyle: React.CSSProperties = {
		background: 'rgba(255,255,255,0.03)',
		border: '1px solid var(--color-border)',
		color: 'var(--color-text-primary)',
	};
	const inputClass = 'w-full px-3 py-2.5 rounded-md text-sm transition-colors focus:outline-none focus:border-[rgba(136,255,87,0.3)]';

	return (
		<div ref={containerRef} className="min-h-screen relative overflow-hidden" style={{ background: 'var(--color-base)' }}>
			<div className="glow-accent absolute inset-0 pointer-events-none" />

			<div className="relative z-10 max-w-xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
				{!submitted ? (
					<>
						{/* Summary banner */}
						<div
							className="lead-banner rounded-lg p-4 mb-8 flex items-center gap-4"
							style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
						>
							<div
								className="w-10 h-10 rounded-md flex items-center justify-center shrink-0"
								style={{ background: 'var(--color-accent-muted)' }}
							>
								<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2">
									<path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
									<polyline points="9 22 9 12 15 12 15 22" />
								</svg>
							</div>
							<div className="flex-1 min-w-0">
								<div className="text-sm font-semibold text-white">{selectedTier.tierName} · {selectedTier.materialName}</div>
								<div className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
									{roofData.address} · {roofData.roofAreaSqFt.toLocaleString()} sq ft
								</div>
							</div>
							<div className="text-right shrink-0">
								<div className="tabular font-display text-lg font-bold" style={{ color: 'var(--color-accent)' }}>
									${selectedTier.totalCost.toLocaleString()}
								</div>
								<div className="text-[10px] tabular" style={{ color: 'var(--color-text-tertiary)' }}>
									${selectedTier.monthlyPayment}/mo
								</div>
							</div>
						</div>

						{/* Header */}
						<h2 className="lead-heading font-display text-2xl sm:text-3xl font-bold text-white mb-2 text-center">
							Get Your Detailed Quote
						</h2>
						<p className="lead-sub text-sm text-center mb-8" style={{ color: 'var(--color-text-tertiary)' }}>
							Connect with a verified contractor in your area.
						</p>

						{/* Form */}
						<form onSubmit={handleSubmit} className="space-y-4">
							<div className="grid grid-cols-2 gap-3">
								<div className="lead-field">
									<label className="block text-[11px] font-medium mb-1.5" style={{ color: 'var(--color-text-tertiary)' }}>First Name</label>
									<input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className={inputClass} style={inputStyle} placeholder="John" />
								</div>
								<div className="lead-field">
									<label className="block text-[11px] font-medium mb-1.5" style={{ color: 'var(--color-text-tertiary)' }}>Last Name</label>
									<input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className={inputClass} style={inputStyle} placeholder="Smith" />
								</div>
							</div>
							<div className="lead-field">
								<label className="block text-[11px] font-medium mb-1.5" style={{ color: 'var(--color-text-tertiary)' }}>Email</label>
								<input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} style={inputStyle} placeholder="john@email.com" />
							</div>
							<div className="lead-field">
								<label className="block text-[11px] font-medium mb-1.5" style={{ color: 'var(--color-text-tertiary)' }}>Phone</label>
								<input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputClass} style={inputStyle} placeholder="(555) 123-4567" />
							</div>
							<div className="lead-field">
								<label className="block text-[11px] font-medium mb-2" style={{ color: 'var(--color-text-tertiary)' }}>Preferred Contact</label>
								<div className="flex gap-2">
									{(['email', 'call', 'text'] as const).map((m) => (
										<button
											key={m}
											type="button"
											onClick={() => setForm({ ...form, preferredContact: m })}
											className="flex-1 py-2 rounded-md text-xs font-medium capitalize transition-all"
											style={{
												background: form.preferredContact === m ? 'var(--color-accent-muted)' : 'rgba(255,255,255,0.02)',
												color: form.preferredContact === m ? 'var(--color-accent)' : 'var(--color-text-tertiary)',
												border: `1px solid ${form.preferredContact === m ? 'rgba(136,255,87,0.25)' : 'var(--color-border)'}`,
											}}
										>
											{m}
										</button>
									))}
								</div>
							</div>
							<div className="lead-field">
								<label className="block text-[11px] font-medium mb-1.5" style={{ color: 'var(--color-text-tertiary)' }}>
									Notes <span style={{ color: 'var(--color-text-tertiary)', opacity: 0.5 }}>(optional)</span>
								</label>
								<textarea
									value={form.notes}
									onChange={(e) => setForm({ ...form, notes: e.target.value })}
									rows={3}
									className={`${inputClass} resize-none`}
									style={inputStyle}
									placeholder="Any details about your project..."
								/>
							</div>
							<button
								type="submit"
								disabled={!isValid}
								className="lead-cta w-full py-4 rounded-md font-display font-bold text-sm tracking-wide transition-all hover:-translate-y-px disabled:opacity-25 disabled:cursor-not-allowed"
								style={{ background: 'var(--color-accent)', color: '#080808' }}
							>
								Get My Detailed Quote
							</button>
							<p className="text-center text-[10px]" style={{ color: 'var(--color-text-tertiary)' }}>
								By submitting, you agree to our Terms. We&apos;ll connect you with a local contractor.
							</p>
						</form>
					</>
				) : (
					<div className="text-center py-12">
						<div
							className="success-icon w-16 h-16 rounded-full mx-auto mb-5 flex items-center justify-center"
							style={{ background: 'var(--color-accent-muted)' }}
						>
							<svg
								className="success-check"
								width="28" height="28" viewBox="0 0 24 24" fill="none"
								stroke="var(--color-accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
								style={{ strokeDasharray: 30 }}
							>
								<polyline points="20 6 9 17 4 12" />
							</svg>
						</div>

						<h2 className="success-title font-display text-2xl sm:text-3xl font-bold text-white mb-2">
							You&apos;re All Set
						</h2>
						<p className="success-desc text-sm max-w-sm mx-auto mb-8" style={{ color: 'var(--color-text-tertiary)' }}>
							A verified contractor will reach out within 24 hours with a detailed quote for your {selectedTier.materialName.toLowerCase()} roof.
						</p>

						<div
							className="inline-block rounded-lg p-5 text-left mb-8"
							style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
						>
							<div className="grid grid-cols-2 gap-x-10 gap-y-3">
								{[
									{ label: 'Tier', value: selectedTier.tierName },
									{ label: 'Material', value: selectedTier.materialName },
									{ label: 'Estimate', value: `$${selectedTier.totalCost.toLocaleString()}`, accent: true },
									{ label: 'Monthly', value: `$${selectedTier.monthlyPayment}/mo`, accent: true },
								].map((item) => (
									<div key={item.label} className="success-detail">
										<div className="text-[10px] tracking-[0.1em] uppercase mb-0.5" style={{ color: 'var(--color-text-tertiary)' }}>
											{item.label}
										</div>
										<div
											className="text-sm font-semibold tabular"
											style={{ color: item.accent ? 'var(--color-accent)' : 'white' }}
										>
											{item.value}
										</div>
									</div>
								))}
							</div>
						</div>

						<div className="success-actions flex items-center justify-center gap-3">
							<button
								className="px-5 py-2.5 rounded-md text-sm font-medium transition-all hover:-translate-y-px"
								style={{ border: '1px solid var(--color-border-strong)', color: 'var(--color-text-secondary)' }}
							>
								Download Report
							</button>
							<button
								onClick={() => window.location.reload()}
								className="px-5 py-2.5 rounded-md text-sm font-medium transition-colors"
								style={{ color: 'var(--color-accent)' }}
							>
								Try Another Address
							</button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
