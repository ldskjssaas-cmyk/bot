const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const badges = {
  ActiveDeveloper: '👨‍💻',
  BugHunterLevel1: '🐛',
  BugHunterLevel2: '🐛🥇',
  CertifiedModerator: '🛡️',
  HypeSquadOnlineHouse1: '🏠 Bravery',
  HypeSquadOnlineHouse2: '🏠 Brilliance',
  HypeSquadOnlineHouse3: '🏠 Balance',
  Partner: '🤝',
  PremiumEarlySupporter: '⭐',
  Staff: '👮',
  VerifiedDeveloper: '✅',
};

module.exports = {
  data: new SlashCommandBuilder().setName('info').setDescription('Informations détaillées sur un membre ou le serveur')
    .addSubcommand(sub => sub.setName('membre').setDescription('Infos sur un membre')
      .addUserOption(opt => opt.setName('utilisateur').setDescription('Le membre')))
    .addSubcommand(sub => sub.setName('serveur').setDescription('Infos sur le serveur')),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();

    if (sub === 'membre') {
      const user = interaction.options.getUser('utilisateur') || interaction.user;
      const member = interaction.guild.members.cache.get(user.id);
      await user.fetch(); // pour les drapeaux

      const userBadges = user.flags?.toArray().map(b => badges[b] || b).join(' ') || 'Aucun';
      const roles = member?.roles.cache.filter(r => r.id !== interaction.guild.id).sort((a, b) => b.position - a.position) || [];
      const topRole = roles.first();
      const createdAt = Math.floor(user.createdTimestamp / 1000);
      const joinedAt = member ? Math.floor(member.joinedTimestamp / 1000) : null;

      const embed = new EmbedBuilder()
        .setColor(topRole?.color || 0x5865f2)
        .setTitle(`👤 ${user.username}`)
        .setThumbnail(user.displayAvatarURL({ size: 256 }))
        .setImage(user.bannerURL({ size: 512 }) || null)
        .addFields(
          { name: '🆔 ID', value: `\`${user.id}\``, inline: true },
          { name: '🤖 Bot', value: user.bot ? 'Oui' : 'Non', inline: true },
          { name: '🏅 Badges', value: userBadges, inline: true },
          { name: '📅 Compte créé', value: `<t:${createdAt}:D>\n<t:${createdAt}:R>`, inline: true },
          joinedAt ? { name: '📥 A rejoint', value: `<t:${joinedAt}:D>\n<t:${joinedAt}:R>`, inline: true } : { name: '\u200B', value: '\u200B', inline: true },
          { name: '🎭 Rôle principal', value: topRole ? `${topRole}` : 'Aucun', inline: true },
          { name: `🎭 Rôles (${roles.size})`, value: roles.size > 0 ? roles.map(r => `${r}`).slice(0, 10).join(' ') + (roles.size > 10 ? ` +${roles.size - 10}` : '') : 'Aucun' },
        )
        .setTimestamp();
      await interaction.reply({ embeds: [embed] });

    } else {
      const guild = interaction.guild;
      await guild.members.fetch();
      const bots = guild.members.cache.filter(m => m.user.bot).size;
      const humans = guild.memberCount - bots;
      const embed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle(`🏠 ${guild.name}`)
        .setThumbnail(guild.iconURL({ size: 256 }))
        .setImage(guild.bannerURL({ size: 1024 }) || null)
        .addFields(
          { name: '🆔 ID', value: `\`${guild.id}\``, inline: true },
          { name: '👑 Propriétaire', value: `<@${guild.ownerId}>`, inline: true },
          { name: '📅 Créé le', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:D>`, inline: true },
          { name: '👥 Membres', value: `Total: **${guild.memberCount}**\nHumains: **${humans}** | Bots: **${bots}**`, inline: true },
          { name: '📁 Salons', value: `Texte: **${guild.channels.cache.filter(c=>c.type===0).size}** | Vocal: **${guild.channels.cache.filter(c=>c.type===2).size}**`, inline: true },
          { name: '🚀 Boosts', value: `**${guild.premiumSubscriptionCount}** (Niv. ${guild.premiumTier})`, inline: true },
        )
        .setTimestamp();
      await interaction.reply({ embeds: [embed] });
    }
  },
};
