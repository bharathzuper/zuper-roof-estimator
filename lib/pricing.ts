import { TierConfig, TierEstimate } from './types';

const TIER_CONFIGS: Record<string, TierConfig[]> = {
	asphalt: [
		{
			id: 'good',
			label: 'Essential',
			tagline: 'Budget-Friendly',
			materialName: '3-Tab Shingles',
			materialImage: '',
			warranty: '25-year limited',
			features: ['Standard underlayment', 'Basic ridge ventilation', 'Standard drip edge', '5-year workmanship'],
			ratePerSqFt: 3.25,
		},
		{
			id: 'better',
			label: 'Most Popular',
			tagline: 'Best Value',
			materialName: 'GAF Timberline HDZ',
			materialImage: '',
			warranty: 'Lifetime limited',
			features: ['Synthetic underlayment', 'Enhanced ventilation', 'Ice & water shield', '10-year workmanship'],
			ratePerSqFt: 4.75,
		},
		{
			id: 'best',
			label: 'Premium',
			tagline: 'Maximum Protection',
			materialName: 'GAF Grand Canyon',
			materialImage: '',
			warranty: 'Lifetime + Golden Pledge',
			features: ['Premium underlayment', 'Full ventilation system', 'Full-deck ice shield', '25-year workmanship'],
			ratePerSqFt: 7.0,
		},
	],
	metal: [
		{
			id: 'good',
			label: 'Essential',
			tagline: 'Durable & Affordable',
			materialName: 'Corrugated Metal',
			materialImage: '',
			warranty: '30-year limited',
			features: ['Standard underlayment', 'Basic trim package', '5-year workmanship'],
			ratePerSqFt: 5.5,
		},
		{
			id: 'better',
			label: 'Most Popular',
			tagline: 'Best Value',
			materialName: 'Standing Seam Metal',
			materialImage: '',
			warranty: '40-year limited',
			features: ['Synthetic underlayment', 'Premium trim', 'Snow guards included', '15-year workmanship'],
			ratePerSqFt: 8.5,
		},
		{
			id: 'best',
			label: 'Premium',
			tagline: 'Ultimate Longevity',
			materialName: 'Copper Standing Seam',
			materialImage: '',
			warranty: 'Lifetime',
			features: ['Premium underlayment', 'Custom copper trim', 'Snow guards & ice melt', 'Lifetime workmanship'],
			ratePerSqFt: 14.0,
		},
	],
	tile: [
		{
			id: 'good',
			label: 'Essential',
			tagline: 'Classic Style',
			materialName: 'Concrete Tile',
			materialImage: '',
			warranty: '30-year limited',
			features: ['Standard underlayment', 'Basic flashing', '5-year workmanship'],
			ratePerSqFt: 6.0,
		},
		{
			id: 'better',
			label: 'Most Popular',
			tagline: 'Best Value',
			materialName: 'Clay Barrel Tile',
			materialImage: '',
			warranty: '50-year limited',
			features: ['Synthetic underlayment', 'Premium flashing', 'Ridge & hip tiles', '10-year workmanship'],
			ratePerSqFt: 10.0,
		},
		{
			id: 'best',
			label: 'Premium',
			tagline: 'Timeless Elegance',
			materialName: 'Slate Tile',
			materialImage: '',
			warranty: 'Lifetime',
			features: ['Premium underlayment system', 'Copper flashing', 'Custom ridge work', 'Lifetime workmanship'],
			ratePerSqFt: 16.0,
		},
	],
};

function getPitchMultiplier(pitch: string): number {
	const pitchNum = parseInt(pitch.split('/')[0]);
	if (isNaN(pitchNum)) return 1;
	return 1 + (pitchNum - 4) * 0.035;
}

export function calculateEstimates(
	roofAreaSqFt: number,
	pitch: string,
	material: string,
): TierEstimate[] {
	const pitchMult = getPitchMultiplier(pitch);
	const tiers = TIER_CONFIGS[material] || TIER_CONFIGS.asphalt;

	return tiers.map((tier) => {
		const totalCost = Math.round(roofAreaSqFt * tier.ratePerSqFt * pitchMult);
		const monthly60 = Math.round((totalCost * 1.069) / 60);

		return {
			tierName: tier.label,
			materialName: tier.materialName,
			warranty: tier.warranty,
			totalCost,
			costPerSqFt: Math.round((totalCost / roofAreaSqFt) * 100) / 100,
			monthlyPayment: monthly60,
			breakdown: {
				materials: Math.round(totalCost * 0.40),
				labor: Math.round(totalCost * 0.32),
				removal: Math.round(totalCost * 0.12),
				permits: Math.round(totalCost * 0.06),
				dumpster: Math.round(totalCost * 0.10),
			},
		};
	});
}
