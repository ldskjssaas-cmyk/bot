require('dotenv').config();
const { Client, GatewayIntentBits, Collection, Partials, REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

client.commands = new Collection();
client.cooldowns = new Collection();

// ── Chargement des commandes ─────────────────────────────────────────────────
const commandsJSON = [];
const seenNames = new Set();

const commandFolders = fs.readdirSync(path.join(__dirname, 'commands'));
for (const folder of commandFolders) {
  const commandFiles = fs
    .readdirSync(path.join(__dirname, 'commands', folder))
    .filter((f) => f.endsWith('.js'));
  for (const file of commandFiles) {
    const command = require(`./commands/${folder}/${file}`);
    if ('data' in command && 'execute' in command) {
      const name = command.data.name;
      if (seenNames.has(name)) {
        console.warn(`⚠️  Commande dupliquée ignorée : "${name}" (${folder}/${file})`);
        continue;
      }
      seenNames.add(name);
      client.commands.set(name, command);
      commandsJSON.push(command.data.toJSON());
    }
  }
}

// ── Chargement des événements ────────────────────────────────────────────────
const eventFiles = fs
  .readdirSync(path.join(__dirname, 'events'))
  .filter((f) => f.endsWith('.js'));
for (const file of eventFiles) {
  const event = require(`./events/${file}`);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
}

// ── Déploiement des commandes slash au démarrage ─────────────────────────────
client.once('ready', async () => {
  console.log(`📊 Serveurs : ${client.guilds.cache.size}`);
  console.log(`📦 ${commandsJSON.length} commandes chargées, déploiement...`);

  // Rotation de statuts
  const statuses = [
    { name: '/help', type: 0 },
    { name: 'les membres', type: 3 },
    { name: 'ton serveur', type: 2 },
  ];
  let i = 0;
  client.user.setActivity(statuses[0].name, { type: statuses[0].type });
  setInterval(() => {
    i = (i + 1) % statuses.length;
    client.user.setActivity(statuses[i].name, { type: statuses[i].type });
  }, 30_000);

  try {
    const rest = new REST().setToken(process.env.DISCORD_TOKEN);
    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commandsJSON }
    );
    console.log(`✅ ${commandsJSON.length} commandes déployées avec succès !`);
  } catch (err) {
    console.error('❌ Erreur déploiement:', err.message);
  }
});

// ── Gestion des erreurs globales ─────────────────────────────────────────────
client.on('error', err => console.error('Client error:', err));
process.on('unhandledRejection', err => console.error('Unhandled rejection:', err));

client.login(process.env.DISCORD_TOKEN);
