import { RoofData, AIRoofAnalysis, AIRoofIssue, AIRecommendation, DesiredMaterial } from './types';

function seededRandom(seed: number): () => number {
	let s = seed;
	return () => {
		s = (s * 16807 + 0) % 2147483647;
		return (s - 1) / 2147483646;
	};
}

function addressSeed(data: RoofData): number {
	let hash = 0;
	const str = `${data.address}${data.zip}`;
	for (let i = 0; i < str.length; i++) {
		hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
	}
	return Math.abs(hash);
}

const ISSUE_POOL: Omit<AIRoofIssue, 'severity'>[] = [
	{ title: 'Granule loss detected', description: 'Surface granules are wearing thin in the southern exposure, reducing UV protection and shortening material lifespan.' },
	{ title: 'Minor flashing wear', description: 'Flashing around the chimney and vents shows early signs of separation. Sealant touch-up recommended within 12 months.' },
	{ title: 'Possible moss buildup', description: 'Organic growth detected near the north-facing ridge line. Moisture retention can accelerate shingle deterioration.' },
	{ title: 'Ridge cap lifting', description: 'Several ridge cap shingles appear slightly lifted, which could allow wind-driven rain to penetrate the underlayment.' },
	{ title: 'Gutter overflow staining', description: 'Dark streaking along the fascia suggests gutter overflow. Improper drainage can lead to soffit and fascia damage.' },
	{ title: 'Thermal cracking', description: 'Hairline cracks visible on sun-exposed surfaces, consistent with prolonged heat cycling in this climate zone.' },
	{ title: 'Ponding risk on low-slope area', description: 'The low-pitch rear section may experience water ponding during heavy rain. Consider improved drainage or a membrane overlay.' },
	{ title: 'Satellite dish penetration', description: 'Roof-mounted dish brackets create potential leak points. Sealant integrity should be checked during next inspection.' },
	{ title: 'Shingle curling on east face', description: 'Early curling detected on east-facing slopes, likely caused by morning temperature swings and inadequate attic ventilation.' },
	{ title: 'Ventilation imbalance', description: 'Soffit-to-ridge airflow ratio appears suboptimal. Improved ventilation could extend roof life by 15-20%.' },
];

const SUMMARIES = {
	Excellent: [
		'Your roof is in excellent condition with minimal wear. No urgent repairs needed — just routine maintenance to keep it performing well.',
		'The AI inspection found your roof surfaces are well-maintained with strong structural integrity. Standard upkeep should keep you covered for years to come.',
	],
	Good: [
		'Your roof is in good overall condition with some minor wear consistent with its estimated age. A few preventive maintenance items were identified.',
		'The analysis shows solid roof integrity with typical age-related wear. Addressing the noted items will help maximize your roof\'s remaining lifespan.',
	],
	Fair: [
		'Your roof shows moderate wear that will need attention in the near future. Several maintenance items were flagged to prevent further deterioration.',
		'The AI detected signs of aging that are approaching the point where proactive repair is more cost-effective than waiting. Consider scheduling a professional inspection.',
	],
	Poor: [
		'Your roof has significant wear and multiple areas of concern. A professional on-site inspection is strongly recommended to assess repair vs. replacement options.',
		'The analysis identified several critical issues that could lead to leaks or structural damage if left unaddressed. Prioritizing these repairs is advisable.',
	],
};

export function generateRoofAnalysis(data: RoofData): AIRoofAnalysis {
	const rng = seededRandom(addressSeed(data));

	const pitchNum = parseInt(data.pitch.split('/')[0]) || 5;
	const sectionCount = data.sections.length;
	const areaFactor = data.roofAreaSqFt / 3000;

	const complexityPenalty = Math.min((sectionCount - 1) * 0.4, 1.5);
	const pitchBonus = pitchNum >= 6 ? 0.3 : -0.2;
	const materialBonus = data.currentMaterial === 'metal' ? 1.0
		: data.currentMaterial === 'tile' ? 0.6
		: data.currentMaterial === 'cedar' ? -0.3
		: 0;

	const baseScore = 7.5 - complexityPenalty + pitchBonus + materialBonus - (areaFactor * 0.3);
	const jitter = (rng() - 0.5) * 1.5;
	const conditionScore = Math.max(1, Math.min(10, Math.round((baseScore + jitter) * 10) / 10));

	const conditionLabel: AIRoofAnalysis['conditionLabel'] =
		conditionScore >= 8 ? 'Excellent'
		: conditionScore >= 6 ? 'Good'
		: conditionScore >= 4 ? 'Fair'
		: 'Poor';

	const urgency: AIRoofAnalysis['urgency'] =
		conditionScore >= 7 ? 'routine'
		: conditionScore >= 4.5 ? 'soon'
		: 'urgent';

	const baseAge = conditionScore >= 8 ? 5 : conditionScore >= 6 ? 10 : conditionScore >= 4 ? 18 : 25;
	const ageJitter = Math.floor(rng() * 5);
	const estimatedAge = `${baseAge + ageJitter}\u2013${baseAge + ageJitter + 4} years`;

	const issueCount = conditionScore >= 8 ? 1 : conditionScore >= 6 ? 2 : conditionScore >= 4 ? 3 : 4;
	const shuffled = [...ISSUE_POOL].sort(() => rng() - 0.5);
	const issues: AIRoofIssue[] = shuffled.slice(0, issueCount).map((issue) => {
		const sev = rng();
		const severity: AIRoofIssue['severity'] =
			conditionScore >= 7 ? 'low'
			: sev > 0.6 ? 'high'
			: sev > 0.3 ? 'medium'
			: 'low';
		return { ...issue, severity };
	});

	const summaryPool = SUMMARIES[conditionLabel];
	const summary = summaryPool[Math.floor(rng() * summaryPool.length)];

	return { conditionScore, conditionLabel, estimatedAge, issues, summary, urgency };
}

const CLIMATE_ZONES: Record<string, { label: string; recommendation: DesiredMaterial; reason: string }> = {
	TX: { label: 'hot & humid', recommendation: 'metal', reason: 'Metal roofing reflects solar heat and stands up to Texas storms, reducing cooling costs by up to 25%.' },
	AZ: { label: 'hot & arid', recommendation: 'tile', reason: 'Clay tile excels in Arizona\'s intense desert heat, providing natural thermal mass that keeps interiors cool.' },
	FL: { label: 'tropical & hurricane-prone', recommendation: 'metal', reason: 'Standing seam metal offers superior wind uplift resistance critical for Florida\'s hurricane season.' },
	CO: { label: 'alpine & variable', recommendation: 'metal', reason: 'Metal sheds heavy snowfall efficiently and handles Colorado\'s extreme temperature swings without cracking.' },
	CA: { label: 'Mediterranean', recommendation: 'tile', reason: 'Tile roofing matches California\'s architectural style while providing excellent fire resistance in wildfire-prone areas.' },
	NY: { label: 'cold & wet', recommendation: 'asphalt', reason: 'Modern architectural shingles handle freeze-thaw cycles well and are the most cost-effective option for northeastern climates.' },
	DEFAULT: { label: 'temperate', recommendation: 'asphalt', reason: 'High-quality architectural shingles offer the best balance of durability, aesthetics, and value for your climate.' },
};

const MATERIAL_NOTES_TEMPLATES: Record<string, Record<string, (climate: string) => string>> = {
	asphalt: {
		pros: (climate) => `Cost-effective choice for ${climate} climates with 25-30 year lifespan and wide style selection.`,
		cons: () => 'Shorter lifespan than premium materials; may require replacement sooner on steep pitches.',
	},
	metal: {
		pros: (climate) => `Exceptional durability in ${climate} conditions with 50+ year lifespan and energy savings.`,
		cons: () => 'Higher upfront cost, though long-term value is excellent. May require specialized installation.',
	},
	tile: {
		pros: (climate) => `Premium aesthetics and 75+ year lifespan, ideal for ${climate} environments.`,
		cons: () => 'Heaviest option — verify your structure can support the load. Higher installation complexity.',
	},
};

export function generateMaterialRecommendation(data: RoofData, analysis: AIRoofAnalysis): AIRecommendation {
	const zone = CLIMATE_ZONES[data.state] ?? CLIMATE_ZONES.DEFAULT;

	let recommendedMaterial = zone.recommendation;
	let reasoning = zone.reason;

	if (analysis.urgency === 'urgent' && recommendedMaterial !== 'asphalt') {
		recommendedMaterial = 'asphalt';
		reasoning = `Given the urgent condition of your roof, we recommend asphalt shingles for the fastest, most cost-effective replacement. This gets your home protected quickly while staying budget-friendly.`;
	} else if (analysis.conditionScore >= 8 && data.currentMaterial !== 'asphalt') {
		recommendedMaterial = data.currentMaterial as DesiredMaterial;
		reasoning = `Your current ${data.currentMaterial} roof is performing exceptionally well. When you're ready for an upgrade, sticking with the same material type is a smart choice — you know it works for your home.`;
	}

	const climateLabel = zone.label;
	const materialNotes: Record<string, string> = {};
	for (const mat of ['asphalt', 'metal', 'tile']) {
		const templates = MATERIAL_NOTES_TEMPLATES[mat];
		materialNotes[mat] = templates.pros(climateLabel);
	}

	return { recommendedMaterial, reasoning, materialNotes };
}
