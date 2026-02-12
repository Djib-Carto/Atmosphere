LAYERS = [
    {
        "id": "pm2p5",
        "name": "PM2.5",
        "label": "PM2.5 (µg/m³)",
        "layer": "composition_pm2p5",
        "style": "sh_all_pm2p5_defra_daqi",
        "legend_url": "https://eccharts.ecmwf.int/wms/?token=public&request=GetLegend&layers=composition_pm2p5&styles=sh_all_pm2p5_defra_daqi&width=350&height=50",
        "description": "Particules fines < 2.5 µm"
    },
    {
        "id": "co2",
        "name": "CO₂",
        "label": "Dioxyde de carbone (CO₂, ppmv)",
        "layer": "composition_co2_surface",
        "style": "sh_nipy_spectral_co2_surface",
        "legend_url": "https://eccharts.ecmwf.int/wms/?token=public&request=GetLegend&layers=composition_co2_surface&styles=sh_nipy_spectral_co2_surface&width=350&height=50",
        "description": "Concentration en surface"
    },
    {
        "id": "so2",
        "name": "SO₂",
        "label": "Dioxyde de soufre (SO₂, ppbv)",
        "layer": "composition_so2_surface",
        "style": "sh_all_so2_surface",
        "legend_url": "https://eccharts.ecmwf.int/wms/?token=public&request=GetLegend&layers=composition_so2_surface&styles=sh_all_so2_surface&width=350&height=50",
        "description": "Dioxyde de soufre en surface"
    },
    {
        "id": "ch4",
        "name": "CH₄",
        "label": "Méthane (CH₄, ppbv)",
        "layer": "composition_ch4_surface",
        "style": "sh_Oranges1_ch4_surface",
        "legend_url": "https://eccharts.ecmwf.int/wms/?token=public&request=GetLegend&layers=composition_ch4_surface&styles=sh_Oranges1_ch4_surface&width=350&height=50",
        "description": "Méthane en surface"
    },
    {
        "id": "co",
        "name": "CO",
        "label": "Monoxyde de carbone (CO, ppbv)",
        "layer": "composition_co_surface",
        "style": "sh_YlGnBu_co_upper",
        "legend_url": "https://eccharts.ecmwf.int/wms/?token=public&request=GetLegend&layers=composition_co_surface&styles=sh_YlGnBu_co_upper&width=350&height=50",
        "description": "Monoxyde de carbone en surface"
    },
    {
        "id": "no2",
        "name": "NO₂",
        "label": "Dioxyde d’azote (NO₂, ppbv)",
        "layer": "composition_no2_surface",
        "style": "sh_all_no2_surface",
        "legend_url": "https://eccharts.ecmwf.int/wms/?token=public&request=GetLegend&layers=composition_no2_surface&styles=sh_all_no2_surface&width=350&height=50",
        "description": "Dioxyde d’azote en surface"
    },
    {
        "id": "aod",
        "name": "AOD",
        "label": "Aérosols (AOD 550 nm)",
        "layer": "composition_aod550",
        "style": "sh_BuYlRd_aod",
        "legend_url": "https://eccharts.ecmwf.int/wms/?token=public&request=GetLegend&layers=composition_aod550&styles=sh_BuYlRd_aod&width=350&height=50",
        "description": "Profondeur optique des aérosols"
    },
    {
        "id": "o3",
        "name": "O₃",
        "label": "Ozone (O₃, ppbv)",
        "layer": "composition_o3_850hpa",
        "style": "sh_all_o3_850hpa",
        "legend_url": "https://eccharts.ecmwf.int/wms/?token=public&request=GetLegend&layers=composition_o3_850hpa&styles=sh_all_o3_850hpa&width=350&height=50",
        "description": "Ozone à 850 hPa"
    }
]
