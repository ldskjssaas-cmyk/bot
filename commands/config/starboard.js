const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../../systems/database');

module.exports = {
  data: new SlashCommandBuilder().setName('starboard').setDescription('Configure le starboard ⭐')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(sub => sub.setName('set').setDescription('Définit le salon starboard')
      .addChannelOption(opt => opt.setName('salon').setDescription('Le salon').setRequired(true))
      .addIntegerOption(opt => opt.setName('seuil').setDescription('Nb d\'⭐ requis (défaut: 3)').setMinValue(1).setMaxValue(20)))
    .addSubcommand(sub => sub.setName('disable').setDescription('Désactive le starboard'))
    .addSubcommand(sub => sub.setName('status').setDescription('Affiche la config')),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const guildId = interaction.guild.id;

    if (sub === 'set') {
      const channel = interaction.options.getChannel('salon');
      const threshold = interaction.options.getInteger('seuil') || 3;
      db.setConfig(guildId, 'starboardChannelId', channel.id);
      db.setConfig(guildId, 'starboardThreshold', threshold);
      await interaction.reply({ content: `✅ Starboard configuré dans ${channel} — Seuil : **${threshold}** ⭐`, ephemeral: true });
    }

    if (sub === 'disable') {
      db.setConfig(guildId, 'starboardChannelId', null);
      await interaction.reply({ content: '✅ Starboard désactivé.', ephemeral: true });
    }

    if (sub === 'status') {
      const config = db.getConfig(guildId);
      const embed = new EmbedBuilder().setColor(0xffd700).setTitle('⭐ Starboard')
        .addFields(
          { name: 'Salon', value: config.starboardChannelId ? `<#${config.starboardChannelId}>` : '❌ Non défini', inline: true },
          { name: 'Seuil', value: `${config.starboardThreshold || 3} ⭐`, inline: true },
          { name: 'Statut', value: config.starboardChannelId ? '✅ Actif' : '❌ Inactif', inline: true },
        );
      await interaction.reply({ embeds: [embed], ephemeral: true });
    }
  },
};
