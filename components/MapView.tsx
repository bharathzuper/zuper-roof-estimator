'use client';

import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';

export interface MapViewHandle {
	flyTo: (lng: number, lat: number) => void;
	reset: () => void;
}

interface MapViewProps {
	center?: [number, number];
	zoom?: number;
	className?: string;
	onLoad?: () => void;
}

const DEFAULT_CENTER: [number, number] = [-96.7714, 32.8143];
const DEFAULT_ZOOM = 16;

const MapView = forwardRef<MapViewHandle, MapViewProps>(
	({ center = DEFAULT_CENTER, zoom = DEFAULT_ZOOM, className = '', onLoad }, ref) => {
		const containerRef = useRef<HTMLDivElement>(null);
		const mapInstanceRef = useRef<InstanceType<typeof import('maplibre-gl').Map> | null>(null);

		useImperativeHandle(ref, () => ({
			flyTo: (lng: number, lat: number) => {
				mapInstanceRef.current?.flyTo({
					center: [lng, lat],
					zoom: 19,
					pitch: 45,
					bearing: -17.6,
					duration: 3000,
					essential: true,
				});
			},
			reset: () => {
				mapInstanceRef.current?.flyTo({
					center: DEFAULT_CENTER,
					zoom: DEFAULT_ZOOM,
					pitch: 0,
					bearing: 0,
					duration: 1500,
				});
			},
		}));

		useEffect(() => {
			if (!containerRef.current) return;
			let map: InstanceType<typeof import('maplibre-gl').Map> | null = null;

			import('maplibre-gl').then((maplibregl) => {
				if (!containerRef.current) return;

				map = new maplibregl.Map({
					container: containerRef.current,
					style: {
						version: 8,
						sources: {
							'esri-satellite': {
								type: 'raster',
								tiles: [
									'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
								],
								tileSize: 256,
								maxzoom: 19,
							},
							'carto-labels': {
								type: 'raster',
								tiles: [
									'https://basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}@2x.png',
								],
								tileSize: 256,
								maxzoom: 18,
							},
						},
						layers: [
							{ id: 'satellite', type: 'raster', source: 'esri-satellite' },
							{ id: 'labels', type: 'raster', source: 'carto-labels', paint: { 'raster-opacity': 0.7 } },
						],
						glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
					},
					center,
					zoom,
					pitch: 0,
					bearing: 0,
					attributionControl: false,
					dragRotate: true,
					touchZoomRotate: true,
					maxZoom: 20,
					minZoom: 3,
				});

				map.on('load', () => {
					mapInstanceRef.current = map;
					onLoad?.();
				});
			});

			return () => {
				map?.remove();
				mapInstanceRef.current = null;
			};
		}, []);

		return <div ref={containerRef} className={`w-full h-full ${className}`} />;
	},
);

MapView.displayName = 'MapView';
export default MapView;
