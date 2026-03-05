import type { Metadata } from 'next';
import { Syne, DM_Sans } from 'next/font/google';
import './globals.css';

const syne = Syne({
	variable: '--font-syne',
	subsets: ['latin'],
	display: 'swap',
});

const dmSans = DM_Sans({
	variable: '--font-dm',
	subsets: ['latin'],
	display: 'swap',
});

export const metadata: Metadata = {
	title: 'AI Roof Reports in 30 Seconds | Zuper Roofing',
	description:
		'Search any address — get roof area, pitch, and cost estimates instantly. AI-powered satellite analysis.',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={`${syne.variable} ${dmSans.variable} antialiased`}>{children}</body>
		</html>
	);
}
