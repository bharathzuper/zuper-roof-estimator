'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { RoofSection } from '@/lib/types';

const PALETTE = [
	{ fill: 'rgba(139,92,246,0.15)', stroke: '#8B5CF6', label: '#8B5CF6' },
	{ fill: 'rgba(139,92,246,0.15)', stroke: '#8B5CF6', label: '#8B5CF6' },
	{ fill: 'rgba(244,114,182,0.15)', stroke: '#f472b6', label: '#f472b6' },
	{ fill: 'rgba(251,191,36,0.15)', stroke: '#fbbf24', label: '#fbbf24' },
];

function centroid(points: { x: number; y: number }[]) {
	const n = points.length;
	const cx = points.reduce((s, p) => s + p.x, 0) / n;
	const cy = points.reduce((s, p) => s + p.y, 0) / n;
	return { x: cx, y: cy };
}

interface RoofMapOverlayProps {
	sections: RoofSection[];
	animate?: boolean;
}

export default function RoofMapOverlay({ sections, animate = true }: RoofMapOverlayProps) {
	const svgRef = useRef<SVGSVGElement>(null);

	useEffect(() => {
		if (!svgRef.current || !animate) return;
		const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (prefersReduced) return;

		const polygons = svgRef.current.querySelectorAll<SVGPolygonElement>('.roof-poly');
		const labels = svgRef.current.querySelectorAll<SVGElement>('.roof-label');

		polygons.forEach((poly) => {
			const len = poly.getTotalLength?.() || 400;
			gsap.set(poly, { strokeDasharray: len, strokeDashoffset: len, fillOpacity: 0 });
			gsap.to(poly, {
				strokeDashoffset: 0,
				duration: 1.2,
				ease: 'power2.inOut',
				delay: 0.3,
			});
			gsap.to(poly, {
				fillOpacity: 1,
				duration: 0.5,
				ease: 'power2.out',
				delay: 1.0,
			});
		});

		gsap.fromTo(labels,
			{ opacity: 0, scale: 0.5 },
			{ opacity: 1, scale: 1, duration: 0.4, stagger: 0.1, ease: 'back.out(1.5)', delay: 1.3 },
		);
	}, [animate, sections]);

	return (
		<svg
			ref={svgRef}
			viewBox="0 0 100 100"
			className="absolute inset-0 w-full h-full pointer-events-none"
			preserveAspectRatio="none"
			role="img"
			aria-label={`Roof overlay showing ${sections.length} detected sections`}
		>
			{sections.map((section, i) => {
				const colors = PALETTE[i % PALETTE.length];
				const points = section.polygon.map((p) => `${p.x},${p.y}`).join(' ');
				const center = centroid(section.polygon);

				return (
					<g key={section.id}>
						<polygon
							className="roof-poly"
							points={points}
							fill={colors.fill}
							stroke={colors.stroke}
							strokeWidth="0.8"
							strokeLinejoin="round"
						/>
						{/* Label badge */}
						<g className="roof-label" style={{ opacity: animate ? 0 : 1 }}>
							<rect
								x={center.x - 4}
								y={center.y - 4}
								width="8"
								height="8"
								rx="2"
								fill={colors.stroke}
								filter="drop-shadow(0 1px 3px rgba(0,0,0,0.4))"
							/>
							<text
								x={center.x}
								y={center.y + 0.5}
								textAnchor="middle"
								dominantBaseline="central"
								fill="white"
								fontSize="4"
								fontWeight="700"
								fontFamily="system-ui, sans-serif"
							>
								{section.id}
							</text>
						</g>
					</g>
				);
			})}
		</svg>
	);
}
