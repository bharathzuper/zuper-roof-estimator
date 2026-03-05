import { RoofData, RoofSection } from './types';

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

export function hasGoogleApiKey(): boolean {
	return API_KEY.length > 0;
}

export function getSatelliteImageUrl(lat: number, lng: number, zoom = 20, size = '600x400'): string {
	if (!API_KEY) return '';
	return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=${size}&maptype=satellite&scale=2&key=${API_KEY}`;
}

function pitchDegreesToRatio(degrees: number): string {
	const rise = Math.round(Math.tan((degrees * Math.PI) / 180) * 12);
	return `${rise}/12`;
}

function pitchDegreesToLabel(degrees: number): string {
	if (degrees < 10) return 'Low';
	if (degrees < 20) return 'Moderate';
	if (degrees < 30) return 'Moderate-Steep';
	return 'Steep';
}

function sqMetersToSqFeet(m2: number): number {
	return Math.round(m2 * 10.7639);
}

function segmentBoundsToPolygon(
	segmentBbox: { sw: { latitude: number; longitude: number }; ne: { latitude: number; longitude: number } },
	buildingBbox: { sw: { latitude: number; longitude: number }; ne: { latitude: number; longitude: number } }
): { x: number; y: number }[] {
	const bw = buildingBbox.ne.longitude - buildingBbox.sw.longitude;
	const bh = buildingBbox.ne.latitude - buildingBbox.sw.latitude;

	const toPercent = (lat: number, lng: number) => ({
		x: ((lng - buildingBbox.sw.longitude) / bw) * 100,
		y: (1 - (lat - buildingBbox.sw.latitude) / bh) * 100,
	});

	const sw = toPercent(segmentBbox.sw.latitude, segmentBbox.sw.longitude);
	const ne = toPercent(segmentBbox.ne.latitude, segmentBbox.ne.longitude);

	return [
		{ x: sw.x, y: ne.y },
		{ x: ne.x, y: ne.y },
		{ x: ne.x, y: sw.y },
		{ x: sw.x, y: sw.y },
	];
}

interface SolarApiSegment {
	pitchDegrees: number;
	azimuthDegrees: number;
	stats: { areaMeters2: number; groundAreaMeters2: number };
	center: { latitude: number; longitude: number };
	boundingBox: {
		sw: { latitude: number; longitude: number };
		ne: { latitude: number; longitude: number };
	};
}

interface SolarApiResponse {
	center: { latitude: number; longitude: number };
	boundingBox: {
		sw: { latitude: number; longitude: number };
		ne: { latitude: number; longitude: number };
	};
	solarPotential: {
		wholeRoofStats: { areaMeters2: number; groundAreaMeters2: number };
		roofSegmentStats: SolarApiSegment[];
	};
}

export async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
	if (!API_KEY) return null;
	try {
		const res = await fetch(
			`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${API_KEY}`
		);
		const data = await res.json();
		if (data.results?.[0]?.geometry?.location) {
			return data.results[0].geometry.location;
		}
	} catch (e) {
		console.error('Geocoding failed:', e);
	}
	return null;
}

export async function fetchBuildingInsights(
	lat: number,
	lng: number
): Promise<RoofData | null> {
	if (!API_KEY) return null;

	try {
		const res = await fetch(
			`https://solar.googleapis.com/v1/buildingInsights:findClosest?location.latitude=${lat.toFixed(5)}&location.longitude=${lng.toFixed(5)}&requiredQuality=BASE&key=${API_KEY}`
		);

		if (res.status !== 200) return null;

		const data: SolarApiResponse = await res.json();
		const sp = data.solarPotential;
		const totalAreaSqFt = sqMetersToSqFeet(sp.wholeRoofStats.areaMeters2);

		const majorSegments = sp.roofSegmentStats
			.filter((s) => s.stats.areaMeters2 > 20)
			.slice(0, 6);

		const avgPitch =
			majorSegments.reduce((sum, s) => sum + s.pitchDegrees, 0) / majorSegments.length;

		const sections: RoofSection[] = majorSegments.map((seg, i) => {
			const label = String.fromCharCode(65 + i);
			const areaSqFt = sqMetersToSqFeet(seg.stats.areaMeters2);
			const polygon = segmentBoundsToPolygon(seg.boundingBox, data.boundingBox);
			const cx = polygon.reduce((s, p) => s + p.x, 0) / polygon.length;
			const cy = polygon.reduce((s, p) => s + p.y, 0) / polygon.length;

			return {
				id: label,
				label: `Roof Section ${label}`,
				areaSqFt,
				polygon,
				dimensions: [
					{ label: `${areaSqFt.toLocaleString()} sqft`, x: cx, y: cy - 3 },
				],
			};
		});

		const satelliteImageUrl = getSatelliteImageUrl(
			data.center.latitude,
			data.center.longitude
		);

		return {
			address: '',
			city: '',
			state: '',
			zip: '',
			roofAreaSqFt: totalAreaSqFt,
			pitch: pitchDegreesToRatio(avgPitch),
			pitchLabel: pitchDegreesToLabel(avgPitch),
			sections,
			stories: majorSegments.some((s) => s.stats.areaMeters2 > 100) ? 2 : 1,
			buildingType: 'residential',
			currentMaterial: 'asphalt',
			satelliteImageUrl,
			confidence: 96,
		};
	} catch (e) {
		console.error('Solar API failed:', e);
		return null;
	}
}
