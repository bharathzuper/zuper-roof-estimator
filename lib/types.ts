export interface RoofSection {
	id: string;
	label: string;
	areaSqFt: number;
	polygon: { x: number; y: number }[];
	dimensions: { label: string; x: number; y: number; rotation?: number }[];
}

export interface RoofData {
	address: string;
	city: string;
	state: string;
	zip: string;
	roofAreaSqFt: number;
	pitch: string;
	pitchLabel: string;
	sections: RoofSection[];
	stories: number;
	buildingType: 'residential' | 'commercial';
	currentMaterial: RoofMaterial;
	satelliteImageUrl: string;
	confidence: number;
}

export type RoofMaterial = 'asphalt' | 'metal' | 'tile' | 'cedar';

export interface MaterialOption {
	id: RoofMaterial;
	label: string;
	imageUrl: string;
}

export type PricingTier = 'good' | 'better' | 'best';

export interface TierConfig {
	id: PricingTier;
	label: string;
	tagline: string;
	materialName: string;
	materialImage: string;
	warranty: string;
	features: string[];
	ratePerSqFt: number;
}

export interface PricingBreakdown {
	materials: number;
	labor: number;
	tearOff: number;
	permits: number;
	total: number;
}

export interface TierEstimate {
	tier: TierConfig;
	breakdown: PricingBreakdown;
	monthlyPayments: Record<number, number>;
}

export interface LeadFormData {
	firstName: string;
	lastName: string;
	email: string;
	phone: string;
	preferredContact: 'call' | 'text' | 'email';
	bestTime: 'morning' | 'afternoon' | 'evening';
}

export type WizardStep = 1 | 2 | 3 | 4 | 5;

export type DesiredMaterial = 'asphalt' | 'metal' | 'tile';
export type ProjectTimeline = 'now' | '1-3months' | 'no-timeline';
