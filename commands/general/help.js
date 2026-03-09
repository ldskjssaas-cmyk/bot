const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const CATEGORIES = {
  general: {
    label: '🌐 Général', description: 'Commandes de base du bot', color: 0x5865f2,
    commands: [
      { name: '/help', desc: 'Ce menu d\'aide interactif' },
      { name: '/ping', desc: 'Latence du bot' },
      { name: '/info membre', desc: 'Infos détaillées sur un membre (badges, rôles, dates)' },
      { name: '/info serveur', desc: 'Infos sur le serveur' },
      { name: '/botinfo', desc: 'Stats du bot (RAM, uptime, latence)' },
      { name: '/stats', desc: 'Statistiques complètes du serveur' },
    ],
  },
  config: {
    label: '⚙️ Configuration', description: 'Configurer le bot pour votre serveur', color: 0x95a5a6,
    commands: [
      { name: '/setup status', desc: 'Voir toute la config actuelle' },
      { name: '/setup levelrole', desc: 'Rôle automatique à un niveau' },
      { name: '/welcome set', desc: 'Salon + message de bienvenue' },
      { name: '/welcome goodbye', desc: 'Salon + message d\'au revoir' },
      { name: '/welcome autorole', desc: 'Rôle donné automatiquement à l\'arrivée' },
      { name: '/welcome test', desc: 'Prévisualiser le message de bienvenue' },
      { name: '/reactionrole add', desc: 'Ajouter un rôle par réaction' },
      { name: '/reactionrole remove', desc: 'Supprimer un rôle par réaction' },
      { name: '/reactionrole list', desc: 'Voir les rôles par réaction configurés' },
      { name: '/starboard', desc: 'Configurer le starboard ⭐' },
    ],
  },
  moderation: {
    label: '🔨 Modération', description: 'Outils pour modérer le serveur', color: 0xe74c3c,
    commands: [
      { name: '/kick', desc: 'Expulser un membre' },
      { name: '/ban', desc: 'Bannir un membre définitivement' },
      { name: '/tempban', desc: 'Ban temporaire avec auto-débannissement' },
      { name: '/unban', desc: 'Débannir un utilisateur' },
      { name: '/mute', desc: 'Mettre en sourdine (timeout Discord)' },
      { name: '/unmute', desc: 'Retirer le timeout' },
      { name: '/warn', desc: 'Avertir un membre' },
      { name: '/warns', desc: 'Voir les avertissements d\'un membre' },
      { name: '/clearwarns', desc: 'Effacer les avertissements' },
      { name: '/history', desc: 'Historique complet des sanctions' },
      { name: '/clear', desc: 'Supprimer des messages en masse' },
      { name: '/purgeuser', desc: 'Supprimer les messages d\'un membre spécifique' },
      { name: '/slowmode', desc: 'Régler le mode lent d\'un salon' },
      { name: '/lock', desc: 'Verrouiller / déverrouiller un salon' },
      { name: '/nuke', desc: 'Recrée le salon (supprime tous les messages)' },
      { name: '/nickname', desc: 'Changer le pseudo d\'un membre' },
      { name: '/role add/remove/list', desc: 'Gérer les rôles d\'un membre' },
      { name: '/massrole add/remove', desc: 'Donner/retirer un rôle à tous les membres' },
    ],
  },
  automod: {
    label: '🤖 AutoMod', description: 'Modération automatique', color: 0xff9900,
    commands: [
      { name: '/automod status', desc: 'Voir la config complète de l\'automod' },
      { name: '/automod antispam', desc: 'Anti-spam (seuil configurable)' },
      { name: '/automod antilink', desc: 'Bloquer les liens non autorisés' },
      { name: '/automod anticaps', desc: 'Supprimer les messages en full caps' },
      { name: '/automod antimention', desc: 'Limiter les mention-spams' },
      { name: '/wordfilter add', desc: 'Ajouter un mot interdit' },
      { name: '/wordfilter remove', desc: 'Retirer un mot interdit' },
      { name: '/wordfilter list', desc: 'Voir tous les mots filtrés' },
      { name: '/wordfilter clear', desc: 'Vider la liste de mots' },
    ],
  },
  security: {
    label: '🛡️ Sécurité', description: 'Anti-raid, vérification et logs', color: 0x2ecc71,
    commands: [
      { name: '/antiraid status', desc: 'Statut anti-raid + lockdown' },
      { name: '/antiraid config', desc: 'Configurer le seuil de détection' },
      { name: '/antiraid unlock', desc: 'Désactiver le lockdown manuellement' },
      { name: '/antiraid verify', desc: 'Activer la vérification par bouton à l\'entrée' },
      { name: '/logs set', desc: 'Définir le salon de logs de modération' },
      { name: '/logs status', desc: 'Voir le salon de logs actuel' },
    ],
  },
  ticket: {
    label: '🎫 Tickets', description: 'Support par tickets avec catégories', color: 0x3498db,
    commands: [
      { name: '/ticket setup', desc: 'Créer le panel (menu de catégories)' },
      { name: '/ticket setrole', desc: 'Définir le rôle support' },
    ],
  },
  giveaway: {
    label: '🎉 Giveaway', description: 'Organiser des concours et tirages', color: 0xff6b6b,
    commands: [
      { name: '/giveaway start', desc: 'Lancer un giveaway (lot, durée, gagnants)' },
      { name: '/giveaway end', desc: 'Terminer un giveaway immédiatement' },
      { name: '/giveaway reroll', desc: 'Reroll les gagnants d\'un giveaway terminé' },
    ],
  },
  utility: {
    label: '🛠️ Utilitaire', description: 'Outils pratiques du quotidien', color: 0x1abc9c,
    commands: [
      { name: '/poll', desc: 'Créer un sondage (jusqu\'à 4 options)' },
      { name: '/remind', desc: 'Définir un rappel par DM' },
      { name: '/suggest add', desc: 'Faire une suggestion communautaire (👍/👎)' },
      { name: '/suggest setchannel', desc: 'Définir le salon des suggestions' },
      { name: '/announce', desc: 'Faire une annonce officielle en embed' },
      { name: '/avatar', desc: 'Afficher l\'avatar d\'un membre en grand' },
      { name: '/banner user/server', desc: 'Afficher le banner d\'un membre ou serveur' },
      { name: '/snipe', desc: 'Voir le dernier message supprimé' },
      { name: '/calc', desc: 'Calculatrice (ex: 5 + 3 * 2)' },
      { name: '/embed', desc: 'Créer un message embed personnalisé' },
      { name: '/say', desc: 'Faire parler le bot dans un salon' },
      { name: '/roleinfo', desc: 'Informations sur un rôle' },
      { name: '/meteo', desc: 'Météo en temps réel par ville' },
      { name: '/translate', desc: 'Traducteur en 8 langues' },
    ],
  },
  games: {
    label: '🎮 Jeux', description: 'Mini-jeux interactifs', color: 0x9b59b6,
    commands: [
      { name: '/hangman', desc: 'Jeu du pendu avec clavier boutons' },
      { name: '/riddle', desc: 'Devinettes avec indice (60s)' },
      { name: '/trivia', desc: 'Culture générale via API (multijoueur)' },
    ],
  },
  fun: {
    label: '🤣 Fun', description: 'Commandes fun et divertissement', color: 0xf39c12,
    commands: [
      { name: '/joke', desc: 'Blague aléatoire' },
      { name: '/coinflip', desc: 'Pile ou face' },
      { name: '/dice', desc: 'Lancer un dé (2 à 100 faces)' },
      { name: '/rps', desc: 'Pierre, feuille, ciseaux contre le bot' },
      { name: '/8ball', desc: 'Boule magique 🎱' },
      { name: '/roast', desc: 'Envoyer un roast (humour)' },
      { name: '/compliment', desc: 'Envoyer un compliment' },
      { name: '/ship', desc: 'Compatibilité amoureuse entre deux membres' },
      { name: '/ascii', desc: 'Convertir du texte en art ASCII' },
    ],
  },
};

function homeEmbed(client, user) {
  const total = Object.values(CATEGORIES).reduce((a, c) => a + c.commands.length, 0);
  return new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle(`📖 Aide — ${client.user.username}`)
    .setThumbnail(client.user.displayAvatarURL())
    .setDescription('Utilise le **menu déroulant** pour naviguer par catégorie, ou les boutons **◀ ▶** pour défiler.')
    .addFields(Object.entries(CATEGORIES).map(([, c]) => ({ name: c.label, value: `\`${c.commands.length} cmd\``, inline: true })))
    .setFooter({ text: `${total} commandes • ${Object.keys(CATEGORIES).length} catégories • ${user.tag}` })
    .setTimestamp();
}

function catEmbed(key, user) {
  const c = CATEGORIES[key];
  return new EmbedBuilder()
    .setColor(c.color)
    .setTitle(c.label)
    .setDescription(`*${c.description}*`)
    .addFields(c.commands.map(cmd => ({ name: cmd.name, value: cmd.desc, inline: true })))
    .setFooter({ text: `${c.commands.length} commandes • ${user.tag}` })
    .setTimestamp();
}

function selectRow(cur) {
  return new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder().setCustomId('help_sel').setPlaceholder('📂 Choisir une catégorie...')
      .addOptions(Object.entries(CATEGORIES).map(([k, c]) => ({ label: c.label, value: k, description: c.description.slice(0, 50), default: k === cur })))
  );
}

function navRow(cur) {
  const keys = Object.keys(CATEGORIES);
  const i = keys.indexOf(cur);
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('help_home').setLabel('🏠').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('help_prev').setLabel('◀').setStyle(ButtonStyle.Primary).setDisabled(i <= 0),
    new ButtonBuilder().setCustomId('help_next').setLabel('▶').setStyle(ButtonStyle.Primary).setDisabled(i >= keys.length - 1),
  );
}

module.exports = {
  data: new SlashCommandBuilder().setName('help').setDescription('Menu d\'aide interactif par catégorie'),
  async execute(interaction) {
    const keys = Object.keys(CATEGORIES);
    let cur = null;

    const initNav = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('help_home').setLabel('🏠').setStyle(ButtonStyle.Secondary).setDisabled(true),
      new ButtonBuilder().setCustomId('help_prev').setLabel('◀').setStyle(ButtonStyle.Primary).setDisabled(true),
      new ButtonBuilder().setCustomId('help_next').setLabel('▶').setStyle(ButtonStyle.Primary).setDisabled(false),
    );

    const msg = await interaction.reply({ embeds: [homeEmbed(interaction.client, interaction.user)], components: [selectRow(null), initNav], fetchReply: true });
    const col = msg.createMessageComponentCollector({ time: 180_000 });

    col.on('collect', async i => {
      if (i.user.id !== interaction.user.id) return i.reply({ content: '❌ Ce menu n\'est pas pour toi !', ephemeral: true });
      if (i.customId === 'help_home') {
        cur = null;
        await i.update({ embeds: [homeEmbed(interaction.client, i.user)], components: [selectRow(null), initNav] });
      } else if (i.customId === 'help_sel') {
        cur = i.values[0];
        await i.update({ embeds: [catEmbed(cur, i.user)], components: [selectRow(cur), navRow(cur)] });
      } else if (i.customId === 'help_prev' && cur) {
        cur = keys[Math.max(0, keys.indexOf(cur) - 1)];
        await i.update({ embeds: [catEmbed(cur, i.user)], components: [selectRow(cur), navRow(cur)] });
      } else if (i.customId === 'help_next') {
        cur = keys[Math.min(keys.length - 1, cur ? keys.indexOf(cur) + 1 : 0)];
        await i.update({ embeds: [catEmbed(cur, i.user)], components: [selectRow(cur), navRow(cur)] });
      }
    });

    col.on('end', () => msg.edit({ components: [] }).catch(() => {}));
  },
};
