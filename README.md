# 🤖 Discord Bot

Bot Discord complet avec commandes slash, modération, musique et réponses automatiques.

---

## 📦 Installation

### 1. Prérequis
- [Node.js](https://nodejs.org) v18 ou supérieur
- [ffmpeg](https://ffmpeg.org/download.html) installé sur le système

### 2. Installer les dépendances
```bash
npm install
```

### 3. Configurer le bot
Copie `.env.example` en `.env` et remplis les valeurs :
```bash
cp .env.example .env
```

Contenu du fichier `.env` :
```
DISCORD_TOKEN=ton_token_ici
CLIENT_ID=ton_client_id_ici
GUILD_ID=ton_server_id_ici
```

---

## 🔑 Obtenir les credentials

### Token du bot
1. Va sur [discord.com/developers/applications](https://discord.com/developers/applications)
2. Clique **New Application** → donne un nom
3. Dans l'onglet **Bot** → **Reset Token** → copie le token dans `DISCORD_TOKEN`
4. Active **Message Content Intent**, **Server Members Intent** et **Presence Intent**

### Client ID
- Dans **General Information** → copie l'**Application ID** dans `CLIENT_ID`

### Guild ID
- Fais clic droit sur ton serveur Discord → **Copier l'identifiant du serveur** → `GUILD_ID`
  *(Active le mode développeur : Paramètres → Avancés → Mode développeur)*

### Inviter le bot
Dans l'onglet **OAuth2 → URL Generator** :
- Coche `bot` et `applications.commands`
- Permissions : `Administrator` (ou choisis les permissions nécessaires)
- Copie l'URL et ouvre-la dans un navigateur

---

## 🚀 Lancement

### Déployer les commandes slash (une seule fois)
```bash
npm run deploy
```

### Démarrer le bot
```bash
npm start
```

---

## 📋 Commandes disponibles

### 🌐 Général
| Commande | Description |
|----------|-------------|
| `/ping` | Latence du bot |
| `/info serveur` | Infos sur le serveur |
| `/info utilisateur [@user]` | Infos sur un utilisateur |

### 🔨 Modération
| Commande | Description |
|----------|-------------|
| `/kick @membre [raison]` | Expulse un membre |
| `/ban @membre [raison] [jours]` | Bannit un membre |
| `/unban <userid>` | Débannit un utilisateur |
| `/clear <nombre> [@membre]` | Supprime des messages |

### 🎵 Musique
| Commande | Description |
|----------|-------------|
| `/play <recherche>` | Joue une chanson (nom ou URL YouTube) |
| `/skip` | Passe à la suivante |
| `/stop` | Arrête et vide la file |
| `/pause` | Pause / Reprend la lecture |
| `/queue` | Affiche la file d'attente |

### 💬 Réponses automatiques
Le bot répond automatiquement aux messages contenant :
- `bonjour`, `salut`, `hello` → salutation
- `comment ça va` → réponse de politesse
- `merci`, `thanks` → remerciement
- `!aide` ou `!help` → liste des commandes

*Modifie `events/messageCreate.js` pour ajouter tes propres réponses !*

---

## 🗂️ Structure du projet
```
discord-bot/
├── index.js              # Point d'entrée
├── deploy-commands.js    # Déploiement des slash commands
├── .env                  # Variables d'environnement (secret !)
├── commands/
│   ├── general/          # ping, info
│   ├── moderation/       # kick, ban, unban, clear
│   └── music/            # play, skip, stop, pause, queue
└── events/
    ├── ready.js          # Connexion du bot
    ├── interactionCreate.js  # Gestion des commandes
    └── messageCreate.js  # Réponses automatiques
```

---

## ➕ Ajouter une commande

Crée un fichier dans le bon dossier :

```js
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ma-commande')
    .setDescription('Description de ma commande'),

  async execute(interaction, client) {
    await interaction.reply('Hello !');
  },
};
```

Puis relance `npm run deploy` pour l'enregistrer.
