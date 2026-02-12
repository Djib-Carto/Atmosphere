export const CATEGORIES = [
    { id: 'air_quality', name: 'Qualité de l\'Air', icon: 'Wind' },
    { id: 'weather_nrt', name: 'Météorologie NRT', icon: 'Zap' }
];

export const LAYERS = [
    // --- AIR QUALITY (ECMWF / CAMS) ---
    {
        "id": "pm2p5",
        "category": "air_quality",
        "name": "PM2.5",
        "label": "PM2.5 (µg/m³)",
        "layer": "composition_pm2p5",
        "style": "sh_all_pm2p5_defra_daqi",
        "service": "ecmwf",
        "legend_url": "https://eccharts.ecmwf.int/wms/?token=public&request=GetLegend&layers=composition_pm2p5&styles=sh_all_pm2p5_defra_daqi&width=350&height=50",
        "description": "Particules fines < 2.5 µm"
    },
    {
        "id": "pm10",
        "category": "air_quality",
        "name": "PM10",
        "label": "PM10 (µg/m³)",
        "layer": "composition_pm10",
        "style": "sh_all_pm10_defra_daqi",
        "service": "ecmwf",
        "legend_url": "https://eccharts.ecmwf.int/wms/?token=public&request=GetLegend&layers=composition_pm10&styles=sh_all_pm10_defra_daqi&width=350&height=50",
        "description": "Particules < 10 µm"
    },
    {
        "id": "no2",
        "category": "air_quality",
        "name": "NO₂",
        "label": "Dioxyde d’azote (NO₂, ppbv)",
        "layer": "composition_no2_surface",
        "style": "sh_all_no2_surface",
        "service": "ecmwf",
        "legend_url": "https://eccharts.ecmwf.int/wms/?token=public&request=GetLegend&layers=composition_no2_surface&styles=sh_all_no2_surface&width=350&height=50",
        "description": "Dioxyde d’azote en surface"
    },
    {
        "id": "so2",
        "category": "air_quality",
        "name": "SO₂",
        "label": "Dioxyde de soufre (SO₂, ppbv)",
        "layer": "composition_so2_surface",
        "style": "sh_all_so2_surface",
        "service": "ecmwf",
        "legend_url": "https://eccharts.ecmwf.int/wms/?token=public&request=GetLegend&layers=composition_so2_surface&styles=sh_all_so2_surface&width=350&height=50",
        "description": "Dioxyde de soufre en surface"
    },
    {
        "id": "co",
        "category": "air_quality",
        "name": "CO",
        "label": "Monoxyde de carbone (CO, ppbv)",
        "layer": "composition_co_surface",
        "style": "sh_YlGnBu_co_upper",
        "service": "ecmwf",
        "legend_url": "https://eccharts.ecmwf.int/wms/?token=public&request=GetLegend&layers=composition_co_surface&styles=sh_YlGnBu_co_upper&width=350&height=50",
        "description": "Monoxyde de carbone en surface"
    },
    {
        "id": "co2",
        "category": "air_quality",
        "name": "CO₂",
        "label": "Dioxyde de carbone (CO₂, ppmv)",
        "layer": "composition_co2_surface",
        "style": "sh_nipy_spectral_co2_surface",
        "service": "ecmwf",
        "legend_url": "https://eccharts.ecmwf.int/wms/?token=public&request=GetLegend&layers=composition_co2_surface&styles=sh_nipy_spectral_co2_surface&width=350&height=50",
        "description": "Concentration de CO2 en surface"
    },
    {
        "id": "ch4",
        "category": "air_quality",
        "name": "CH₄",
        "label": "Méthane (CH₄, ppbv)",
        "layer": "composition_ch4_surface",
        "style": "sh_Oranges1_ch4_surface",
        "service": "ecmwf",
        "legend_url": "https://eccharts.ecmwf.int/wms/?token=public&request=GetLegend&layers=composition_ch4_surface&styles=sh_Oranges1_ch4_surface&width=350&height=50",
        "description": "Méthane en surface"
    },
    {
        "id": "aod",
        "category": "air_quality",
        "name": "Aérosole (AOD)",
        "label": "Profondeur optique (AOD)",
        "layer": "composition_aod550",
        "style": "sh_BuYlRd_aod",
        "service": "ecmwf",
        "legend_url": "https://eccharts.ecmwf.int/wms/?token=public&request=GetLegend&layers=composition_aod550&styles=sh_BuYlRd_aod&width=350&height=50",
        "description": "Charge totale d'aérosols"
    },

    // --- METEOROLOGY NRT (EUMETSAT) ---
    {
        "id": "eum_geocolour",
        "category": "weather_nrt",
        "name": "Couleur Naturelle",
        "label": "MTG GeoColour",
        "layer": "mtg_fd:rgb_geocolour",
        "style": "raster",
        "service": "eumetsat",
        "legend_url": null,
        "description": "Vue satellite couleur naturelle (MTG)"
    },
    {
        "id": "eum_ir",
        "category": "weather_nrt",
        "name": "Infrarouge (IR)",
        "label": "Meteosat IR 10.8 µm",
        "layer": "msg_fes:ir108",
        "style": "raster",
        "service": "eumetsat",
        "legend_url": null,
        "description": "Température des sommets nuageux"
    },
    {
        "id": "eum_wv",
        "category": "weather_nrt",
        "name": "Vapeur d'eau",
        "label": "Meteosat WV 6.2 µm",
        "layer": "msg_fes:wv062",
        "style": "raster",
        "service": "eumetsat",
        "legend_url": null,
        "description": "Humidité de la haute atmosphère"
    },
    {
        "id": "eum_kindex",
        "category": "weather_nrt",
        "name": "Indice K",
        "label": "GII K-Index",
        "layer": "msg_iodc:gii_kindex",
        "style": "raster",
        "service": "eumetsat",
        "legend_url": "https://view.eumetsat.int/geoserver/wms?service=WMS&version=1.1.1&request=GetLegendGraphic&format=image/png&layer=msg_iodc:gii_kindex",
        "description": "Indice de stabilité atmosphérique"
    },
    {
        "id": "eum_cth",
        "category": "weather_nrt",
        "name": "Hauteur Nuages",
        "label": "Cloud Top Height",
        "layer": "msg_fes:cth",
        "style": "raster",
        "service": "eumetsat",
        "legend_url": "https://view.eumetsat.int/geoserver/wms?service=WMS&version=1.1.1&request=GetLegendGraphic&format=image/png&layer=msg_fes:cth",
        "description": "Altitude du sommet des nuages"
    },
    {
        "id": "eum_eview",
        "category": "weather_nrt",
        "name": "Vue Haute Res",
        "label": "E-View RGB (Europe)",
        "layer": "msg_fes:rgb_eview",
        "style": "raster",
        "service": "eumetsat",
        "legend_url": null,
        "description": "Combinaison HRV et Infrarouge"
    },
    {
        "id": "eum_tropical",
        "category": "weather_nrt",
        "name": "Masse d'air",
        "label": "Tropical Airmass",
        "layer": "msg_fes:rgb_tropicalairmass",
        "style": "raster",
        "service": "eumetsat",
        "legend_url": null,
        "description": "Analyse des masses d'air tropicales"
    }
];

export const SERVICE_URLS = {
    ecmwf: "https://eccharts.ecmwf.int/wms/?token=public",
    nasa_gibs: "https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi",
    eumetsat: "https://view.eumetsat.int/geoserver/wms"
};
