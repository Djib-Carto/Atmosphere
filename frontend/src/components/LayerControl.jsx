import { Layers, Wind, CloudRain, Zap, ChevronLeft, ChevronRight } from 'lucide-react';

const ICON_MAP = {
    Wind: Wind,
    CloudRain: CloudRain,
    Zap: Zap
};

const LayerControl = ({
    categories,
    activeCategoryId,
    onCategoryChange,
    layers,
    activeLayerId,
    onLayerSelect,
    opacity,
    onOpacityChange,
    isCollapsed,
    onToggleCollapse
}) => {
    return (
        <div className={`layer-control ${isCollapsed ? 'collapsed' : ''}`}>
            <button
                className="collapse-toggle-btn"
                onClick={onToggleCollapse}
                title={isCollapsed ? "Afficher les contrôles" : "Masquer les contrôles"}
            >
                {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>

            {!isCollapsed && (
                <>
                    <div className="layer-control-header">
                        <h1>
                            <Layers size={22} className="header-icon" />
                            <span>Observatoire Global</span>
                        </h1>
                        <div className="app-subtitle">Données Climatologiques & Atmosphériques</div>

                        <div className="category-tabs">
                            {categories.map(cat => {
                                const Icon = ICON_MAP[cat.icon] || Wind;
                                return (
                                    <button
                                        key={cat.id}
                                        className={`category-tab ${activeCategoryId === cat.id ? 'active' : ''}`}
                                        onClick={() => onCategoryChange(cat.id)}
                                    >
                                        <Icon size={14} />
                                        <span>{cat.name}</span>
                                    </button>
                                );
                            })}
                        </div>

                        <div className="opacity-control">
                            <div className="opacity-info">
                                <span className="opacity-label">Opacité du calque</span>
                                <span className="opacity-value">{Math.round(opacity * 100)}%</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.05"
                                value={opacity}
                                onChange={(e) => onOpacityChange(parseFloat(e.target.value))}
                                className="opacity-slider"
                            />
                        </div>
                    </div>

                    <div className="layer-list-scroll">
                        <div className="layer-list">
                            {layers
                                .filter(l => l.category === activeCategoryId)
                                .map((layer) => (
                                    <div
                                        key={layer.id}
                                        className={`layer-item ${activeLayerId === layer.id ? 'active' : ''}`}
                                        onClick={() => onLayerSelect(layer)}
                                    >
                                        <div className="layer-name">
                                            {layer.name}
                                            {!layer.legend_url && <span className="layer-badge-sat" title="Image satellite">🛰️</span>}
                                        </div>
                                        <div className="layer-desc">{layer.description || layer.label}</div>
                                    </div>
                                ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default LayerControl;
