#!/bin/bash
# Script de déploiement automatique pour Atmosphere
# Ce script configure Git et pousse le code vers GitHub

echo "🚀 Déploiement de Atmosphere vers GitHub..."

# Étape 1 : Supprimer l'ancien remote s'il existe
git remote remove origin 2>/dev/null || true

# Étape 2 : Ajouter le nouveau remote
# IMPORTANT : Remplacez 'Djib-Carto' par votre nom d'utilisateur GitHub si différent
git remote add origin https://github.com/Djib-Carto/Atmosphere.git

# Étape 3 : Vérifier la branche
git branch -M main

# Étape 4 : Pousser vers GitHub
echo "📤 Envoi du code vers GitHub..."
git push -u origin main --force

echo "✅ Déploiement terminé !"
echo "🌐 Allez maintenant sur https://github.com/Djib-Carto/Atmosphere"
echo "📋 Suivez le fichier SECRETS_SETUP.md pour configurer les secrets"
