# Script de déploiement automatique pour Atmosphere (Windows)
# Ce script configure Git et pousse le code vers GitHub

Write-Host "🚀 Déploiement de Atmosphere vers GitHub..." -ForegroundColor Cyan

# Étape 1 : Supprimer l'ancien remote s'il existe
git remote remove origin 2>$null

# Étape 2 : Ajouter le nouveau remote
# IMPORTANT : Remplacez 'Djib-Carto' par votre nom d'utilisateur GitHub si différent
git remote add origin https://github.com/Djib-Carto/Atmosphere.git

# Étape 3 : Vérifier la branche
git branch -M main

# Étape 4 : Pousser vers GitHub
Write-Host "📤 Envoi du code vers GitHub..." -ForegroundColor Yellow
git push -u origin main --force

Write-Host "✅ Déploiement terminé !" -ForegroundColor Green
Write-Host "🌐 Allez maintenant sur https://github.com/Djib-Carto/Atmosphere" -ForegroundColor Cyan
Write-Host "📋 Suivez le fichier SECRETS_SETUP.md pour configurer les secrets" -ForegroundColor Cyan
