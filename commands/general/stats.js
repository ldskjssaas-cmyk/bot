const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder().setName('stats').setDescription('Statistiques détaillées du serveur'),

  async execute(interaction) {
    await interaction.deferReply();
    const guild = interaction.guild;
    await guild.members.fetch();

    const total = guild.memberCount;
    const bots = guild.members.cache.filter(m => m.user.bot).size;
    const humans = total - bots;
    const online = guild.members.cache.filter(m => m.presence?.status !== 'offline' && !m.user.bot).size;
    const text = guild.channels.cache.filter(c => c.type === 0).size;
    const voice = guild.channels.cache.filter(c => c.type === 2).size;
    const categories = guild.channels.cache.filter(c => c.type === 4).size;
    const roles = guild.roles.cache.size - 1;
    const emojis = guild.emojis.cache.size;
    const boosts = guild.premiumSubscriptionCount;
    const createdAt = Math.floor(guild.createdTimestamp / 1000);

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle(`📊 Statistiques — ${guild.name}`)
      .setThumbnail(guild.iconURL({ size: 256 }))
      .addFields(
        { name: '👥 Membres', value: `Total: **${total}**\nHumains: **${humans}**\nBots: **${bots}**\nEn ligne: **${online}**`, inline: true },
        { name: '📁 Salons', value: `Texte: **${text}**\nVocal: **${voice}**\nCatégories: **${categories}**`, inline: true },
        { name: '🎭 Rôles & Emojis', value: `Rôles: **${roles}**\nEmojis: **${emojis}**\nBoosts: **${boosts}** (Niv ${guild.premiumTier})`, inline: true },
        { name: '👑 Propriétaire', value: `<@${guild.ownerId}>`, inline: true },
        { name: '📅 Créé le', value: `<t:${createdAt}:D> (<t:${createdAt}:R>)`, inline: true },
        { name: '🔒 Vérification', value: `Niveau **${guild.verificationLevel}**`, inline: true },
      )
      .setImage(guild.bannerURL({ size: 1024 }) || null)
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};
