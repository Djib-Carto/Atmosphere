import React, { useEffect, useState } from 'react';
import {
    Sun, Wind, Droplets, Thermometer, Activity, X, ChevronDown, ChevronUp,
    AlertTriangle, Eye, Waves, Navigation, Shield, TrendingUp, Anchor
} from 'lucide-react';

const DJIBOUTI_LAT = 11.5884;
const DJIBOUTI_LON = 43.1456;

const WEATHER_CODES = {
    0: { label: "Ciel dégagé", icon: "☀️" },
    1: { label: "Peu nuageux", icon: "🌤️" },
    2: { label: "Partiellement nuageux", icon: "⛅" },
    3: { label: "Couvert", icon: "☁️" },
    45: { label: "Brouillard", icon: "🌫️" },
    48: { label: "Brouillard givrant", icon: "🌫️" },
    51: { label: "Bruine légère", icon: "🌦️" },
    53: { label: "Bruine modérée", icon: "🌦️" },
    55: { label: "Bruine dense", icon: "🌧️" },
    61: { label: "Pluie légère", icon: "🌧️" },
    63: { label: "Pluie modérée", icon: "🌧️" },
    65: { label: "Pluie forte", icon: "⛈️" },
    80: { label: "Averses", icon: "🌦️" },
    95: { label: "Orage", icon: "⛈️" },
};

const getAQIColor = (aqi) => {
    if (aqi <= 50) return { color: '#10b981', label: 'Bon', bg: 'rgba(16,185,129,0.15)' };
    if (aqi <= 100) return { color: '#f59e0b', label: 'Modéré', bg: 'rgba(245,158,11,0.15)' };
    if (aqi <= 150) return { color: '#f97316', label: 'Sensible', bg: 'rgba(249,115,22,0.15)' };
    if (aqi <= 200) return { color: '#ef4444', label: 'Mauvais', bg: 'rgba(239,68,68,0.15)' };
    return { color: '#7c3aed', label: 'Dangereux', bg: 'rgba(124,58,237,0.15)' };
};

const getUVLevel = (uv) => {
    if (uv <= 2) return { label: 'Faible', color: '#10b981' };
    if (uv <= 5) return { label: 'Modéré', color: '#f59e0b' };
    if (uv <= 7) return { label: 'Fort', color: '#f97316' };
    if (uv <= 10) return { label: 'Très fort', color: '#ef4444' };
    return { label: 'Extrême', color: '#7c3aed' };
};

const getWindDir = (deg) => {
    const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];
    return dirs[Math.round(deg / 45) % 8];
};

const getDustAlert = (pm10, windSpeed) => {
    if (pm10 > 200 && windSpeed > 40) return { level: 'CRITIQUE', color: '#ef4444', text: 'Tempête de sable active' };
    if (pm10 > 100 && windSpeed > 25) return { level: 'ÉLEVÉ', color: '#f97316', text: 'Brume de sable dense' };
    if (pm10 > 50) return { level: 'MODÉRÉ', color: '#f59e0b', text: 'Poussière en suspension' };
    return { level: 'NORMAL', color: '#10b981', text: 'Conditions claires' };
};

// Mini SVG bar chart component
const MiniBarChart = ({ data, color = '#38bdf8', height = 60 }) => {
    if (!data || data.length === 0) return null;
    const max = Math.max(...data.map(d => d.value), 1);
    const barW = 100 / data.length;
    return (
        <div className="mini-chart" style={{ height }}>
            <svg width="100%" height="100%" viewBox={`0 0 100 ${height}`} preserveAspectRatio="none">
                {data.map((d, i) => {
                    const h = (d.value / max) * (height - 6);
                    return (
                        <rect key={i} x={i * barW + barW * 0.1} y={height - h}
                            width={barW * 0.8} height={h} rx="1"
                            fill={d.highlight ? '#f59e0b' : color} opacity={d.highlight ? 1 : 0.5}>
                            <title>{d.label}: {d.value.toFixed(1)}</title>
                        </rect>
                    );
                })}
            </svg>
        </div>
    );
};

const DjiboutiDashboard = ({ isOpen, onClose, onNavigate }) => {
    const [weather, setWeather] = useState(null);
    const [airQuality, setAirQuality] = useState(null);
    const [marine, setMarine] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expanded, setExpanded] = useState({ forecast: false, aqi: true, chart: true, marine: true, dust: true });

    useEffect(() => {
        if (!isOpen) return;
        const fetchAll = async () => {
            setLoading(true);
            setError(null);
            try {
                const [wRes, aqRes, mRes] = await Promise.all([
                    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${DJIBOUTI_LAT}&longitude=${DJIBOUTI_LON}&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,wind_direction_10m,wind_gusts_10m,uv_index,weather_code,surface_pressure&daily=weather_code,temperature_2m_max,temperature_2m_min,uv_index_max,wind_speed_10m_max,precipitation_sum&hourly=temperature_2m,uv_index&timezone=Africa%2FDjibouti&forecast_days=7`),
                    fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${DJIBOUTI_LAT}&longitude=${DJIBOUTI_LON}&current=pm2_5,pm10,nitrogen_dioxide,sulphur_dioxide,ozone,carbon_monoxide,us_aqi,dust&hourly=pm2_5,pm10,us_aqi,dust&timezone=Africa%2FDjibouti&forecast_days=2`),
                    fetch(`https://marine-api.open-meteo.com/v1/marine?latitude=${DJIBOUTI_LAT}&longitude=${DJIBOUTI_LON}&current=wave_height,wave_direction,wave_period,ocean_current_velocity,ocean_current_direction,swell_wave_height&daily=wave_height_max,wave_direction_dominant&timezone=Africa%2FDjibouti&forecast_days=3`)
                ]);
                if (!wRes.ok || !aqRes.ok) throw new Error("Erreur réseau");
                setWeather(await wRes.json());
                setAirQuality(await aqRes.json());
                if (mRes.ok) setMarine(await mRes.json());
            } catch (e) {
                setError("Connexion échouée. Réessayez.");
                console.error("[DJ]", e);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
        const iv = setInterval(fetchAll, 10 * 60 * 1000);
        return () => clearInterval(iv);
    }, [isOpen]);

    if (!isOpen) return null;

    const toggle = (k) => setExpanded(p => ({ ...p, [k]: !p[k] }));
    const cur = weather?.current;
    const daily = weather?.daily;
    const wc = WEATHER_CODES[cur?.weather_code] || { label: "N/A", icon: "❓" };
    const curAQI = airQuality?.current;
    const aqiInfo = curAQI ? getAQIColor(curAQI.us_aqi) : null;
    const uvInfo = cur ? getUVLevel(cur.uv_index) : null;
    const dustAlert = curAQI && cur ? getDustAlert(curAQI.pm10, cur.wind_speed_10m) : null;
    const curMarine = marine?.current;

    const hourlyPM = airQuality?.hourly?.pm2_5?.slice(0, 24).map((v, i) => ({
        value: v || 0, label: `${i}h`, highlight: i === new Date().getHours()
    })) || [];

    const hourlyDust = airQuality?.hourly?.dust?.slice(0, 24).map((v, i) => ({
        value: v || 0, label: `${i}h`, highlight: i === new Date().getHours()
    })) || [];

    const forecastDays = daily ? daily.time.map((d, i) => ({
        date: new Date(d).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' }),
        max: daily.temperature_2m_max[i], min: daily.temperature_2m_min[i],
        code: WEATHER_CODES[daily.weather_code[i]] || { icon: "❓" },
        uv: daily.uv_index_max[i], wind: daily.wind_speed_10m_max[i],
        rain: daily.precipitation_sum[i]
    })) : [];

    return (
        <div className="djibouti-dashboard">
            {/* ── HEADER ── */}
            <div className="dj-header">
                <div className="dj-header-left">
                    <span className="dj-flag">🇩🇯</span>
                    <div>
                        <h2 className="dj-title">République de Djibouti</h2>
                        <span className="dj-subtitle">Station Environnementale Nationale</span>
                    </div>
                </div>
                <div className="dj-header-actions">
                    <button className="dj-nav-btn" onClick={() => onNavigate?.(DJIBOUTI_LAT, DJIBOUTI_LON)} title="Centrer"><Eye size={14} /></button>
                    <button className="dj-close-btn" onClick={onClose} title="Fermer"><X size={16} /></button>
                </div>
            </div>

            {loading && (
                <div className="dj-loading"><div className="dj-loader"></div><p>Acquisition satellitaire...</p></div>
            )}
            {error && (
                <div className="dj-error"><AlertTriangle size={18} /><p>{error}</p></div>
            )}

            {!loading && !error && cur && (
                <div className="dj-content">

                    {/* ── WEATHER HERO ── */}
                    <div className="dj-card dj-weather-hero">
                        <div className="dj-weather-main">
                            <span className="dj-weather-icon">{wc.icon}</span>
                            <div className="dj-temp-block">
                                <span className="dj-temp">{Math.round(cur.temperature_2m)}°</span>
                                <span className="dj-temp-unit">C</span>
                            </div>
                            <div className="dj-weather-meta">
                                <p className="dj-weather-label">{wc.label}</p>
                                <p className="dj-feels-like">Ressenti {Math.round(cur.apparent_temperature)}°C</p>
                            </div>
                        </div>
                        <div className="dj-weather-stats">
                            <div className="dj-stat">
                                <Wind size={14} />
                                <span>{Math.round(cur.wind_speed_10m)}</span>
                                <span className="dj-stat-label">km/h {getWindDir(cur.wind_direction_10m)}</span>
                            </div>
                            <div className="dj-stat">
                                <Droplets size={14} />
                                <span>{cur.relative_humidity_2m}%</span>
                                <span className="dj-stat-label">Humidité</span>
                            </div>
                            <div className="dj-stat">
                                <Sun size={14} style={{ color: uvInfo?.color }} />
                                <span style={{ color: uvInfo?.color }}>{cur.uv_index}</span>
                                <span className="dj-stat-label">UV {uvInfo?.label}</span>
                            </div>
                            <div className="dj-stat">
                                <Navigation size={14} />
                                <span>{Math.round(cur.wind_gusts_10m)}</span>
                                <span className="dj-stat-label">Rafales</span>
                            </div>
                        </div>
                    </div>

                    {/* ── DUST / SAND STORM ALERT ── */}
                    {dustAlert && (
                        <div className="dj-card">
                            <div className="dj-card-header" onClick={() => toggle('dust')}>
                                <span className="dj-card-title"><AlertTriangle size={14} style={{ color: dustAlert.color }} /> Alerte Poussière / Sable</span>
                                {expanded.dust ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </div>
                            {expanded.dust && (
                                <div className="dj-card-body">
                                    <div className="dj-alert-badge" style={{ background: dustAlert.color + '22', borderColor: dustAlert.color }}>
                                        <span className="dj-alert-level" style={{ color: dustAlert.color }}>{dustAlert.level}</span>
                                        <span className="dj-alert-text">{dustAlert.text}</span>
                                    </div>
                                    {hourlyDust.length > 0 && (
                                        <>
                                            <p className="dj-chart-label">Concentration poussière (µg/m³) — 24h</p>
                                            <MiniBarChart data={hourlyDust} color="#f59e0b" height={50} />
                                            <div className="dj-chart-legend"><span>0h</span><span>6h</span><span>12h</span><span>18h</span><span>23h</span></div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── AQI ── */}
                    {curAQI && aqiInfo && (
                        <div className="dj-card">
                            <div className="dj-card-header" onClick={() => toggle('aqi')}>
                                <span className="dj-card-title"><Shield size={14} /> Qualité de l'Air</span>
                                {expanded.aqi ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </div>
                            {expanded.aqi && (
                                <div className="dj-card-body">
                                    <div className="dj-aqi-hero" style={{ background: aqiInfo.bg }}>
                                        <span className="dj-aqi-value" style={{ color: aqiInfo.color }}>{curAQI.us_aqi}</span>
                                        <span className="dj-aqi-label" style={{ color: aqiInfo.color }}>{aqiInfo.label}</span>
                                        <span className="dj-aqi-scale">US AQI</span>
                                    </div>
                                    <div className="dj-pollutants-grid">
                                        {[
                                            { name: 'PM2.5', val: curAQI.pm2_5, unit: 'µg/m³' },
                                            { name: 'PM10', val: curAQI.pm10, unit: 'µg/m³' },
                                            { name: 'NO₂', val: curAQI.nitrogen_dioxide, unit: 'µg/m³' },
                                            { name: 'O₃', val: curAQI.ozone, unit: 'µg/m³' },
                                            { name: 'SO₂', val: curAQI.sulphur_dioxide, unit: 'µg/m³' },
                                            { name: 'CO', val: curAQI.carbon_monoxide, unit: 'µg/m³' },
                                        ].map(p => (
                                            <div key={p.name} className="dj-pollutant">
                                                <span className="dj-pol-name">{p.name}</span>
                                                <span className="dj-pol-val">{p.val?.toFixed(1) ?? '—'}</span>
                                                <span className="dj-pol-unit">{p.unit}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── PM2.5 24h ── */}
                    {hourlyPM.length > 0 && (
                        <div className="dj-card">
                            <div className="dj-card-header" onClick={() => toggle('chart')}>
                                <span className="dj-card-title"><TrendingUp size={14} /> PM2.5 — 24h</span>
                                {expanded.chart ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </div>
                            {expanded.chart && (
                                <div className="dj-card-body">
                                    <MiniBarChart data={hourlyPM} color="#38bdf8" height={55} />
                                    <div className="dj-chart-legend"><span>0h</span><span>6h</span><span>12h</span><span>18h</span><span>23h</span></div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── MARINE CONDITIONS ── */}
                    {curMarine && (
                        <div className="dj-card">
                            <div className="dj-card-header" onClick={() => toggle('marine')}>
                                <span className="dj-card-title"><Anchor size={14} /> Conditions Marines</span>
                                {expanded.marine ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </div>
                            {expanded.marine && (
                                <div className="dj-card-body">
                                    <div className="dj-marine-grid">
                                        <div className="dj-marine-stat">
                                            <Waves size={18} className="dj-marine-icon" />
                                            <span className="dj-marine-val">{curMarine.wave_height?.toFixed(1) ?? '—'} m</span>
                                            <span className="dj-marine-label">Hauteur</span>
                                        </div>
                                        <div className="dj-marine-stat">
                                            <Activity size={18} className="dj-marine-icon" />
                                            <span className="dj-marine-val">{curMarine.wave_period?.toFixed(1) ?? '—'} s</span>
                                            <span className="dj-marine-label">Période</span>
                                        </div>
                                        <div className="dj-marine-stat">
                                            <Navigation size={18} className="dj-marine-icon" style={{ transform: `rotate(${curMarine.wave_direction || 0}deg)` }} />
                                            <span className="dj-marine-val">{curMarine.wave_direction ? getWindDir(curMarine.wave_direction) : '—'}</span>
                                            <span className="dj-marine-label">Direction</span>
                                        </div>
                                        <div className="dj-marine-stat">
                                            <Waves size={18} className="dj-marine-icon" />
                                            <span className="dj-marine-val">{curMarine.swell_wave_height?.toFixed(1) ?? '—'} m</span>
                                            <span className="dj-marine-label">Houle</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── 7-DAY FORECAST ── */}
                    <div className="dj-card">
                        <div className="dj-card-header" onClick={() => toggle('forecast')}>
                            <span className="dj-card-title"><Thermometer size={14} /> Prévisions 7 jours</span>
                            {expanded.forecast ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </div>
                        {expanded.forecast && (
                            <div className="dj-card-body">
                                <div className="dj-forecast-list">
                                    {forecastDays.map((day, i) => (
                                        <div key={i} className={`dj-forecast-row ${i === 0 ? 'today' : ''}`}>
                                            <span className="dj-fc-day">{i === 0 ? "Auj." : day.date}</span>
                                            <span className="dj-fc-icon">{day.code.icon}</span>
                                            <div className="dj-fc-extras">
                                                {day.rain > 0 && <span className="dj-fc-rain">💧{day.rain.toFixed(1)}</span>}
                                                <span className="dj-fc-wind">💨{Math.round(day.wind)}</span>
                                            </div>
                                            <div className="dj-fc-temps">
                                                <span className="dj-fc-max">{Math.round(day.max)}°</span>
                                                <div className="dj-fc-bar">
                                                    <div className="dj-fc-bar-fill" style={{ width: `${Math.min(((day.max - day.min) / 15) * 100, 100)}%` }}></div>
                                                </div>
                                                <span className="dj-fc-min">{Math.round(day.min)}°</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="dj-footer">
                        <span>🛰️ Sources : Open-Meteo · ECMWF · NOAA · Rafraîchi auto. 10 min</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DjiboutiDashboard;
