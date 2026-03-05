export interface RoofSection {
	id: string;
	label: string;
	areaSqFt: number;
	pitch?: string;
	azimuth?: string;
	polygon: { x: number; y: number }[];
	dimensions: { label: string; x: number; y: number; rotation?: number }[];
}

export interface RoofData {
	address: string;
	city: string;
	state: string;
	zip: string;
	lat: number;
	lng: number;
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
	name: string;
	label: string;
	description: string;
	lifespan: string;
	priceRange: string;
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
	removal: number;
	permits: number;
	dumpster: number;
}

export interface TierEstimate {
	tierName: string;
	materialName: string;
	warranty: string;
	totalCost: number;
	costPerSqFt: number;
	monthlyPayment: number;
	breakdown: PricingBreakdown;
}

export interface LeadFormData {
	name: string;
	email: string;
	phone: string;
	preferredContact: 'call' | 'text' | 'email';
}

export type WizardStep = 1 | 2 | 3 | 4;

export type DesiredMaterial = 'asphalt' | 'metal' | 'tile';
export type ProjectTimeline = 'now' | '1-3months' | 'no-timeline';
