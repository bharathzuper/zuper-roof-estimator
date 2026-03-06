'use client';

import { useEffect, useRef } from 'react';

export default function GlowCursor() {
	const dotRef = useRef<HTMLDivElement>(null);
	const ringRef = useRef<HTMLDivElement>(null);
	const pos = useRef({ x: -100, y: -100 });
	const target = useRef({ x: -100, y: -100 });
	const hovering = useRef(false);
	const visible = useRef(false);

	useEffect(() => {
		const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
		if (isTouchDevice) return;

		const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		const dot = dotRef.current;
		const ring = ringRef.current;
		if (!dot || !ring) return;

		const onMove = (e: MouseEvent) => {
			target.current = { x: e.clientX, y: e.clientY };
			if (!visible.current) {
				visible.current = true;
				dot.style.opacity = '1';
				ring.style.opacity = '1';
			}
		};

		const onLeave = () => {
			visible.current = false;
			dot.style.opacity = '0';
			ring.style.opacity = '0';
		};

		const onOver = (e: MouseEvent) => {
			const el = e.target as HTMLElement;
			const interactive = el.closest('button, a, input, textarea, [role="radio"], [role="button"]');
			hovering.current = !!interactive;
		};

		document.addEventListener('mousemove', onMove);
		document.addEventListener('mouseleave', onLeave);
		document.addEventListener('mouseover', onOver);

		let raf: number;
		const lerp = prefersReduced ? 1 : 0.15;

		function tick() {
			pos.current.x += (target.current.x - pos.current.x) * lerp;
			pos.current.y += (target.current.y - pos.current.y) * lerp;

			const dotScale = hovering.current ? 1.8 : 1;
			const ringScale = hovering.current ? 1.5 : 1;

			dot!.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px) translate(-50%, -50%) scale(${dotScale})`;
			ring!.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px) translate(-50%, -50%) scale(${ringScale})`;

			raf = requestAnimationFrame(tick);
		}
		raf = requestAnimationFrame(tick);

		document.documentElement.style.cursor = 'none';
		const style = document.createElement('style');
		style.textContent = '*, *::before, *::after { cursor: none !important; }';
		document.head.appendChild(style);

		return () => {
			document.removeEventListener('mousemove', onMove);
			document.removeEventListener('mouseleave', onLeave);
			document.removeEventListener('mouseover', onOver);
			cancelAnimationFrame(raf);
			document.documentElement.style.cursor = '';
			style.remove();
		};
	}, []);

	return (
		<>
			<div
				ref={ringRef}
				className="fixed top-0 left-0 z-[9999] pointer-events-none"
				style={{
					width: 36,
					height: 36,
					borderRadius: '50%',
					border: '1px solid rgba(228,74,25,0.25)',
					opacity: 0,
					transition: 'opacity 300ms',
					mixBlendMode: 'screen',
				}}
			/>
			<div
				ref={dotRef}
				className="fixed top-0 left-0 z-[9999] pointer-events-none"
				style={{
					width: 8,
					height: 8,
					borderRadius: '50%',
					background: '#E44A19',
					boxShadow: '0 0 12px 3px rgba(228,74,25,0.4), 0 0 24px 6px rgba(228,74,25,0.15)',
					opacity: 0,
					transition: 'opacity 300ms',
				}}
			/>
		</>
	);
}
