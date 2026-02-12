import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Viewer, Scene, SkyAtmosphere, ImageryLayer, CameraFlyTo } from 'resium';
import { Cartesian3, Color, Ion, WebMapServiceImageryProvider } from 'cesium';

// Disable default Ion token requirement to avoid startup crashes if not configured
Ion.defaultAccessToken = null;

const CesiumMap = ({ activeLayer, opacity }) => {
    const viewerRef = useRef(null);

    // Default camera position: Global view initially
    const initialPosition = Cartesian3.fromDegrees(1.888334, 46.603354, 15000000);

    const provider = useMemo(() => {
        if (!activeLayer) return null;
        try {
            return new WebMapServiceImageryProvider({
                url: "https://eccharts.ecmwf.int/wms/?token=public",
                layers: activeLayer.layer,
                parameters: {
                    styles: activeLayer.style,
                    format: 'image/png',
                    transparent: 'true',
                    version: '1.3.0'
                }
            });
        } catch (e) {
            console.error("Failed to create WMS provider", e);
            return null;
        }
    }, [activeLayer]);

    useEffect(() => {
        if (viewerRef.current && viewerRef.current.cesiumElement) {
            const viewer = viewerRef.current.cesiumElement;
            // Eye candy
            viewer.scene.globe.enableLighting = true;
            viewer.scene.highDynamicRange = true;
            viewer.scene.fog.enabled = true;
            viewer.scene.fog.density = 0.0001;
            viewer.scene.backgroundColor = Color.BLACK;
            // Force requestAnimationFrame to ensure smooth loading
            viewer.forceRender();
        }
    }, []);

    return (
        <div className="map-container cesium-wrapper">
            <Viewer
                ref={viewerRef}
                full
                timeline={false}
                animation={false}
                baseLayerPicker={false}
                geocoder={false}
                homeButton={false}
                infoBox={false}
                sceneModePicker={false}
                selectionIndicator={false}
                navigationHelpButton={false}
                navigationInstructionsInitiallyVisible={false}
                scene3DOnly={true}
                style={{ width: '100%', height: '100%' }}
                shadows={true}
            >
                <CameraFlyTo
                    destination={initialPosition}
                    duration={2.5}
                    once={true}
                />

                <Scene />
                <SkyAtmosphere brightnessShift={0.1} />

                {provider && (
                    <ImageryLayer
                        imageryProvider={provider}
                        alpha={opacity}
                    />
                )}
            </Viewer>
        </div>
    );
};

export default CesiumMap;
