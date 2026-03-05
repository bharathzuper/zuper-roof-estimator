'use client';

import { motion } from 'framer-motion';

const badges = [
	{ icon: '🤖', label: 'AI-Powered' },
	{ icon: '🆓', label: 'Free Estimate' },
	{ icon: '🏠', label: 'No Site Visit' },
	{ icon: '🎯', label: '98% Accurate' },
];

function HouseIllustration({ className, delay }: { className?: string; delay?: number }) {
	return (
		<motion.svg
			viewBox="0 0 120 120"
			className={className}
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 0.15, y: 0 }}
			transition={{ delay: delay ?? 0, duration: 1 }}
		>
			<path d="M60 15 L105 55 L105 105 L15 105 L15 55 Z" fill="currentColor" />
			<path d="M60 15 L105 55 L15 55 Z" fill="currentColor" opacity="0.7" />
			<rect x="40" y="70" width="20" height="35" rx="2" fill="white" opacity="0.3" />
			<rect x="72" y="62" width="18" height="18" rx="2" fill="white" opacity="0.2" />
			<rect x="25" y="62" width="18" height="18" rx="2" fill="white" opacity="0.2" />
			<circle cx="85" cy="25" r="4" fill="currentColor" opacity="0.3" />
			<path d="M82 30 L82 50" stroke="currentColor" strokeWidth="1.5" opacity="0.2" />
		</motion.svg>
	);
}

export default function Step1Welcome({ onStart }: { onStart: () => void }) {
	return (
		<div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-sky-50">
			<HouseIllustration
				className="absolute top-16 left-8 w-36 h-36 text-slate-400 -rotate-6"
				delay={0.3}
			/>
			<HouseIllustration
				className="absolute bottom-12 right-12 w-44 h-44 text-slate-400 rotate-6"
				delay={0.6}
			/>

			<motion.div
				className="absolute top-20 right-24 text-slate-300"
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ delay: 0.8 }}
			>
				<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
					<circle cx="12" cy="12" r="10" />
					<path d="M12 6v6l4 2" />
				</svg>
			</motion.div>

			<motion.div
				className="absolute bottom-32 left-24 text-slate-300"
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ delay: 1 }}
			>
				<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
					<path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
				</svg>
			</motion.div>

			<div className="relative z-10 text-center max-w-2xl mx-auto px-6">
				<motion.div
					className="mb-8"
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6 }}
				>
					<div className="inline-flex items-center gap-2 mb-6">
						<div className="w-10 h-10 rounded-lg bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center">
							<svg
								width="22"
								height="22"
								viewBox="0 0 24 24"
								fill="none"
								stroke="white"
								strokeWidth="2"
							>
								<path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
								<polyline points="9 22 9 12 15 12 15 22" />
							</svg>
						</div>
						<span className="text-lg font-semibold text-slate-700">Acme Roofing Co.</span>
					</div>
				</motion.div>

				<motion.h1
					className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4 leading-tight"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.15 }}
				>
					Get a{' '}
					<span className="underline decoration-sky-400 decoration-4 underline-offset-4">
						free
					</span>{' '}
					instant estimate
				</motion.h1>

				<motion.p
					className="text-lg text-slate-500 mb-10 max-w-lg mx-auto leading-relaxed"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.3 }}
				>
					Our AI analyzes satellite imagery to measure your roof and provide an instant
					estimate for your roof replacement.
				</motion.p>

				<motion.button
					onClick={onStart}
					className="inline-flex items-center gap-3 px-8 py-4 bg-slate-900 text-white text-lg font-medium rounded-full hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.45 }}
					whileHover={{ scale: 1.03 }}
					whileTap={{ scale: 0.98 }}
				>
					Get started
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
						<path d="M5 12h14M12 5l7 7-7 7" />
					</svg>
				</motion.button>

				<motion.p
					className="mt-6 text-sm text-slate-400"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.7 }}
				>
					Unlike other tools, we show you your estimate — no contact info required
				</motion.p>

				<motion.div
					className="flex items-center justify-center gap-6 mt-12"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.6 }}
				>
					{badges.map((b, i) => (
						<motion.div
							key={b.label}
							className="flex items-center gap-2 text-sm text-slate-500"
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.7 + i * 0.1 }}
						>
							<span className="text-base">{b.icon}</span>
							<span>{b.label}</span>
						</motion.div>
					))}
				</motion.div>
			</div>

			<motion.div
				className="absolute bottom-4 text-xs text-slate-400 flex items-center gap-2"
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ delay: 1.2 }}
			>
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
					<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
				</svg>
				Powered by Zuper
			</motion.div>
		</div>
	);
}
