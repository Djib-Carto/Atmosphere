import React, { useState, useEffect } from 'react';

const Legend = ({ activeLayer }) => {
    const [hasError, setHasError] = useState(false);
    const [useProxy, setUseProxy] = useState(false);
    const [dataUrl, setDataUrl] = useState(null);

    // Reset error state when activeLayer changes
    useEffect(() => {
        setHasError(false);
        setUseProxy(false);
        setDataUrl(null);
    }, [activeLayer?.id]);

    // Conversion to DataURL to prevent Canvas Tainting during capture
    useEffect(() => {
        if (!activeLayer?.legend_url) return;

        const convertToDataUrl = async () => {
            try {
                const url = useProxy
                    ? `https://corsproxy.io/?${encodeURIComponent(activeLayer.legend_url)}`
                    : activeLayer.legend_url;

                const response = await fetch(url);
                const blob = await response.blob();

                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(blob);
                });
            } catch (err) {
                if (!useProxy) {
                    setUseProxy(true);
                } else {
                    console.warn("Could not convert legend to dataURL", err);
                }
                return null;
            }
        };

        convertToDataUrl().then(result => {
            if (result) setDataUrl(result);
        });
    }, [activeLayer?.legend_url, useProxy]);

    if (!activeLayer || !activeLayer.legend_url) return null;
    if (hasError) return null;

    return (
        <div className="legend-container">
            <div className="legend-title">
                <span>Légende</span>
                <span className="legend-layer-name">{activeLayer.name}</span>
            </div>
            <div className="legend-image-wrapper">
                <img
                    src={dataUrl || activeLayer.legend_url}
                    alt={`Légende ${activeLayer.name}`}
                    className="legend-image"
                    crossOrigin="anonymous"
                    onError={() => {
                        if (!useProxy) {
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
