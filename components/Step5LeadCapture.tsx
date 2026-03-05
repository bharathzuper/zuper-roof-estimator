'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LeadFormData, TierEstimate, RoofData } from '@/lib/types';

interface Step5Props {
	selectedTier: TierEstimate;
	roofData: RoofData;
}

export default function Step5LeadCapture({ selectedTier, roofData }: Step5Props) {
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

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (isValid) setSubmitted(true);
	};

	return (
		<div className="min-h-screen bg-surface relative overflow-hidden">
			{/* Ambient */}
			<div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-teal-500/[0.04] blur-[140px] rounded-full pointer-events-none" />

			<div className="relative z-10 max-w-2xl mx-auto px-4 py-12 sm:py-16">
				<AnimatePresence mode="wait">
					{!submitted ? (
						<motion.div key="form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
							{/* Summary banner */}
							<div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 mb-8 flex items-center gap-4">
								<div className="w-12 h-12 rounded-lg bg-teal-500/10 flex items-center justify-center shrink-0">
									<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2dd4bf" strokeWidth="2">
										<path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
									</svg>
								</div>
								<div className="flex-1 min-w-0">
									<div className="text-sm font-semibold text-white">{selectedTier.tierName} · {selectedTier.materialName}</div>
									<div className="text-xs text-white/30">{roofData.address} · {roofData.roofAreaSqFt.toLocaleString()} sq ft</div>
								</div>
								<div className="text-right shrink-0">
									<div className="font-display text-lg font-bold text-teal-400">${selectedTier.totalCost.toLocaleString()}</div>
									<div className="text-[10px] text-white/25">${selectedTier.monthlyPayment}/mo</div>
								</div>
							</div>

							{/* Header */}
							<div className="text-center mb-8">
								<h2 className="font-display text-2xl sm:text-3xl font-bold text-white mb-2">Get Your Detailed Quote</h2>
								<p className="text-sm text-white/40">Connect with a verified contractor in your area.</p>
							</div>

							{/* Form */}
							<form onSubmit={handleSubmit} className="space-y-4">
								<div className="grid grid-cols-2 gap-3">
									<div>
										<label className="block text-xs font-medium text-white/40 mb-1.5">First Name</label>
										<input
											value={form.firstName}
											onChange={(e) => setForm({ ...form, firstName: e.target.value })}
											className="w-full px-3 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-white focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/20 transition"
											placeholder="John"
										/>
									</div>
									<div>
										<label className="block text-xs font-medium text-white/40 mb-1.5">Last Name</label>
										<input
											value={form.lastName}
											onChange={(e) => setForm({ ...form, lastName: e.target.value })}
											className="w-full px-3 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-white focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/20 transition"
											placeholder="Smith"
										/>
									</div>
								</div>
								<div>
									<label className="block text-xs font-medium text-white/40 mb-1.5">Email</label>
									<input
										type="email"
										value={form.email}
										onChange={(e) => setForm({ ...form, email: e.target.value })}
										className="w-full px-3 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-white focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/20 transition"
										placeholder="john@email.com"
									/>
								</div>
								<div>
									<label className="block text-xs font-medium text-white/40 mb-1.5">Phone</label>
									<input
										type="tel"
										value={form.phone}
										onChange={(e) => setForm({ ...form, phone: e.target.value })}
										className="w-full px-3 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-white focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/20 transition"
										placeholder="(555) 123-4567"
									/>
								</div>

								{/* Contact preference */}
								<div>
									<label className="block text-xs font-medium text-white/40 mb-2">Preferred Contact</label>
									<div className="flex gap-3">
										{(['email', 'call', 'text'] as const).map((method) => (
											<button
												key={method}
												type="button"
												onClick={() => setForm({ ...form, preferredContact: method })}
												className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all capitalize ${
													form.preferredContact === method
														? 'bg-teal-500/15 text-teal-400 border border-teal-500/30'
														: 'bg-white/[0.03] text-white/30 border border-white/[0.06] hover:border-white/10'
												}`}
											>
												{method}
											</button>
										))}
									</div>
								</div>

								{/* Notes */}
								<div>
									<label className="block text-xs font-medium text-white/40 mb-1.5">Notes <span className="text-white/20">(optional)</span></label>
									<textarea
										value={form.notes}
										onChange={(e) => setForm({ ...form, notes: e.target.value })}
										rows={3}
										className="w-full px-3 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-white focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/20 transition resize-none"
										placeholder="Any details about your project..."
									/>
								</div>

								<button
									type="submit"
									disabled={!isValid}
									className="w-full py-4 rounded-xl font-display font-bold text-sm uppercase tracking-wider transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:from-teal-400 hover:to-cyan-400 shadow-lg shadow-teal-500/20"
								>
									Get My Detailed Quote
								</button>

								<p className="text-center text-[10px] text-white/20 mt-2">
									By submitting, you agree to our Terms. We&apos;ll connect you with a local contractor.
								</p>
							</form>
						</motion.div>
					) : (
						<motion.div
							key="success"
							className="text-center py-20"
							initial={{ opacity: 0, scale: 0.95 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ type: 'spring', stiffness: 120 }}
						>
							{/* Success animation */}
							<motion.div
								className="w-20 h-20 rounded-full bg-teal-500/15 flex items-center justify-center mx-auto mb-6"
								initial={{ scale: 0 }}
								animate={{ scale: 1 }}
								transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
							>
								<motion.svg
									width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2dd4bf" strokeWidth="2.5"
									initial={{ pathLength: 0 }}
									animate={{ pathLength: 1 }}
									transition={{ delay: 0.4, duration: 0.5 }}
								>
									<polyline points="20 6 9 17 4 12" />
								</motion.svg>
							</motion.div>

							<h2 className="font-display text-3xl font-bold text-white mb-3">You&apos;re All Set!</h2>
							<p className="text-white/40 text-sm max-w-sm mx-auto mb-8">
								A verified contractor will reach out within 24 hours with a detailed quote for your {selectedTier.materialName.toLowerCase()} roof.
							</p>

							{/* Summary card */}
							<div className="inline-block rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 text-left">
								<div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
									<div>
										<div className="text-[10px] text-white/25 uppercase tracking-wider mb-0.5">Tier</div>
										<div className="text-white font-medium">{selectedTier.tierName}</div>
									</div>
									<div>
										<div className="text-[10px] text-white/25 uppercase tracking-wider mb-0.5">Material</div>
										<div className="text-white font-medium">{selectedTier.materialName}</div>
									</div>
									<div>
										<div className="text-[10px] text-white/25 uppercase tracking-wider mb-0.5">Estimate</div>
										<div className="text-teal-400 font-bold">${selectedTier.totalCost.toLocaleString()}</div>
									</div>
									<div>
										<div className="text-[10px] text-white/25 uppercase tracking-wider mb-0.5">Financing</div>
										<div className="text-teal-400 font-bold">${selectedTier.monthlyPayment}/mo</div>
									</div>
								</div>
							</div>

							<motion.div
								className="mt-8 flex items-center justify-center gap-4"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ delay: 0.6 }}
							>
								<button className="px-6 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-sm text-white/60 hover:text-white hover:border-white/10 transition">
									Download Report
								</button>
								<button
									onClick={() => window.location.reload()}
									className="px-6 py-2.5 rounded-lg text-sm text-teal-400 hover:text-teal-300 transition"
								>
									Try Another Address
								</button>
							</motion.div>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</div>
	);
}
