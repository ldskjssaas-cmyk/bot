const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder().setName('remind').setDescription('Définit un rappel')
    .addStringOption(opt => opt.setName('message').setDescription('Le rappel').setRequired(true))
    .addIntegerOption(opt => opt.setName('minutes').setDescription('Dans combien de minutes ?').setRequired(true).setMinValue(1).setMaxValue(1440)),
  async execute(interaction) {
    const message = interaction.options.getString('message');
    const minutes = interaction.options.getInteger('minutes');
    await interaction.reply({ embeds: [new EmbedBuilder().setColor(0x00bcd4).setTitle('⏰ Rappel défini !').setDescription(`Je te rappellerai dans **${minutes} minute(s)** : *${message}*`)] });
    setTimeout(async () => {
      try {
        await interaction.user.send({ embeds: [new EmbedBuilder().setColor(0x00bcd4).setTitle('⏰ Rappel !').setDescription(message).setTimestamp()] });
      } catch {
        await interaction.channel.send(`⏰ ${interaction.user} Rappel : **${message}**`);
      }
    }, minutes * 60 * 1000);
  },
};
