# Utilisation de l'image Node.js en tant que base
FROM node:latest

# Définition du répertoire de travail dans le conteneur
WORKDIR /app

# Copie du package.json et du package-lock.json dans le répertoire de travail
COPY package*.json ./


# Copie de tous les fichiers du projet dans le répertoire de travail
COPY . .
# Installation des dépendances
RUN npm install

# Construction de l'application React
RUN npm run build

# Exposition du port sur lequel l'application réagit en production
EXPOSE 3000

# Commande pour exécuter l'application lorsque le conteneur démarre
CMD ["npm", "start"]
