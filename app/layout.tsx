import type { Metadata } from 'next';
import { Inter, DM_Sans } from 'next/font/google';
import './globals.css';

const inter = Inter({
	variable: '--font-inter',
	subsets: ['latin'],
	display: 'swap',
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
		<html lang="en" className={`${inter.variable} ${dmSans.variable}`}>
			<body>
				{children}
			</body>
		</html>
	);
}
