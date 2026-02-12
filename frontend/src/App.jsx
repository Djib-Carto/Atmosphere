import React, { useState, useEffect, useRef } from 'react';
import { getLayers, getCategories } from './services/api';
import WorldWindMap from './components/WorldWindMap';
import LayerControl from './components/LayerControl';
import Legend from './components/Legend';
import DjiboutiDashboard from './components/DjiboutiDashboard';
import {
  RotateCw, MapPin, Wind, Zap, Clock, Play, Pause,
  Globe, Satellite, ChevronRight, Radio, Camera,
  Linkedin, Twitter
} from 'lucide-react';
import html2canvas from 'html2canvas';

const HOTSPOTS = [
  { name: "🇩🇯 Djibouti", lat: 11.589, lon: 43.145, emoji: "🇩🇯" },
  { name: "🇨🇳 Pékin", lat: 39.9042, lon: 116.4074, emoji: "🇨🇳" },
  { name: "🇮🇳 New Delhi", lat: 28.6139, lon: 77.2090, emoji: "🇮🇳" },
  { name: "🇫🇷 Paris", lat: 48.8566, lon: 2.3522, emoji: "🇫🇷" },
  { name: "🇺🇸 New York", lat: 40.7128, lon: -74.0060, emoji: "🇺🇸" },
  { name: "🇸🇦 Riyad", lat: 24.7136, lon: 46.6753, emoji: "🇸🇦" },
  { name: "🇪🇹 Addis-Abeba", lat: 9.0054, lon: 38.7636, emoji: "🇪🇹" },
  { name: "🇰🇪 Nairobi", lat: -1.2921, lon: 36.8219, emoji: "🇰🇪" },
];

// New Component: Professional Map Overlay for Exports
const MapExportOverlay = ({ activeLayer, time, isCapturing }) => {
  if (!isCapturing) return null;

  const getDynamicTitle = () => {
    if (!activeLayer) return { main: "ATMOSPHÈRE 3D", sub: "VUE SATELLITAIRE" };

    // Dynamic Main Titles based on Layer ID or Category
    const titles = {
      // Air Quality
      'pm2p5': "POLLUTION AUX PARTICULES FINES",
      'pm10': "CONCENTRATION DE PARTICULES GL0BALE",
      'no2': "SURVEILLANCE DIOXYDE D'AZOTE",
      'so2': "ÉMISSIONS SULFURIQUES & VOLCANIQUES",
      'co': "SURVEILLANCE MONOXYDE DE CARBONE",
      'co2': "CONCENTRATION DE CO₂ ATMOSPHÉRIQUE",
      'ch4': "ÉMISSIONS DE MÉTHANE GLOBALES",
      'aod': "AÉROSOLS & POUSSIÈRES DÉSERTIQUES",

      // Weather
      'eum_geocolour': "IMAGERIE SATELLITE HAUTE DÉFINITION",
      'eum_ir': "ACTIVITÉ CONVECTIVE & ORAGEUSE",
      'eum_wv': "CIRCULATION ATMOSPHÉRIQUE (VAPEUR D'EAU)",
      'eum_kindex': "INDICE D'INSTABILITÉ ATMOSPHÉRIQUE",
      'eum_cth': "ANALYSE SOMMET DES NUAGES",
      'eum_eview': "IMAGERIE MÉTÉO SATELLITAIRE (RÉGION E)",
      'eum_tropical': "ANALYSE DES MASSES D'AIR TROPICALES"
    };

    const main = titles[activeLayer.id] || (activeLayer.category === 'air_quality' ? "QUALITÉ DE L'AIR EN TEMPS RÉEL" : "ANALYSE MÉTÉOROLOGIQUE AVANCÉE");
    const sub = activeLayer.label; // Keep technical label as subtitle

    return { main: main.toUpperCase(), sub: sub.toUpperCase() };
  };

  const { main, sub } = getDynamicTitle();

  return (
    <div className="map-export-overlay">
      <div className="export-header">
        <div className="export-logo">
          <Globe size={32} />
          <div>
            <h1>{main}</h1>
            <h2>{sub}</h2>
          </div>
        </div>
        <div className="export-info">
          <div className="export-time">{new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
          <div className="export-layer">SOURCE: {activeLayer?.service === 'eumetsat' ? 'EUMETSAT METEOSAT' : 'COPERNICUS CAMS'}</div>
        </div>
      </div>

      <div className="export-compass">
        <div className="compass-arrow">N</div>
      </div>

      <div className="export-credit">
        <Satellite size={14} />
        <span>Généré par Atmosphère 3D · Source: ECMWF/CAMS/EUMETSAT</span>
      </div>

      {/* Legend inside Overlay to be captured */}
      <Legend activeLayer={activeLayer} />
    </div>
  );
};

function App() {
  const [layers, setLayers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [activeLayer, setActiveLayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [splashDone, setSplashDone] = useState(false);
  const [opacity, setOpacity] = useState(0.7);

  const [autoRotate, setAutoRotate] = useState(false);
  const [timeOffset, setTimeOffset] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showDjiboutiDashboard, setShowDjiboutiDashboard] = useState(false);
  const [showHotspots, setShowHotspots] = useState(false);

  // Capture State
  const [isCapturing, setIsCapturing] = useState(false);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const mapRef = useRef(null);
  const playInterval = useRef(null);

  // Splash screen timing
  useEffect(() => {
    const timer = setTimeout(() => setSplashDone(true), 3200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [layerData, categoryData] = await Promise.all([
          getLayers(), getCategories()
        ]);
        setLayers(layerData);
        setCategories(categoryData);
        if (categoryData.length > 0) {
          setActiveCategoryId(categoryData[0].id);
          const first = layerData.find(l => l.category === categoryData[0].id);
          if (first) setActiveLayer(first);
        }
      } catch (err) {
        console.error("Error loading data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCategoryChange = (catId) => {
    setActiveCategoryId(catId);
    const first = layers.find(l => l.category === catId);
    if (first) setActiveLayer(first);
  };

  useEffect(() => {
    if (isPlaying) {
      playInterval.current = setInterval(() => {
        setTimeOffset(prev => {
          const inc = activeCategoryId === 'weather_nrt' ? 1 : 3;
          const next = prev + inc;
          return next > 48 ? -24 : next;
        });
      }, 2000);
    } else {
      clearInterval(playInterval.current);
    }
    return () => clearInterval(playInterval.current);
  }, [isPlaying]);

  const handleHotspot = (spot) => {
    if (mapRef.current) {
      mapRef.current.goToLocation(spot.lat, spot.lon);
      setAutoRotate(false);
    }
  };

  const formatDisplayTime = (offset) => {
    const d = new Date();
    d.setHours(d.getHours() + offset);
    return d.toLocaleString('fr-FR', {
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
    });
  };

  const currentTimeISO = () => {
    const d = new Date();
    const service = activeLayer?.service;
    if (timeOffset === 0) {
      if (service === 'eumetsat') {
        d.setMinutes(d.getMinutes() - 60);
        d.setMinutes(Math.floor(d.getMinutes() / 15) * 15, 0, 0);
      } else {
        d.setHours(Math.floor(d.getHours() / 3) * 3, 0, 0, 0);
      }
    } else {
      const total = d.getHours() + timeOffset;
      d.setHours(Math.floor(total / 3) * 3, 0, 0, 0);
    }
    return d.toISOString().split('.')[0] + 'Z';
  };

  const handleCapture = async () => {
    // 1. Enter Capture Mode
    setIsCapturing(true);

    // Wait for render to apply classes and show overlay
    setTimeout(async () => {
      try {
        // A. Capture the WebGL Map Canvas (WorldWind)
        // We use the method we just added to WorldWindMap
        const mapDataUrl = mapRef.current ? mapRef.current.getCanvasDataURL() : null;

        // B. Capture the UI Overlay (Headers, Legend, Credits)
        // We capture ONLY the export overlay, ensuring background is transparent
        const overlayElement = document.querySelector('.map-export-overlay');
        const overlayCanvas = await html2canvas(overlayElement, {
          backgroundColor: null, // Transparent
          logging: false,
          scale: 2, // High resolution
          useCORS: true, // REQUIRED for external legend images
          allowTaint: true
        });

        // C. Composite them onto a final canvas
        const finalCanvas = document.createElement('canvas');
        finalCanvas.width = overlayCanvas.width;
        finalCanvas.height = overlayCanvas.height;
        const ctx = finalCanvas.getContext('2d');

        // Fill Background (Deep Space Blue) - prevents transparency issues
        ctx.fillStyle = '#020617';
        ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);

        // Draw Map Background (fit to canvas)
        if (mapDataUrl) {
          const mapImage = new Image();
          mapImage.src = mapDataUrl;
          // Wait for image to load
          await new Promise((resolve, reject) => {
            mapImage.onload = resolve;
            mapImage.onerror = reject;
          });

          // Draw map image covering the full canvas
          ctx.drawImage(mapImage, 0, 0, finalCanvas.width, finalCanvas.height);
        }

        // Draw UI Overlay on top
        ctx.drawImage(overlayCanvas, 0, 0);

        // D. Download
        const image = finalCanvas.toDataURL("image/png");
        const link = document.createElement('a');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        link.href = image;
        link.download = `djibouti-map-export-${timestamp}.png`;
        link.click();

      } catch (err) {
        console.error("Capture failed:", err);
      } finally {
        // 2. Exit Capture Mode
        setIsCapturing(false);
      }
    }, 200); // Increased timeout slightly to ensure render
  };

  const liveTime = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  // ── CINEMATIC SPLASH SCREEN ──
  if (!splashDone) {
    return (
      <div className="splash-screen">
        <div className="splash-content">
          <div className="splash-globe-icon">
            <Globe size={64} strokeWidth={1} />
            <div className="splash-ring"></div>
            <div className="splash-ring ring-2"></div>
          </div>
          <h1 className="splash-title">ATMOSPHÈRE 3D</h1>
          <p className="splash-subtitle">SYSTÈME DE SURVEILLANCE ENVIRONNEMENTALE PLANÉTAIRE</p>
          <div className="splash-loader-bar">
            <div className="splash-loader-fill"></div>
          </div>
          <div className="splash-stats">
            <span><Satellite size={12} /> ECMWF</span>
            <span><Radio size={12} /> EUMETSAT</span>
            <span><Globe size={12} /> CAMS GLOBAL</span>
          </div>
          <p className="splash-credit">© Moustapha Farah · République de Djibouti</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`app-container ${isCapturing ? 'mode-export' : ''}`}>
      {/* Cinematic Overlays */}
      <div className="hud-scanner hide-on-capture"></div>
      <div className="hud-corners hide-on-capture"></div>

      {/* Export Overlay (Visible only during capture) */}
      <MapExportOverlay activeLayer={activeLayer} isCapturing={isCapturing} />

      {loading && (
        <div className="loading-overlay">
          <div className="loader"></div>
          <p className="loading-text">ACQUIRING SATELLITE DATA</p>
        </div>
      )}

      <WorldWindMap
        ref={mapRef}
        activeLayer={activeLayer}
        opacity={opacity}
        autoRotate={autoRotate}
        time={currentTimeISO()}
      />

      <div className={`ui-layer ${isCapturing ? 'capturing' : ''}`}>

        {/* Left Column: Docked Panels */}
        <div className={`left-column ${isCapturing ? 'hide-on-capture' : ''}`}>
          <LayerControl
            categories={categories}
            activeCategoryId={activeCategoryId}
            onCategoryChange={handleCategoryChange}
            layers={layers}
            activeLayerId={activeLayer?.id}
            onLayerSelect={setActiveLayer}
            opacity={opacity}
            onOpacityChange={setOpacity}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          />
          <Legend activeLayer={activeLayer} />
        </div>

        {/* Time Controller */}
        <div className={`time-controller ${isCapturing ? 'hide-on-capture' : ''}`}>
          <div className="time-info">
            <Clock size={14} />
            <span className="current-time">{formatDisplayTime(timeOffset)}</span>
            <span className={`time-status ${timeOffset === 0 ? 'live' : timeOffset > 0 ? 'forecast' : 'archive'}`}>
              {timeOffset === 0 ? "● LIVE" : timeOffset > 0 ? "▶ PRÉVISION" : "◀ ARCHIVE"}
            </span>
          </div>
          <div className="time-controls">
            <button className="play-btn" onClick={() => setIsPlaying(!isPlaying)}>
              {isPlaying ? <Pause size={18} /> : <Play size={18} />}
            </button>
            <input
              type="range" min="-48" max="48"
              step={activeCategoryId === 'weather_nrt' ? 1 : 3}
              value={timeOffset}
              onChange={(e) => { setTimeOffset(parseInt(e.target.value)); setIsPlaying(false); }}
              className="time-slider"
            />
          </div>
        </div>

        {/* Right: Quick Controls */}
        <div className={`quick-controls ${isCapturing ? 'hide-on-capture' : ''}`}>
          <button className="hud-btn" onClick={handleCapture} title="Capturer la carte">
            <Camera size={16} />
            <span>Capture</span>
          </button>


          <button className={`hud-btn ${autoRotate ? 'active' : ''}`} onClick={() => setAutoRotate(!autoRotate)}>
            <RotateCw size={16} className={autoRotate ? 'spin' : ''} />
            <span>Rotation</span>
          </button>

          <button
            className={`hud-btn djibouti-toggle ${showDjiboutiDashboard ? 'active' : ''}`}
            onClick={() => {
              setShowDjiboutiDashboard(!showDjiboutiDashboard);
              if (!showDjiboutiDashboard && mapRef.current) {
                mapRef.current.goToLocation(11.5884, 43.1456, 800000);
                setAutoRotate(false);
              }
            }}
          >
            <span className="dj-btn-flag">🇩🇯</span>
            <span>Djibouti</span>
          </button>

          <button className={`hud-btn ${showHotspots ? 'active' : ''}`} onClick={() => setShowHotspots(!showHotspots)}>
            <MapPin size={16} />
            <span>Hotspots</span>
            <ChevronRight size={14} style={{ transform: showHotspots ? 'rotate(90deg)' : 'none', transition: '0.2s' }} />
          </button>

          {showHotspots && (
            <div className="hotspots-panel">
              <div className="hotspots-list">
                {HOTSPOTS.map(spot => (
                  <button key={spot.name} onClick={() => handleHotspot(spot)}>
                    {spot.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Djibouti Dashboard - Keep visible if open, might want to hide close button in CSS */}
        <DjiboutiDashboard
          isOpen={showDjiboutiDashboard}
          onClose={() => setShowDjiboutiDashboard(false)}
          onNavigate={(lat, lon) => {
            if (mapRef.current) {
              mapRef.current.goToLocation(lat, lon, 300000);
              setAutoRotate(false);
            }
          }}
        />
      </div>

      {/* Status Bar */}
      <div className={`status-bar ${isCapturing ? 'hide-on-capture' : ''}`}>
        <div className="status-item live-indicator">
          <span className="pulse-dot"></span>
          <Zap size={12} />
          <span>FLUX EN DIRECT</span>
        </div>
        <div className="status-item">
          <Clock size={12} />
          <span>{liveTime}</span>
        </div>
        <div className="status-item">
          <Satellite size={12} />
          <span>{activeLayer?.service === 'eumetsat' ? 'EUMETSAT MTG' : 'ECMWF CAMS'}</span>
        </div>
        <div className="status-item">
          <Wind size={12} />
          <span>{activeLayer?.name || '—'}</span>
        </div>
        <div className="footer-credit" style={{ display: 'flex', alignItems: 'center' }}>
          <span>© Moustapha Farah · Atmosphère 3D · Djibouti</span>
          <div className="social-links">
            <a href="https://www.linkedin.com/in/moustapha-farah-guelleh/" target="_blank" rel="noopener noreferrer" className="social-link" title="LinkedIn">
              <Linkedin size={13} />
            </a>
            <a href="https://x.com/CartoDjib" target="_blank" rel="noopener noreferrer" className="social-link" title="Djib-Carto sur X">
              <Twitter size={13} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
