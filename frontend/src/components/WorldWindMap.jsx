import React, { useEffect, useRef, useImperativeHandle, forwardRef, useState } from 'react';
const WorldWind = window.WorldWind;
import { SERVICE_URLS } from '../config/layers';

const WorldWindMap = forwardRef(({ activeLayer, opacity, autoRotate = false, time }, ref) => {
    const wwdRef = useRef(null);
    const canvasRef = useRef(null);
    const animationId = useRef(null);
    const [isInitialized, setIsInitialized] = useState(false);

    // Expose methods to parent
    useImperativeHandle(ref, () => ({
        goToLocation: (lat, lon, range = 5000000) => {
            const wwd = wwdRef.current;
            if (!wwd) return;

            const animator = new WorldWind.GoToAnimator(wwd);
            animator.goTo(new WorldWind.Location(lat, lon), () => {
                wwd.navigator.range = range;
            });
        },
        getCanvasDataURL: () => {
            return canvasRef.current ? canvasRef.current.toDataURL('image/png') : null;
        }
    }));

    // Initial Setup
    useEffect(() => {
        if (!canvasRef.current) return;

        try {
            // Attempt to pre-initialize WebGL context with preserveDrawingBuffer: true
            // This is required for toDataURL() to work on the WebGL canvas
            const gl = canvasRef.current.getContext('webgl', { preserveDrawingBuffer: true }) ||
                canvasRef.current.getContext('experimental-webgl', { preserveDrawingBuffer: true });

            // Initialize WorldWindow
            const wwd = new WorldWind.WorldWindow(canvasRef.current.id);
            wwdRef.current = wwd;

            // Basic configuration
            WorldWind.Logger.setLoggingLevel(WorldWind.Logger.LEVEL_ERROR);

            // Layers
            const layers = [
                { layer: new WorldWind.BMNGLayer(), enabled: true },
                { layer: new WorldWind.AtmosphereLayer(), enabled: true }
            ];

            layers.forEach(l => {
                l.layer.enabled = l.enabled;
                wwd.addLayer(l.layer);
            });

            wwd.navigator.lookAtLocation.latitude = 20;
            wwd.navigator.lookAtLocation.longitude = 0;
            wwd.navigator.range = 15000000;

            // --- REFACTORED RESIZE HANDLER FOR "NO FLATTENING" ---
            const syncCanvasSize = () => {
                const canvas = canvasRef.current;
                const wwd = wwdRef.current;
                if (!canvas || !wwd) return;

                const container = canvas.parentElement;
                const displayWidth = container.clientWidth;
                const displayHeight = container.clientHeight;

                // Sync internal resolution with CSS size to maintain 1:1 aspect ratio
                if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
                    canvas.width = displayWidth;
                    canvas.height = displayHeight;

                    // Force WorldWind to recalculate its internal viewport
                    // This is key to preventing the "flattened" look
                    wwd.redraw();
                }
            };

            // Use ResizeObserver for real-time sizing accuracy
            const resizeObserver = new ResizeObserver(() => {
                syncCanvasSize();
            });
            resizeObserver.observe(canvasRef.current.parentElement);

            // Initial sizing pulse
            setTimeout(syncCanvasSize, 50);
            setTimeout(syncCanvasSize, 500);

            setIsInitialized(true);

            return () => {
                resizeObserver.disconnect();
                if (animationId.current) cancelAnimationFrame(animationId.current);
            };
        } catch (err) {
            console.error("[WorldWind] Error:", err);
        }
    }, []);

    // Rotation
    useEffect(() => {
        const wwd = wwdRef.current;
        if (!wwd) return;

        const rotate = () => {
            if (autoRotate) {
                wwd.navigator.lookAtLocation.longitude += 0.1;
                wwd.redraw();
            }
            animationId.current = requestAnimationFrame(rotate);
        };

        if (autoRotate) rotate();
        else if (animationId.current) cancelAnimationFrame(animationId.current);

        return () => {
            if (animationId.current) cancelAnimationFrame(animationId.current);
        };
    }, [autoRotate]);

    // Layer Update
    useEffect(() => {
        const wwd = wwdRef.current;
        if (!wwd || !isInitialized) return;

        // Cleanup previous pollutant layers safely
        const layersToRemove = wwd.layers.filter(l => l.displayName === "Active Pollutant");
        layersToRemove.forEach(l => wwd.removeLayer(l));

        if (activeLayer) {
            const isNASA = activeLayer.service === 'nasa_gibs';
            const isEUM = activeLayer.service === 'eumetsat';
            const serviceAddress = SERVICE_URLS[activeLayer.service] || SERVICE_URLS.ecmwf;

            let displayTime = time;

            // Handle specific service requirements for time
            if (isNASA) {
                const d = new Date();
                d.setDate(d.getDate() - 1); // 1-day lag safe for NASA
                displayTime = d.toISOString().split('T')[0];
            } else if (isEUM) {
                // EUMETSAT is Near Real Time, but we should ensure time is not in the future
                const now = new Date();
                const requested = new Date(time);
                if (requested > now) {
                    displayTime = now.toISOString().split('.')[0] + 'Z';
                }
            }

            const layerConfig = {
                title: "Active Layer",
                version: "1.1.1",
                service: serviceAddress,
                layerNames: activeLayer.layer,
                sector: WorldWind.Sector.FULL_SPHERE,
                // Increase delta for faster low-res coverage
                levelZeroDelta: new WorldWind.Location(90, 90),
                numLevels: 5, // Drastically reduced for performance
                format: "image/png",
                size: 256, // Forcing 256 for everything to ensure speed
                coordinateSystem: "EPSG:4326",
                styleNames: activeLayer.style || "",
                transparent: true
            };

            const wmsLayer = new WorldWind.WmsLayer(layerConfig, displayTime);
            wmsLayer.displayName = "Active Pollutant";
            wmsLayer.opacity = opacity;

            // Optimization: Set time on the urlBuilder before adding to map
            if (displayTime && wmsLayer.urlBuilder) {
                wmsLayer.urlBuilder.time = displayTime;
            }

            // Small timeout to let the UI breathe and prevent rapid sequential WMS calls
            const timeoutId = setTimeout(() => {
                wwd.addLayer(wmsLayer);
                wwd.redraw();
            }, 100);

            return () => clearTimeout(timeoutId);
        }
    }, [activeLayer, time, opacity, isInitialized]);

    return (
        <div className="map-container" style={{ width: '100vw', height: '100vh', backgroundColor: '#020617', overflow: 'hidden', position: 'relative' }}>
            <div className="cyber-grid"></div>
            <canvas
                id="canvasOne"
                ref={canvasRef}
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'block',
                    touchAction: 'none', /* Better for 3D interactions */
                    position: 'relative',
                    zIndex: 1
                }}
            >
                Your browser does not support HTML5 Canvas.
            </canvas>
            <div className="atmosphere-glow"></div>
        </div>
    );
});

export default WorldWindMap;
