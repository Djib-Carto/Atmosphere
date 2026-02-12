import React, { useState, useEffect } from 'react';

const Legend = ({ activeLayer }) => {
    const [hasError, setHasError] = useState(false);

    // Reset error state when activeLayer changes
    useEffect(() => {
        setHasError(false);
    }, [activeLayer?.id]);

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
                    src={activeLayer.legend_url}
                    alt={`Légende ${activeLayer.name}`}
                    className="legend-image"
                    onError={() => {
                        console.warn(`Failed to load legend for: ${activeLayer.name}`);
                        setHasError(true);
                    }}
                />
            </div>
        </div>
    );
};

export default Legend;
