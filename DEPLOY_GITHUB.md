# 🚀 Guide de Déploiement GitHub Pages - Atmosphère

Votre dépôt GitHub `Djib-Carto.github.io` contient déjà un projet (Planete). Vous avez **deux options** :

## Option 1 : Créer un Nouveau Dépôt (Recommandé) ✅

Créez un nouveau dépôt spécifiquement pour Atmosphère :

### Étape 1 : Créer le dépôt sur GitHub
1. Allez sur https://github.com/new
2. Nom du dépôt : `Atmosphere` (ou `AirQualityMap`)
3. Visibilité : **Private** ✅ (le code restera privé, seul le site sera public)
4. Ne cochez RIEN d'autre (pas de README, pas de .gitignore)
5. Cliquez sur **Create repository**

> [!NOTE]
> **Dépôt Privé + Site Public** : GitHub Pages fonctionne avec des dépôts privés ! Votre code source restera privé, mais le site compilé sera accessible publiquement à l'URL GitHub Pages.

### Étape 2 : Pousser le code
```bash
cd c:\Users\moust\.gemini\antigravity\scratch\AirQualityMap
git remote remove origin
git remote add origin https://github.com/Djib-Carto/Atmosphere.git
git push -u origin main
```

### Étape 3 : Activer GitHub Pages
1. Allez dans **Settings** > **Pages**
2. Source : **GitHub Actions**
3. Le workflow `.github/workflows/deploy.yml` se déclenchera automatiquement

### Étape 4 : Configurer les Secrets
Allez dans **Settings** > **Secrets and variables** > **Actions** > **New repository secret**

Ajoutez ces secrets :

| Secret | Valeur | Comment l'obtenir |
|--------|--------|-------------------|
| `VITE_API_URL` | URL Google Apps Script | Voir ci-dessous "Déployer Google Apps Script" |
| `GOOGLE_SHEET_ID` | ID de votre Google Sheet | Dans l'URL du Sheet |
| `GOOGLE_CREDENTIALS` | Contenu de `backend/credentials.json` | Copiez tout le fichier |
| `SMTP_USER` | Votre email Gmail | Ex: `votre.email@gmail.com` |
| `SMTP_PASSWORD` | Mot de passe d'application Gmail | Voir https://myaccount.google.com/apppasswords |

**Votre site sera accessible à :** `https://djib-carto.github.io/Atmosphere/`

---

## Option 2 : Déployer dans le Dépôt Existant

Si vous voulez garder Planete ET Atmosphere dans le même dépôt :

### Étape 1 : Créer un dossier Atmosphere
```bash
cd c:\Users\moust\.gemini\antigravity\scratch\AirQualityMap
git remote remove origin
git clone https://github.com/Djib-Carto/Djib-Carto.github.io.git temp_repo
cd temp_repo
mkdir Atmosphere
```

### Étape 2 : Copier les fichiers
```bash
# Copiez tout le contenu de AirQualityMap dans temp_repo/Atmosphere/
# Puis :
git add Atmosphere/
git commit -m "Add Atmosphere application"
git push origin main
```

### Étape 3 : Modifier le workflow
Le fichier `.github/workflows/deploy.yml` devra être ajusté pour le nouveau chemin.

**Votre site sera accessible à :** `https://djib-carto.github.io/Atmosphere/`

---

## 📋 Déployer Google Apps Script

Avant que les inscriptions fonctionnent, vous devez déployer le script Google :

1. Ouvrez votre Google Sheet (celui pour les emails)
2. **Extensions** > **Apps Script**
3. Supprimez le code existant
4. Copiez TOUT le contenu du fichier `Code.gs`
5. Collez-le dans l'éditeur
6. **Fichier** > **Enregistrer** (ou Ctrl+S)
7. Cliquez sur **Exécuter** > Sélectionnez `setup` > Cliquez sur ▶️
8. Autorisez l'accès si demandé
9. Cliquez sur **Déployer** > **Nouveau déploiement**
10. Type : **Application Web**
11. Paramètres :
    - Exécuter en tant que : **Moi**
    - Qui a accès : **Tout le monde**
12. Cliquez sur **Déployer**
13. **COPIEZ L'URL** qui s'affiche (elle ressemble à `https://script.google.com/macros/s/...`)
14. Utilisez cette URL comme valeur pour le secret `VITE_API_URL`

---

## ✅ Vérification du Déploiement

1. Allez dans l'onglet **Actions** de votre dépôt GitHub
2. Vous devriez voir le workflow "Deploy to GitHub Pages" en cours
3. Attendez qu'il soit ✅ (environ 1-2 minutes)
4. Visitez votre site : `https://djib-carto.github.io/Atmosphere/`

---

## 🧪 Tester l'Application

1. **Subscription** : Entrez un email dans le modal → Vérifiez qu'il apparaît dans votre Google Sheet
2. **Dashboard Djibouti** : Cliquez sur le bouton 🇩🇯 → Vérifiez les données météo
3. **Couches** : Testez différentes couches (PM2.5, NO₂, etc.)
4. **Capture** : Testez le bouton 📷 pour capturer une image

---

## ❓ Quelle Option Choisir ?

- **Option 1** (Nouveau dépôt) : Plus simple, plus propre, recommandé ✅
- **Option 2** (Même dépôt) : Si vous voulez tout centraliser

**Je recommande l'Option 1** pour éviter les conflits et garder les projets séparés.
