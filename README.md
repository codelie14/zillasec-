# ZillaSec - Plateforme d'Analyse de Sécurité IA

ZillaSec est une application web complète conçue pour analyser des fichiers de données, identifier des risques de sécurité, et fournir des insights exploitables grâce à l'intelligence artificielle.

## 🏛️ Architecture Technique

L'application est une monoculture organisée en deux parties principales :

-   **`frontend/`** : Une application monopage (SPA) développée avec **React** et **TypeScript**, utilisant **Vite** pour le build et **Tailwind CSS** pour le style.
-   **`backend/`** : Une API RESTful développée avec **Python** et **FastAPI**, utilisant **SQLAlchemy** comme ORM pour communiquer avec une base de données **MySQL**.

---

## 🤖 Modèle d'IA

Ce projet utilise le modèle de langage (LLM) suivant pour ses capacités d'analyse et de génération de texte.

-   **Modèle** : `deepseek/deepseek-r1-0528-qwen3-8b`
-   **Fournisseur** : Le modèle est appelé via l'API **OpenRouter**.

Toutes les interactions avec l'IA sont gérées par le backend pour des raisons de sécurité et de centralisation.

---

## 🚀 Démarrage Rapide

### Prérequis

-   **Node.js** (v18+) et **npm**
-   **Python** (v3.10+) et **pip**
-   Un serveur **MySQL** démarré et accessible.

### 1. Configuration du Backend

1.  **Naviguez vers le répertoire du backend :**
    ```bash
    cd backend
    ```

2.  **Créez un environnement virtuel et activez-le :**
    ```bash
    # Pour Windows
    python -m venv .env
    .env\Scripts\activate

    # Pour macOS/Linux
    python3 -m venv .env
    source .env/bin/activate
    ```

3.  **Installez les dépendances Python :**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Configurez les variables d'environnement :**
    Créez un fichier `.env` dans le répertoire `backend/app/` en vous basant sur le modèle suivant :
    ```env
    # Clé API pour le service OpenRouter
    OPENROUTER_API_KEY="votre_clé_api_openrouter"

    # Nombre maximum de lignes à envoyer à l'IA pour analyse
    MAX_AI_INPUT_ROWS=200
    ```

5.  **Appliquez les migrations de la base de données :**
    Cette commande crée toutes les tables nécessaires dans votre base de données MySQL.
    ```bash
    alembic upgrade head
    ```

6.  **Lancez le serveur backend :**
    ```bash
    uvicorn main:app --reload --app-dir app
    ```
    L'API sera disponible à l'adresse `http://127.0.0.1:8000`.

### 2. Configuration du Frontend

1.  **Naviguez vers le répertoire du frontend :**
    ```bash
    cd frontend
    ```

2.  **Installez les dépendances JavaScript :**
    ```bash
    npm install
    ```

3.  **Lancez le serveur de développement :**
    ```bash
    npm run dev
    ```
    L'application sera accessible à l'adresse `http://localhost:5173`.

---

## 🗄️ Structure de la Base de Données

Le schéma est géré par SQLAlchemy et Alembic. Les principaux modèles sont :

-   **`analyses`**: Stocke les métadonnées et les résultats de chaque analyse de fichier.
-   **`file_data`**: Contient les données brutes extraites des fichiers uploadés, ligne par ligne.
-   **`templates`**: Sauvegarde les modèles de prompts réutilisables pour les analyses.
-   **`conversations`**: Historique des interactions avec le chatbot IA.

---

## ⚙️ API Backend

Le backend expose plusieurs endpoints pour gérer les fonctionnalités de l'application. Voici les principaux :

| Méthode | Endpoint                             | Description                                             |
| :------ | :----------------------------------- | :------------------------------------------------------ |
| `POST`  | `/analyze/`                          | Uploade et analyse un fichier.                          |
| `GET`   | `/analyses/`                         | Récupère la liste des analyses passées.                 |
| `GET`   | `/analyses/{id}`                     | Récupère les détails d'une analyse spécifique.          |
| `POST`  | `/chat/`                             | Envoie une question au chatbot IA.                      |
| `GET`   | `/dashboard/metrics/`                | Récupère les métriques pour le tableau de bord.         |
| `GET`   | `/reports/{id}/download`             | Télécharge un rapport d'analyse (PDF, Excel, etc.).     |
| `GET`   | `/templates/`                        | Liste tous les modèles de prompts.                      |
| `POST`  | `/templates/`                        | Crée un nouveau modèle.                                 |
| `GET`   | `/database/tables/`                  | Liste toutes les tables de la base de données.          |
| `GET`   | `/database/tables/{table_name}`      | Affiche le contenu d'une table spécifique.              |

---

## 🎨 Structure du Frontend

Le frontend est structuré par fonctionnalité pour une meilleure organisation.

-   **`components/`**: Contient les composants React réutilisables.
    -   **`common/`**: Composants transverses (Layout, Sidebar, etc.).
    -   **`analysis/`**: Composants pour l'upload et l'analyse de fichiers.
    -   **`dashboard/`**: Composants pour la page du tableau de bord.
    -   **`analytics/`**: Composants pour la page d'analyse détaillée.
    -   **`...`** (et autres dossiers par fonctionnalité)
-   **`pages/`**: Contient les pages plus complexes qui assemblent plusieurs composants.
-   **`contexts/`**: Fournit des contextes React, comme le `ThemeContext` pour le mode sombre/clair.
-   **`hooks/`**: Contient les hooks React personnalisés.
-   **`types/`**: Définit les types TypeScript partagés dans l'application.

Le routage est géré par `react-router-dom` dans le fichier `App.tsx`.