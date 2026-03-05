import { TierConfig, TierEstimate, PricingBreakdown } from './types';

const TIER_CONFIGS: Record<string, TierConfig[]> = {
	asphalt: [
		{
			id: 'good',
			label: 'Essential',
			tagline: 'Budget-Friendly',
			materialName: '3-Tab Shingles',
			materialImage: 'https://images.unsplash.com/photo-1632759145351-1d592919f522?w=400&q=80',
			warranty: '25-year limited',
			features: [
				'Standard felt underlayment',
				'Basic ridge ventilation',
				'Standard drip edge',
				'5-year workmanship warranty',
			],
			ratePerSqFt: 3.25,
		},
		{
			id: 'better',
			label: 'Most Popular',
			tagline: 'Best Value',
			materialName: 'GAF Timberline HDZ',
			materialImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&q=80',
			warranty: 'Lifetime limited',
			features: [
				'Synthetic underlayment',
				'Enhanced ridge ventilation',
				'Ice & water shield at eaves',
				'Drip edge & starter strip',
				'10-year workmanship warranty',
			],
			ratePerSqFt: 4.75,
		},
		{
			id: 'best',
			label: 'Premium',
			tagline: 'Maximum Protection',
			materialName: 'GAF Grand Canyon',
			materialImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&q=80',
			warranty: 'Lifetime + Golden Pledge',
			features: [
				'Premium synthetic underlayment',
				'Full ventilation system',
				'Ice & water shield full deck',
				'All premium accessories',
				'25-year workmanship warranty',
				'Golden Pledge coverage',
			],
			ratePerSqFt: 7.0,
		},
	],
	metal: [
		{
			id: 'good',
			label: 'Essential',
			tagline: 'Durable & Affordable',
			materialName: 'Corrugated Metal',
			materialImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&q=80',
			warranty: '30-year limited',
			features: ['Standard underlayment', 'Basic trim package', '5-year workmanship warranty'],
			ratePerSqFt: 5.5,
		},
		{
			id: 'better',
			label: 'Most Popular',
			tagline: 'Best Value',
			materialName: 'Standing Seam Metal',
			materialImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&q=80',
			warranty: '40-year limited',
			features: [
				'Synthetic underlayment',
				'Premium trim package',
				'Snow guards included',
				'15-year workmanship warranty',
			],
			ratePerSqFt: 8.5,
		},
		{
			id: 'best',
			label: 'Premium',
			tagline: 'Ultimate Longevity',
			materialName: 'Copper Standing Seam',
			materialImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&q=80',
			warranty: 'Lifetime',
			features: [
				'Premium underlayment',
				'Custom copper trim',
				'Snow guards & ice melt',
				'Lifetime workmanship warranty',
			],
			ratePerSqFt: 14.0,
		},
	],
	tile: [
		{
			id: 'good',
			label: 'Essential',
			tagline: 'Classic Style',
			materialName: 'Concrete Tile',
			materialImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&q=80',
			warranty: '30-year limited',
			features: ['Standard underlayment', 'Basic flashing', '5-year workmanship warranty'],
			ratePerSqFt: 6.0,
		},
		{
			id: 'better',
			label: 'Most Popular',
			tagline: 'Best Value',
			materialName: 'Clay Barrel Tile',
			materialImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&q=80',
			warranty: '50-year limited',
			features: [
				'Synthetic underlayment',
				'Premium flashing',
				'Ridge & hip tiles included',
				'10-year workmanship warranty',
			],
			ratePerSqFt: 10.0,
		},
		{
			id: 'best',
			label: 'Premium',
			tagline: 'Timeless Elegance',
			materialName: 'Slate Tile',
			materialImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&q=80',
			warranty: 'Lifetime',
			features: [
				'Premium underlayment system',
				'Copper flashing',
				'Custom ridge work',
				'Lifetime workmanship warranty',
			],
			ratePerSqFt: 16.0,
		},
	],
};

function getPitchMultiplier(pitch: string): number {
	const pitchNum = parseInt(pitch.split('/')[0]);
	return 1 + (pitchNum - 4) * 0.035;
}

function calculateBreakdown(totalCost: number): PricingBreakdown {
	return {
		materials: Math.round(totalCost * 0.45),
		labor: Math.round(totalCost * 0.35),
		tearOff: Math.round(totalCost * 0.12),
		permits: Math.round(totalCost * 0.08),
		total: Math.round(totalCost),
	};
}

function calculateMonthlyPayments(total: number): Record<number, number> {
	return {
		12: Math.round(total / 12),
		24: Math.round(total / 24),
		36: Math.round(total / 36),
		60: Math.round((total * 1.059) / 60),
	};
}

export function calculateEstimates(
	roofAreaSqFt: number,
	pitch: string,
	material: string
): TierEstimate[] {
	const pitchMult = getPitchMultiplier(pitch);
	const tiers = TIER_CONFIGS[material] || TIER_CONFIGS.asphalt;

	return tiers.map((tier) => {
		const totalCost = roofAreaSqFt * tier.ratePerSqFt * pitchMult;
		return {
			tier,
			breakdown: calculateBreakdown(totalCost),
			monthlyPayments: calculateMonthlyPayments(Math.round(totalCost)),
		};
	});
}
