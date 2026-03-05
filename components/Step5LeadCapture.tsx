'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type ContactMethod = 'call' | 'text' | 'email';
type BestTime = 'morning' | 'afternoon' | 'evening';

export default function Step5LeadCapture({ onBack }: { onBack: () => void }) {
	const [submitted, setSubmitted] = useState(false);
	const [firstName, setFirstName] = useState('');
	const [lastName, setLastName] = useState('');
	const [email, setEmail] = useState('');
	const [phone, setPhone] = useState('');
	const [contactMethod, setContactMethod] = useState<ContactMethod>('call');
	const [bestTime, setBestTime] = useState<BestTime>('morning');
	const [agreedTerms, setAgreedTerms] = useState(false);

	const canSubmit = firstName && email && phone && agreedTerms;

	return (
		<div className="min-h-screen flex items-center justify-center pt-16 pb-8 px-4 bg-gradient-to-b from-slate-900 to-slate-950">
			<div className="w-full max-w-lg">
				<AnimatePresence mode="wait">
					{!submitted ? (
						<motion.div key="form" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }}>
							<motion.button
								onClick={onBack}
								className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-300 mb-6 transition-colors"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
							>
								<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
									<path d="M19 12H5M12 19l-7-7 7-7" />
								</svg>
								Back to estimate
							</motion.button>

							<div className="bg-white/[0.03] border border-white/5 rounded-2xl p-8">
								<h2 className="text-2xl font-bold text-white mb-1">Where should we send your estimate?</h2>
								<p className="text-sm text-slate-500 mb-8">A roofing specialist will prepare your detailed quote and schedule a free inspection.</p>

								<div className="space-y-4">
									<div className="grid grid-cols-2 gap-3">
										<div>
											<label className="block text-xs font-medium text-slate-400 mb-1">Name <span className="text-red-400">*</span></label>
											<input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Enter your full name"
												className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-600 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all" />
										</div>
										<div>
											<label className="block text-xs font-medium text-slate-400 mb-1">Email <span className="text-red-400">*</span></label>
											<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email"
												className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-600 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all" />
										</div>
									</div>

									<div>
										<label className="block text-xs font-medium text-slate-400 mb-1">Phone <span className="text-red-400">*</span></label>
										<input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Enter your phone number"
											className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-600 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all" />
									</div>

									<div>
										<label className="block text-xs font-medium text-slate-400 mb-2">Preferred contact method</label>
										<div className="flex gap-2">
											{([
												{ id: 'call' as ContactMethod, label: 'Call' },
												{ id: 'text' as ContactMethod, label: 'Text' },
												{ id: 'email' as ContactMethod, label: 'Email' },
											]).map((opt) => (
												<button key={opt.id} onClick={() => setContactMethod(opt.id)}
													className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
														contactMethod === opt.id
															? 'bg-blue-500/10 border-2 border-blue-500/50 text-blue-400'
															: 'bg-white/[0.03] border border-white/5 text-slate-500 hover:bg-white/[0.06]'
													}`}>{opt.label}</button>
											))}
										</div>
									</div>

									<div>
										<label className="block text-xs font-medium text-slate-400 mb-2">Best time to reach you</label>
										<div className="flex gap-2">
											{([
												{ id: 'morning' as BestTime, label: 'Morning', sub: '8am–12pm' },
												{ id: 'afternoon' as BestTime, label: 'Afternoon', sub: '12–5pm' },
												{ id: 'evening' as BestTime, label: 'Evening', sub: '5–8pm' },
											]).map((opt) => (
												<button key={opt.id} onClick={() => setBestTime(opt.id)}
													className={`flex-1 py-2.5 rounded-xl transition-all ${
														bestTime === opt.id
															? 'bg-blue-500/10 border-2 border-blue-500/50'
															: 'bg-white/[0.03] border border-white/5 hover:bg-white/[0.06]'
													}`}>
													<div className={`text-sm font-medium ${bestTime === opt.id ? 'text-blue-400' : 'text-slate-400'}`}>{opt.label}</div>
													<div className="text-[10px] text-slate-600">{opt.sub}</div>
												</button>
											))}
										</div>
									</div>

									<label className="flex items-start gap-3 cursor-pointer pt-2">
										<input type="checkbox" checked={agreedTerms} onChange={(e) => setAgreedTerms(e.target.checked)}
											className="mt-0.5 w-4 h-4 text-blue-600 bg-white/5 border-white/20 rounded focus:ring-blue-500" />
										<span className="text-xs text-slate-500 leading-relaxed">
											I agree to the <span className="text-blue-400">Terms of Service</span> and <span className="text-blue-400">Privacy Policy</span>.
											By submitting, I consent to being contacted about my roofing project.
										</span>
									</label>

									<button onClick={() => canSubmit && setSubmitted(true)} disabled={!canSubmit}
										className={`w-full py-4 text-base font-semibold rounded-xl transition-all mt-2 ${
											canSubmit
												? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20'
												: 'bg-white/5 text-slate-600 cursor-not-allowed'
										}`}>Get my estimate</button>
								</div>
							</div>
						</motion.div>
					) : (
						<motion.div key="success" className="text-center py-20" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
							<motion.div className="w-20 h-20 bg-emerald-500/15 rounded-full flex items-center justify-center mx-auto mb-6"
								initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}>
								<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
							</motion.div>
							<motion.h2 className="text-3xl font-bold text-white mb-3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
								Thank you, {firstName}!
							</motion.h2>
							<motion.p className="text-slate-400 max-w-sm mx-auto mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
								A roofing specialist will contact you within 2 hours to discuss your project and schedule a free inspection.
							</motion.p>
							<motion.div className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-sm font-medium"
								initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
								<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
									<path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
								</svg>
								Expect a call within 2 hours
							</motion.div>
							<motion.div className="mt-12 text-xs text-slate-700 flex items-center justify-center gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
								<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
								Powered by Zuper
							</motion.div>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</div>
	);
}
