'use client';

import { Check, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

const STEPS = [
	{ label: 'Address', num: 1 },
	{ label: 'AI Scan', num: 2 },
	{ label: 'Analysis', num: 3 },
	{ label: 'Materials', num: 4 },
	{ label: 'Quote', num: 5 },
];

export default function WizardProgress({ currentStep }: { currentStep: number }) {
	if (currentStep <= 1) return null;

	const progress = ((currentStep - 1) / (STEPS.length - 1)) * 100;

	return (
		<div className="fixed top-0 inset-x-0 z-50">
			{/* Thin progress bar */}
			<div className="h-0.5 bg-white/[0.06]">
				<div
					className="h-full bg-emerald-400"
					style={{ width: `${progress}%`, transition: 'width 500ms ease-out' }}
				/>
			</div>

			{/* Nav row */}
			<div className="bg-[#111]/90 backdrop-blur-xl border-b border-white/[0.06]">
				<div className="mx-auto max-w-5xl flex items-center justify-between px-5 h-11">
					{/* Logo */}
					<div className="flex items-center gap-2">
						<div className="h-5 w-5 rounded bg-emerald-400 flex items-center justify-center">
							<Home className="h-2.5 w-2.5 text-[#111]" strokeWidth={2.5} aria-hidden="true" />
						</div>
						<span className="text-[10px] font-bold tracking-[0.12em] uppercase text-neutral-500">
							Zuper
						</span>
					</div>

					{/* Steps */}
					<nav aria-label="Wizard progress" className="flex items-center gap-1 sm:gap-4">
						{STEPS.map((step, i) => {
							const done = step.num < currentStep;
							const active = step.num === currentStep;
							return (
								<div key={step.label} className="flex items-center gap-1.5">
									{i > 0 && <div className="hidden sm:block w-4 h-px bg-white/[0.06]" />}
									<div
										className={cn(
											'h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0',
											done && 'bg-emerald-400 text-[#111]',
											active && 'bg-emerald-400/15 text-emerald-400 ring-1 ring-emerald-400/30',
											!done && !active && 'bg-white/[0.04] text-neutral-600',
										)}
										aria-current={active ? 'step' : undefined}
									>
										{done ? (
											<Check className="h-2.5 w-2.5" strokeWidth={3} aria-hidden="true" />
										) : (
											step.num
										)}
									</div>
									<span
										className={cn(
											'text-[11px] font-medium hidden sm:inline',
											active ? 'text-neutral-300' : 'text-neutral-600',
										)}
									>
										{step.label}
									</span>
								</div>
							);
						})}
					</nav>
				</div>
			</div>
		</div>
	);
}
