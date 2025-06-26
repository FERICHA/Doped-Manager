# 🧾 Doped Manager – Application de Gestion Budgétaire, de Stock et des Absences Employés

Doped Manager est une application web SaaS permettant aux petites et moyennes entreprises de gérer leur **budget**, leur **stock de produits** et les **absences de leurs employés** via une interface moderne, sécurisée et accessible en ligne.

---

## 🚀 Fonctionnalités principales

- 🔐 Authentification sécurisée (JWT + Bcrypt)
- 📊 Suivi des transactions (recettes/dépenses)
- 📦 Gestion du stock avec alerte de seuil critique
- 🧑‍💼 Suivi des employés et gestion des absences
- ⚙️ Paramètres utilisateur, changement de mot de passe
- 📈 Export des données filtrées (Excel)
- 🔄 Multi-entreprises via `sessionId`

---

## 📁 Structure du projet

![image](https://github.com/user-attachments/assets/2b8a8711-e76c-4565-b26d-c7e3d8a26026)


---

## 🛠️ Prérequis

- [Node.js](https://nodejs.org/)
- [Docker](https://www.docker.com/)
- [MongoDB local](https://www.mongodb.com/)

---

## 💻 Lancer le projet en local (sans Docker)

### 1. Cloner le dépôt

```bash
git https://github.com/FERICHA/Doped-Manager.git
cd Doped-Manager
```

### 2. Lancer le backend

```bash
cd server
npm install
npm start
```

### 3. Lancer le frontend

```bash
cd client
npm install
npm start
```

## 🐳 Lancer avec Docker
### 1. Construire et exécuter les services

```bash
docker-compose up --build
```

### 2. Arrêter les services

```bash
docker-compose down
```

## 📝 Variables d’environnement
### Configurer un fichier .env dans /server :

```bash
MONGODB_DATABASE="mongodb://mongo:27017/doped_manager"
DATABASE_PORT='5000'
SECRET_KEY=YourSecretKey
```

## 📦 Publication

- 🔗 GitHub : 
https://github.com/FERICHA/Doped-Manager
- 🐳 Docker Hub :
