# AirQualityMap

Application web de visualisation de la qualité de l’air en temps quasi réel (Données ECMWF/CAMS).

## Architecture

- **Backend** : FastAPI (Python) - Sert la configuration des calques WMS.
- **Frontend** : Vite + React + Leaflet - Interface cartographique moderne.

## Prérequis

- Node.js (v18+)
- Python (v3.9+)

## Installation et Démarrage

### 1. Backend

Ouvrez un terminal dans le dossier `AirQualityMap/backend` :

```bash
# Installation des dépendances
pip install -r requirements.txt

# Démarrage du serveur
python main.py
```

Le serveur backend sera accessible sur `http://localhost:8000`.

### 2. Frontend

Ouvrez un nouveau terminal dans le dossier `AirQualityMap/frontend` :

```bash
# Installation (si pas déjà fait)
npm install

# Démarrage
npm run dev
```

L'application sera accessible sur l'URL indiquée (généralement `http://localhost:5173`).

## Fonctionnalités

- Carte sombre interactive.
- Sélecteur de polluants (PM2.5, CO2, SO2, CH4, CO, NO2, AOD, O3).
- Affichage dynamique des légendes.
- Design responsive et moderne.

## Crédits

Données atmosphériques fournies par CAMS / ECMWF.
