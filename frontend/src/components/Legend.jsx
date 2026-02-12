import React, { useState, useEffect } from 'react';

const Legend = ({ activeLayer }) => {
    const [hasError, setHasError] = useState(false);
    const [useProxy, setUseProxy] = useState(false);

    // Reset error state when activeLayer changes
    useEffect(() => {
        setHasError(false);
        setUseProxy(false);
    }, [activeLayer?.id]);

    if (!activeLayer || !activeLayer.legend_url) return null;
    if (hasError) return null;

    // Build the legend URL - use a CORS proxy if direct fails
    const legendUrl = useProxy
        ? `https://corsproxy.io/?${encodeURIComponent(activeLayer.legend_url)}`
        : activeLayer.legend_url;

    return (
        <div className="legend-container">
            <div className="legend-title">
                <span>Légende</span>
                <span className="legend-layer-name">{activeLayer.name}</span>
            </div>
            <div className="legend-image-wrapper">
                <img
                    src={legendUrl}
                    alt={`Légende ${activeLayer.name}`}
                    className="legend-image"
                    crossOrigin="anonymous"
                    onError={() => {
                        if (!useProxy) {
                            // Try with CORS proxy on first failure
                            setUseProxy(true);
                        } else {
                            console.warn(`Failed to load legend for: ${activeLayer.name}`);
                            setHasError(true);
                        }
                    }}
                />
            </div>
        </div>
    );
};

export default Legend;
