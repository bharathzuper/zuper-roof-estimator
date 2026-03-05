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

	const handleSubmit = () => {
		if (!canSubmit) return;
		setSubmitted(true);
	};

	return (
		<div className="min-h-screen flex items-center justify-center pt-16 pb-8 px-4">
			<div className="w-full max-w-lg">
				<AnimatePresence mode="wait">
					{!submitted ? (
						<motion.div
							key="form"
							initial={{ opacity: 0, y: 30 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -30 }}
						>
							<motion.button
								onClick={onBack}
								className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 mb-6 transition-colors"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
							>
								<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
									<path d="M19 12H5M12 19l-7-7 7-7" />
								</svg>
								Back to estimate
							</motion.button>

							<div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-8">
								<h2 className="text-2xl font-bold text-slate-900 mb-1">
									Love your estimate?
								</h2>
								<p className="text-sm text-slate-500 mb-8">
									A roofing specialist will prepare your detailed quote and schedule a free inspection.
								</p>

								<div className="space-y-4">
									<div className="grid grid-cols-2 gap-3">
										<div>
											<label className="block text-xs font-medium text-slate-700 mb-1">
												First name <span className="text-red-500">*</span>
											</label>
											<input
												type="text"
												value={firstName}
												onChange={(e) => setFirstName(e.target.value)}
												placeholder="John"
												className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:border-sky-400 focus:ring-4 focus:ring-sky-100 outline-none transition-all"
											/>
										</div>
										<div>
											<label className="block text-xs font-medium text-slate-700 mb-1">
												Last name
											</label>
											<input
												type="text"
												value={lastName}
												onChange={(e) => setLastName(e.target.value)}
												placeholder="Doe"
												className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:border-sky-400 focus:ring-4 focus:ring-sky-100 outline-none transition-all"
											/>
										</div>
									</div>

									<div className="grid grid-cols-2 gap-3">
										<div>
											<label className="block text-xs font-medium text-slate-700 mb-1">
												Email <span className="text-red-500">*</span>
											</label>
											<input
												type="email"
												value={email}
												onChange={(e) => setEmail(e.target.value)}
												placeholder="john@example.com"
												className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:border-sky-400 focus:ring-4 focus:ring-sky-100 outline-none transition-all"
											/>
										</div>
										<div>
											<label className="block text-xs font-medium text-slate-700 mb-1">
												Phone <span className="text-red-500">*</span>
											</label>
											<input
												type="tel"
												value={phone}
												onChange={(e) => setPhone(e.target.value)}
												placeholder="(555) 123-4567"
												className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:border-sky-400 focus:ring-4 focus:ring-sky-100 outline-none transition-all"
											/>
										</div>
									</div>

									<div>
										<label className="block text-xs font-medium text-slate-700 mb-2">
											Preferred contact method
										</label>
										<div className="flex gap-2">
											{([
												{ id: 'call' as ContactMethod, label: 'Call', icon: '📞' },
												{ id: 'text' as ContactMethod, label: 'Text', icon: '💬' },
												{ id: 'email' as ContactMethod, label: 'Email', icon: '✉️' },
											]).map((opt) => (
												<button
													key={opt.id}
													onClick={() => setContactMethod(opt.id)}
													className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
														contactMethod === opt.id
															? 'bg-sky-50 border-2 border-sky-400 text-sky-700'
															: 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
													}`}
												>
													{opt.icon} {opt.label}
												</button>
											))}
										</div>
									</div>

									<div>
										<label className="block text-xs font-medium text-slate-700 mb-2">
											Best time to reach you
										</label>
										<div className="flex gap-2">
											{([
												{ id: 'morning' as BestTime, label: 'Morning', sub: '8am–12pm' },
												{ id: 'afternoon' as BestTime, label: 'Afternoon', sub: '12–5pm' },
												{ id: 'evening' as BestTime, label: 'Evening', sub: '5–8pm' },
											]).map((opt) => (
												<button
													key={opt.id}
													onClick={() => setBestTime(opt.id)}
													className={`flex-1 py-2.5 rounded-xl transition-all ${
														bestTime === opt.id
															? 'bg-sky-50 border-2 border-sky-400'
															: 'bg-white border border-slate-200 hover:border-slate-300'
													}`}
												>
													<div className="text-sm font-medium text-slate-700">{opt.label}</div>
													<div className="text-[10px] text-slate-500">{opt.sub}</div>
												</button>
											))}
										</div>
									</div>

									<div className="pt-2">
										<label className="flex items-start gap-3 cursor-pointer">
											<input
												type="checkbox"
												checked={agreedTerms}
												onChange={(e) => setAgreedTerms(e.target.checked)}
												className="mt-0.5 w-4 h-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500"
											/>
											<span className="text-xs text-slate-500 leading-relaxed">
												I agree to the{' '}
												<span className="text-sky-600 font-medium">Terms of Service</span> and{' '}
												<span className="text-sky-600 font-medium">Privacy Policy</span>. By
												submitting, I consent to being contacted about my roofing project.
											</span>
										</label>
									</div>

									<button
										onClick={handleSubmit}
										disabled={!canSubmit}
										className={`w-full py-4 text-base font-semibold rounded-xl transition-all mt-2 ${
											canSubmit
												? 'bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-900/10'
												: 'bg-slate-200 text-slate-400 cursor-not-allowed'
										}`}
									>
										Get My Detailed Quote
									</button>
								</div>
							</div>
						</motion.div>
					) : (
						<motion.div
							key="success"
							className="text-center py-20"
							initial={{ opacity: 0, scale: 0.9 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ type: 'spring', stiffness: 200 }}
						>
							<motion.div
								className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6"
								initial={{ scale: 0 }}
								animate={{ scale: 1 }}
								transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
							>
								<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5">
									<polyline points="20 6 9 17 4 12" />
								</svg>
							</motion.div>

							<motion.h2
								className="text-3xl font-bold text-slate-900 mb-3"
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.3 }}
							>
								Thank you, {firstName}!
							</motion.h2>

							<motion.p
								className="text-slate-500 max-w-sm mx-auto mb-8"
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.4 }}
							>
								A roofing specialist will contact you within 2 hours to discuss your project and schedule a free inspection.
							</motion.p>

							<motion.div
								className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium"
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.5 }}
							>
								<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
									<path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
								</svg>
								Expect a call within 2 hours
							</motion.div>

							<motion.div
								className="mt-12 text-xs text-slate-400 flex items-center justify-center gap-2"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ delay: 0.8 }}
							>
								<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
									<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
								</svg>
								Powered by Zuper
							</motion.div>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</div>
	);
}
