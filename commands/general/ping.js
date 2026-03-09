const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Affiche la latence du bot'),

  async execute(interaction, client) {
    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle('🏓 Pong !')
      .addFields(
        { name: 'Latence Bot', value: `\`${Date.now() - interaction.createdTimestamp}ms\``, inline: true },
        { name: 'Latence API', value: `\`${Math.round(client.ws.ping)}ms\``, inline: true }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
