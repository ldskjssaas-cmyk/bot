const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder().setName('slowmode').setDescription('Définit le slowmode du salon')
    .addIntegerOption(opt => opt.setName('secondes').setDescription('Secondes (0 pour désactiver)').setMinValue(0).setMaxValue(21600).setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
  async execute(interaction) {
    const seconds = interaction.options.getInteger('secondes');
    await interaction.channel.setRateLimitPerUser(seconds);
    await interaction.reply({ embeds: [new EmbedBuilder().setColor(0x3498db)
      .setDescription(seconds === 0 ? '✅ Slowmode désactivé.' : `✅ Slowmode défini à **${seconds} secondes**`)] });
  },
};
