import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, WMSTileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Component to handle map resize or other effects if needed
const MapController = () => {
    const map = useMap();
    useEffect(() => {
        map.invalidateSize();
    }, [map]);
    return null;
};

const MapComponent = ({ activeLayer, opacity }) => {
    // Default position: Europe/France view
    const position = [46.603354, 1.888334];
    const zoom = 5;

    return (
        <MapContainer
            center={position}
            zoom={zoom}
            scrollWheelZoom={true}
            className="map-container"
            zoomControl={false} // We can add custom zoom control if needed, or leave default top-left
        >
            {/* Dark base map - CartoDB Dark Matter */}
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />

            {activeLayer && (
                <WMSTileLayer
                    key={activeLayer.id} // Key forces re-render when layer changes
                    url="https://eccharts.ecmwf.int/wms/?token=public"
                    params={{
                        layers: activeLayer.layer,
                        styles: activeLayer.style,
                        format: 'image/png',
                        transparent: true,
                        version: '1.3.0',
                        uppercase: true // Leaflet WMS params handling
                    }}
                    opacity={opacity}
                />
            )}
            <MapController />
        </MapContainer>
    );
};

export default MapComponent;
