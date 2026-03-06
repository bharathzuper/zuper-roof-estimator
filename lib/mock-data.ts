import { RoofData, MaterialOption } from './types';
import { getEsriSatelliteUrl } from './google-apis';

export const MOCK_ADDRESSES: RoofData[] = [
	{
		address: '742 Evergreen Terrace',
		city: 'Dallas',
		state: 'TX',
		zip: '75201',
		lat: 32.8143,
		lng: -96.7714,
		roofAreaSqFt: 2850,
		pitch: '6/12',
		pitchLabel: 'Moderate',
		sections: [
			{
				id: 'A',
				label: 'Main Roof',
				areaSqFt: 1800,
				pitch: '6/12',
				azimuth: 'South',
				polygon: [
					{ x: 15, y: 20 },
					{ x: 65, y: 15 },
					{ x: 70, y: 55 },
					{ x: 10, y: 58 },
				],
				dimensions: [
					{ label: '42 ft', x: 40, y: 12, rotation: -2 },
					{ label: '28 ft', x: 72, y: 37, rotation: 80 },
				],
			},
			{
				id: 'B',
				label: 'Garage Wing',
				areaSqFt: 1050,
				pitch: '5/12',
				azimuth: 'East',
				polygon: [
					{ x: 55, y: 58 },
					{ x: 88, y: 55 },
					{ x: 90, y: 82 },
					{ x: 52, y: 85 },
				],
				dimensions: [
					{ label: '24 ft', x: 71, y: 53, rotation: -2 },
					{ label: '18 ft', x: 92, y: 69, rotation: 80 },
				],
			},
		],
		stories: 2,
		buildingType: 'residential',
		currentMaterial: 'asphalt',
		satelliteImageUrl: getEsriSatelliteUrl(32.8143, -96.7714),
		confidence: 98,
	},
	{
		address: '1247 Oakwood Dr',
		city: 'Plano',
		state: 'TX',
		zip: '75025',
		lat: 33.0462,
		lng: -96.7320,
		roofAreaSqFt: 3200,
		pitch: '7/12',
		pitchLabel: 'Moderate-Steep',
		sections: [
			{
				id: 'A',
				label: 'Main Roof',
				areaSqFt: 2100,
				pitch: '7/12',
				azimuth: 'South',
				polygon: [
					{ x: 10, y: 18 },
					{ x: 75, y: 12 },
					{ x: 80, y: 62 },
					{ x: 8, y: 65 },
				],
				dimensions: [
					{ label: '48 ft', x: 42, y: 10, rotation: -2 },
					{ label: '32 ft', x: 82, y: 38, rotation: 80 },
				],
			},
			{
				id: 'B',
				label: 'East Wing',
				areaSqFt: 700,
				pitch: '6/12',
				azimuth: 'East',
				polygon: [
					{ x: 62, y: 62 },
					{ x: 90, y: 60 },
					{ x: 92, y: 80 },
					{ x: 60, y: 82 },
				],
				dimensions: [
					{ label: '20 ft', x: 76, y: 58, rotation: -2 },
					{ label: '14 ft', x: 94, y: 71, rotation: 80 },
				],
			},
			{
				id: 'C',
				label: 'Porch',
				areaSqFt: 400,
				pitch: '4/12',
				azimuth: 'West',
				polygon: [
					{ x: 12, y: 68 },
					{ x: 40, y: 66 },
					{ x: 42, y: 82 },
					{ x: 10, y: 84 },
				],
				dimensions: [{ label: '16 ft', x: 26, y: 64, rotation: -1 }],
			},
		],
		stories: 1,
		buildingType: 'residential',
		currentMaterial: 'asphalt',
		satelliteImageUrl: getEsriSatelliteUrl(33.0462, -96.7320),
		confidence: 96,
	},
	{
		address: '891 Cedar Ridge Ln',
		city: 'Frisco',
		state: 'TX',
		zip: '75034',
		lat: 33.1507,
		lng: -96.8236,
		roofAreaSqFt: 2100,
		pitch: '5/12',
		pitchLabel: 'Low-Moderate',
		sections: [
			{
				id: 'A',
				label: 'Main Roof',
				areaSqFt: 1400,
				pitch: '5/12',
				azimuth: 'South',
				polygon: [
					{ x: 12, y: 22 },
					{ x: 72, y: 18 },
					{ x: 75, y: 60 },
					{ x: 10, y: 62 },
				],
				dimensions: [
					{ label: '36 ft', x: 42, y: 15, rotation: -1 },
					{ label: '22 ft', x: 77, y: 40, rotation: 80 },
				],
			},
			{
				id: 'B',
				label: 'Rear Section',
				areaSqFt: 700,
				pitch: '5/12',
				azimuth: 'North',
				polygon: [
					{ x: 30, y: 62 },
					{ x: 78, y: 60 },
					{ x: 80, y: 85 },
					{ x: 28, y: 87 },
				],
				dimensions: [
					{ label: '28 ft', x: 54, y: 58, rotation: -1 },
					{ label: '16 ft', x: 82, y: 73, rotation: 80 },
				],
			},
		],
		stories: 2,
		buildingType: 'residential',
		currentMaterial: 'metal',
		satelliteImageUrl: getEsriSatelliteUrl(33.1507, -96.8236),
		confidence: 97,
	},
	{
		address: '2055 Sunset Blvd',
		city: 'McKinney',
		state: 'TX',
		zip: '75070',
		lat: 33.1972,
		lng: -96.6500,
		roofAreaSqFt: 3800,
		pitch: '8/12',
		pitchLabel: 'Steep',
		sections: [
			{
				id: 'A',
				label: 'North Wing',
				areaSqFt: 1500,
				pitch: '8/12',
				azimuth: 'North',
				polygon: [
					{ x: 8, y: 15 },
					{ x: 50, y: 12 },
					{ x: 52, y: 48 },
					{ x: 6, y: 50 },
				],
				dimensions: [
					{ label: '32 ft', x: 29, y: 10, rotation: -1 },
					{ label: '24 ft', x: 54, y: 30, rotation: 80 },
				],
			},
			{
				id: 'B',
				label: 'South Wing',
				areaSqFt: 1300,
				pitch: '8/12',
				azimuth: 'South',
				polygon: [
					{ x: 50, y: 15 },
					{ x: 92, y: 12 },
					{ x: 94, y: 50 },
					{ x: 48, y: 52 },
				],
				dimensions: [
					{ label: '30 ft', x: 71, y: 10, rotation: -1 },
					{ label: '24 ft', x: 96, y: 31, rotation: 80 },
				],
			},
			{
				id: 'C',
				label: 'Center',
				areaSqFt: 600,
				pitch: '7/12',
				azimuth: 'East',
				polygon: [
					{ x: 30, y: 52 },
					{ x: 70, y: 50 },
					{ x: 72, y: 72 },
					{ x: 28, y: 74 },
				],
				dimensions: [{ label: '26 ft', x: 50, y: 48, rotation: 0 }],
			},
			{
				id: 'D',
				label: 'Garage',
				areaSqFt: 400,
				pitch: '6/12',
				azimuth: 'West',
				polygon: [
					{ x: 60, y: 74 },
					{ x: 90, y: 72 },
					{ x: 92, y: 90 },
					{ x: 58, y: 92 },
				],
				dimensions: [
					{ label: '18 ft', x: 75, y: 70, rotation: -1 },
					{ label: '12 ft', x: 94, y: 81, rotation: 80 },
				],
			},
		],
		stories: 2,
		buildingType: 'residential',
		currentMaterial: 'tile',
		satelliteImageUrl: getEsriSatelliteUrl(33.1972, -96.6500),
		confidence: 95,
	},
];

export const MATERIAL_OPTIONS: MaterialOption[] = [
	{
		id: 'asphalt',
		name: 'Asphalt Shingles',
		label: 'Asphalt Shingles',
		description: 'Most popular choice. Affordable, reliable, and available in many styles.',
		lifespan: '20\u201330 years',
		priceRange: '$3\u20137/sq ft',
		imageUrl: 'https://images.unsplash.com/photo-1632759145351-1d592919f522?w=480&h=260&fit=crop&q=80',
	},
	{
		id: 'metal',
		name: 'Metal Roofing',
		label: 'Metal Roofing',
		description: 'Extremely durable and energy-efficient. Great for all climates.',
		lifespan: '40\u201370 years',
		priceRange: '$5\u201314/sq ft',
		imageUrl: 'https://images.unsplash.com/photo-1625766763788-95dcce9bf5ac?w=480&h=260&fit=crop&q=80',
	},
	{
		id: 'tile',
		name: 'Tile Roofing',
		label: 'Tile Roofing',
		description: 'Premium look with exceptional longevity. Classic Mediterranean style.',
		lifespan: '50\u2013100 years',
		priceRange: '$6\u201316/sq ft',
		imageUrl: 'https://images.unsplash.com/photo-1598228723793-52759bba239c?w=480&h=260&fit=crop&q=80',
	},
];

export function findMockAddress(query: string): RoofData | null {
	const q = query.toLowerCase();
	return MOCK_ADDRESSES.find((a) => a.address.toLowerCase().includes(q)) ?? null;
}

export function filterAddresses(query: string): RoofData[] {
	if (!query || query.length < 2) return [];
	const q = query.toLowerCase();
	return MOCK_ADDRESSES.filter(
		(a) =>
			a.address.toLowerCase().includes(q) ||
			a.city.toLowerCase().includes(q) ||
			a.zip.includes(q),
	);
}
