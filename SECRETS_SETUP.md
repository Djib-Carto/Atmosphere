# 🔐 Configuration des Secrets GitHub

Une fois le code poussé sur GitHub, vous devez configurer les secrets pour que l'application fonctionne.

## 📍 Où Configurer les Secrets

1. Allez sur votre dépôt : `https://github.com/Djib-Carto/Atmosphere`
2. Cliquez sur **Settings** (⚙️ en haut)
3. Dans le menu de gauche : **Secrets and variables** > **Actions**
4. Cliquez sur **New repository secret**

## 🔑 Secrets à Ajouter

Ajoutez ces 5 secrets un par un :

### 1. VITE_API_URL
**Nom** : `VITE_API_URL`  
**Valeur** : URL de votre Google Apps Script (voir section Google Apps Script ci-dessous)  
**Exemple** : `https://script.google.com/macros/s/AKfycbx.../exec`

### 2. GOOGLE_SHEET_ID
**Nom** : `GOOGLE_SHEET_ID`  
**Valeur** : L'ID de votre Google Sheet
**Comment l'obtenir** : 
- Ouvrez votre Google Sheet
- L'URL ressemble à : `https://docs.google.com/spreadsheets/d/1abc...xyz/edit`
- L'ID est la partie entre `/d/` et `/edit` : `1abc...xyz`

### 3. GOOGLE_CREDENTIALS
**Nom** : `GOOGLE_CREDENTIALS`  
**Valeur** : TOUT le contenu du fichier `backend/credentials.json`

**Comment l'obtenir** :
```powershell
# Ouvrez PowerShell dans le dossier du projet et exécutez :
Get-Content backend/credentials.json -Raw | Set-Clipboard
```
Puis collez (Ctrl+V) dans la zone de valeur du secret.

---

## 📱 Déployer le Google Apps Script

Pour que les inscriptions fonctionnent, vous devez déployer un petit script dans votre Google Sheet :

### Étape 1 : Ouvrir l'Éditeur
1. Ouvrez votre Google Sheet (celui pour les emails)
2. Menu **Extensions** > **Apps Script**

### Étape 2 : Copier le Code
1. Supprimez tout le code existant dans l'éditeur
2. Ouvrez le fichier `Code.gs` de votre projet
3. Copiez TOUT le contenu (Ctrl+A puis Ctrl+C)
4. Collez-le dans l'éditeur Apps Script (Ctrl+V)

### Étape 3 : Enregistrer et Tester
1. Cliquez sur l'icône **💾 Enregistrer** (ou Ctrl+S)
2. En haut, sélectionnez la fonction `setup` dans le menu déroulant
3. Cliquez sur **▶️ Exécuter**
4. Si demandé, autorisez l'accès

### Étape 4 : Déployer
1. Cliquez sur **🚀 Déployer** > **Nouveau déploiement**
2. Cliquez sur l'icône ⚙️ à côté de "Sélectionner un type"
3. Choisissez **Application Web**
4. Paramètres :
   - **Exécuter en tant que** : Moi
   - **Qui a accès** : Tout le monde
5. Cliquez sur **Déployer**
6. **COPIEZ L'URL** qui s'affiche (elle commence par `https://script.google.com/macros/s/...`)

### Étape 5 : Ajouter l'URL aux Secrets
Retournez sur GitHub et ajoutez cette URL comme secret `VITE_API_URL` (voir secret #1 ci-dessus).

---

## ✅ Vérification

Une fois TOUS les secrets configurés :

1. Allez dans l'onglet **Actions** de votre dépôt GitHub
2. Vous devriez voir le workflow "Deploy to GitHub Pages" se lancer automatiquement
3. Attendez qu'il soit vert ✅ (environ 1-2 minutes)
4. Votre site sera accessible à : `https://djib-carto.github.io/Atmosphere/`

---

## ❓ Problèmes Courants

**Le workflow échoue ?**
- Vérifiez que TOUS les 5 secrets sont bien configurés
- Vérifiez qu'il n'y a pas d'espace avant/après les valeurs
- Vérifiez que `GOOGLE_CREDENTIALS` contient tout le fichier JSON (avec `{` et `}`)

**Le site est vide ou erreur 404 ?**
- Allez dans **Settings** > **Pages**
- Vérifiez que la source est bien **GitHub Actions**
- Attendez 2-3 minutes après le premier déploiement

**Les inscriptions ne fonctionnent pas ?**
- Vérifiez que le Google Apps Script est bien déployé
- Vérifiez que `VITE_API_URL` correspond exactement à l'URL du script
- Ouvrez la console du navigateur (F12) pour voir les erreurs
