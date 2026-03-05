'use client';

const STEPS = ['Address', 'Analysis', 'Estimate', 'Quote'];

export default function WizardProgress({ currentStep }: { currentStep: number }) {
	if (currentStep <= 1) return null;

	const progress = ((currentStep - 1) / (STEPS.length - 1)) * 100;

	return (
		<div className="fixed top-0 left-0 right-0 z-50">
			{/* Progress bar */}
			<div className="h-[2px]" style={{ background: 'var(--color-border)' }}>
				<div
					className="h-full transition-all duration-500 ease-out"
					style={{ width: `${progress}%`, background: 'var(--color-accent)' }}
				/>
			</div>

			{/* Step row */}
			<div
				className="backdrop-blur-xl"
				style={{
					background: 'rgba(8,8,8,0.8)',
					borderBottom: '1px solid var(--color-border)',
				}}
			>
				<div className="max-w-4xl mx-auto px-5 py-2.5 flex items-center justify-between">
					{/* Logo */}
					<div className="flex items-center gap-2">
						<div className="w-5 h-5 rounded flex items-center justify-center" style={{ background: 'var(--color-accent)' }}>
							<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#080808" strokeWidth="3">
								<path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
							</svg>
						</div>
						<span className="font-display text-[10px] font-bold tracking-[0.12em] uppercase" style={{ color: 'var(--color-text-tertiary)' }}>
							Zuper
						</span>
					</div>

					{/* Steps */}
					<div className="flex items-center gap-5">
						{STEPS.map((label, i) => {
							const stepNum = i + 1;
							const done = stepNum < currentStep;
							const active = stepNum === currentStep;
							return (
								<div key={label} className="flex items-center gap-2">
									<div
										className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all"
										style={{
											background: done ? 'var(--color-accent)' : active ? 'var(--color-accent-muted)' : 'rgba(255,255,255,0.03)',
											color: done ? '#080808' : active ? 'var(--color-accent)' : 'var(--color-text-tertiary)',
											border: active ? '1px solid rgba(136,255,87,0.3)' : 'none',
										}}
									>
										{done ? (
											<svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
												<polyline points="20 6 9 17 4 12" />
											</svg>
										) : (
											stepNum
										)}
									</div>
									<span
										className="text-xs font-medium hidden sm:inline"
										style={{ color: active ? 'var(--color-text-secondary)' : 'var(--color-text-tertiary)' }}
									>
										{label}
									</span>
								</div>
							);
						})}
					</div>
				</div>
			</div>
		</div>
	);
}
