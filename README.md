# Quiz Platform (PT58) - Monorepo

Ce dépôt contient le code source du projet **Quiz Platform (PT58)**. 
Il s'agit d'un monorepo avec une séparation stricte entre une API Backend et un Client Frontend.

## Architecture

- **Backend** : API construite avec [Laravel 11](https://laravel.com/) (situé dans le dossier `/backend`). Gère la logique métier, la base de données et l'authentification via Laravel Sanctum (Tokens API).
- **Frontend** : Application Client (SPA) construite avec [React](https://react.dev/) et [Vite](https://vitejs.dev/) (situé dans le dossier `/frontend`). Gère l'interface utilisateur.

---

## Prérequis

- **PHP** (v8.2 ou supérieur) & **Composer**
- **Node.js** (v20 ou supérieur) & **npm** (ou pnpm/yarn)
- **SQLite** (Base de données utilisée par défaut en développement)

---

## Installation et Démarrage

### 1. Configuration du Backend (API)

```bash
cd backend

# Copier le fichier d'environnement
cp .env.example .env

# Installer les dépendances PHP
composer install

# Générer la clé d'application
php artisan key:generate

# Exécuter les migrations de la base de données
php artisan migrate

# Lancer le serveur de développement Laravel (par défaut sur http://localhost:8000)
php artisan serve
```

### 2. Configuration du Frontend (React)

Ouvrez un **nouveau terminal** et naviguez vers le dossier frontend :

```bash
cd frontend

# Installer les dépendances JS
npm install

# Lancer le serveur de développement Vite (par défaut sur http://localhost:5173)
npm run dev
```

---

## Fonctionnalités Actuelles
- Architecture Monorepo Backend/Frontend séparée.
- Authentification complète (Login, Register, Logout, Protected Routes) via Laravel Sanctum (API Tokens).
- Logique de **Rôle** (Enseignant / Étudiant) avec Redirection Dynamique vers les tableaux de bord respectifs.
- Interface moderne et responsive construite avec **React** et **Tailwind CSS v4**.

## Notes de Développement
- L'URL de l'API est configurée globalement dans `frontend/src/api/axios.js` pointant vers `http://localhost:8000/api`.
- Les tokens d'authentification sont stockés temporairement dans le `localStorage` du navigateur.
