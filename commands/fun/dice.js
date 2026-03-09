const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder().setName('dice').setDescription('Lance un dé')
    .addIntegerOption(opt => opt.setName('faces').setDescription('Nombre de faces (défaut: 6)').setMinValue(2).setMaxValue(100)),
  async execute(interaction) {
    const faces = interaction.options.getInteger('faces') || 6;
    const result = Math.floor(Math.random() * faces) + 1;
    await interaction.reply({ embeds: [new EmbedBuilder().setColor(0x9b59b6).setTitle(`🎲 Dé à ${faces} faces`).setDescription(`Tu as obtenu : **${result}**`)] });
  },
};
