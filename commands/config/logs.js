const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { setLogChannel, getLogChannel } = require('../../systems/logs');
const db = require('../../systems/database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('logs')
    .setDescription('Configure le salon des logs de modération')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(sub =>
      sub.setName('set')
        .setDescription('Définit le salon des logs')
        .addChannelOption(opt =>
          opt.setName('salon').setDescription('Salon pour les logs').setRequired(true))
    )
    .addSubcommand(sub =>
      sub.setName('disable')
        .setDescription('Désactive les logs')
    )
    .addSubcommand(sub =>
      sub.setName('status')
        .setDescription('Affiche le salon de logs actuel')
    ),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const guildId = interaction.guild.id;

    if (sub === 'set') {
      const channel = interaction.options.getChannel('salon');
      setLogChannel(guildId, channel.id);
      db.setConfig(guildId, 'logChannelId', channel.id);
      return interaction.reply({
        content: `✅ Logs de modération définis dans ${channel}.\nToutes les actions (ban, kick, mute, warn...) y seront envoyées.`,
        ephemeral: true,
      });
    }

    if (sub === 'disable') {
      setLogChannel(guildId, null);
      db.setConfig(guildId, 'logChannelId', null);
      return interaction.reply({
        content: '✅ Logs désactivés.',
        ephemeral: true,
      });
    }

    if (sub === 'status') {
      const channelId = getLogChannel(guildId) || db.getConfig(guildId)?.logChannelId;
      const embed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle('📋 Statut des Logs')
        .addFields(
          { name: '📌 Salon', value: channelId ? `<#${channelId}>` : '❌ Non configuré', inline: true },
          { name: '📊 État', value: channelId ? '🟢 Actif' : '🔴 Inactif', inline: true },
        )
        .setTimestamp();
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }
  },
};
