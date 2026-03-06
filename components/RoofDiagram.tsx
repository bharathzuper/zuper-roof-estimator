'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { RoofSection } from '@/lib/types';

const PALETTE = [
	{ stroke: '#34d399', fill: 'rgba(52,211,153,0.06)' },
	{ stroke: '#60a5fa', fill: 'rgba(96,165,250,0.06)' },
	{ stroke: '#f472b6', fill: 'rgba(244,114,182,0.06)' },
	{ stroke: '#fbbf24', fill: 'rgba(251,191,36,0.06)' },
];

export default function RoofDiagram({ sections }: { sections: RoofSection[] }) {
	const wrapperRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!wrapperRef.current) return;
		const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		const paths = wrapperRef.current.querySelectorAll<SVGPathElement>('.bp-path');
		const labels = wrapperRef.current.querySelectorAll<SVGGElement>('.bp-label');
		const dims = wrapperRef.current.querySelectorAll<SVGGElement>('.bp-dim');

		if (prefersReduced) {
			paths.forEach((p) => gsap.set(p, { fillOpacity: 1 }));
			gsap.set(labels, { opacity: 1 });
			gsap.set(dims, { opacity: 1 });
			return;
		}

		paths.forEach((p) => {
			const len = p.getTotalLength();
			gsap.set(p, { strokeDasharray: len, strokeDashoffset: len, fillOpacity: 0 });
			gsap.to(p, { strokeDashoffset: 0, duration: 1.4, ease: 'power2.inOut', delay: 0.25 });
			gsap.to(p, { fillOpacity: 1, duration: 0.5, delay: 1.4, ease: 'power2.out' });
		});

		gsap.fromTo(labels, { opacity: 0, scale: 0.5 }, { opacity: 1, scale: 1, duration: 0.35, ease: 'back.out(2)', stagger: 0.1, delay: 1.6 });
		gsap.fromTo(dims, { opacity: 0 }, { opacity: 1, duration: 0.3, stagger: 0.06, delay: 1.9 });
	}, [sections]);

	return (
		<div ref={wrapperRef} className="relative w-full aspect-square max-w-sm mx-auto">
			<svg viewBox="0 0 100 100" className="w-full h-full" role="img" aria-label={`Roof blueprint showing ${sections.length} sections`}>
				{/* Subtle grid */}
				{[20, 40, 60, 80].map((v) => (
					<g key={v}>
						<line x1={v} y1="5" x2={v} y2="95" stroke="rgba(255,255,255,0.03)" strokeWidth="0.15" />
						<line x1="5" y1={v} x2="95" y2={v} stroke="rgba(255,255,255,0.03)" strokeWidth="0.15" />
					</g>
				))}

				{sections.map((section, i) => {
					const c = PALETTE[i % PALETTE.length];
					const pts = section.polygon;
					const d = pts.map((p, j) => `${j === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + ' Z';
					const cx = pts.reduce((s, p) => s + p.x, 0) / pts.length;
					const cy = pts.reduce((s, p) => s + p.y, 0) / pts.length;

					return (
						<g key={section.id}>
							<path className="bp-path" d={d} fill={c.fill} stroke={c.stroke} strokeWidth={0.5} strokeLinejoin="round" />
							{pts.map((p, pi) => (
								<circle key={pi} cx={p.x} cy={p.y} r={0.7} fill={c.stroke} opacity={0.5} />
							))}
							<g className="bp-label" style={{ transformOrigin: `${cx}px ${cy}px`, transformBox: 'fill-box' as never }}>
								<circle cx={cx} cy={cy} r={3.2} fill={c.stroke} />
								<text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fill="#000" fontSize="2.2" fontWeight="700" fontFamily="system-ui">
									{section.id}
								</text>
							</g>
							{section.dimensions.map((dim, di) => (
								<g className="bp-dim" key={di}>
									<text
										x={dim.x} y={dim.y}
										textAnchor="middle" dominantBaseline="central"
										fill="rgba(255,255,255,0.4)"
										fontSize="1.8" fontWeight="500" fontFamily="system-ui"
										transform={dim.rotation ? `rotate(${dim.rotation},${dim.x},${dim.y})` : undefined}
									>
										{dim.label}
									</text>
								</g>
							))}
						</g>
					);
				})}
			</svg>
		</div>
	);
}
