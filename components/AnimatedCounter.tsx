'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function AnimatedCounter({
	value,
	className = '',
}: {
	value: number;
	className?: string;
}) {
	const spanRef = useRef<HTMLSpanElement>(null);
	const counterObj = useRef({ val: 0 });

	useEffect(() => {
		gsap.to(counterObj.current, {
			val: value,
			duration: 1.8,
			ease: 'power2.out',
			onUpdate: () => {
				if (spanRef.current) {
					spanRef.current.textContent = Math.round(counterObj.current.val).toLocaleString();
				}
			},
		});
	}, [value]);

	return <span ref={spanRef} className={className}>0</span>;
}
