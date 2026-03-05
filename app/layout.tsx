import type { Metadata } from 'next';
import { Syne, DM_Sans } from 'next/font/google';
import './globals.css';

const syne = Syne({
	variable: '--font-syne',
	subsets: ['latin'],
	display: 'swap',
	weight: ['400', '500', '600', '700', '800'],
});

const dmSans = DM_Sans({
	variable: '--font-dm',
	subsets: ['latin'],
	display: 'swap',
	weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
	title: 'AI Roof Reports in 30 Seconds — Zuper',
	description:
		'Search any address. Get roof area, pitch, and cost estimates instantly. Powered by satellite AI analysis.',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" className={`${syne.variable} ${dmSans.variable}`}>
			<body>
				{/* Grain overlay — fixed, always on */}
				<div className="grain" />
				{children}
			</body>
		</html>
	);
}
