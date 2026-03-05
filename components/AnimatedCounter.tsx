'use client';

import { useEffect, useState } from 'react';
import { motion, useSpring, useMotionValue, useTransform } from 'framer-motion';

export default function AnimatedCounter({
	value,
	prefix = '',
	suffix = '',
	duration = 1.5,
	className = '',
}: {
	value: number;
	prefix?: string;
	suffix?: string;
	duration?: number;
	className?: string;
}) {
	const [isInView, setIsInView] = useState(false);
	const motionValue = useMotionValue(0);
	const springValue = useSpring(motionValue, { duration: duration * 1000 });
	const display = useTransform(springValue, (v) =>
		Math.round(v).toLocaleString()
	);

	useEffect(() => {
		setIsInView(true);
	}, []);

	useEffect(() => {
		if (isInView) {
			motionValue.set(value);
		}
	}, [isInView, value, motionValue]);

	return (
		<span className={className}>
			{prefix}
			<motion.span>{display}</motion.span>
			{suffix}
		</span>
	);
}
