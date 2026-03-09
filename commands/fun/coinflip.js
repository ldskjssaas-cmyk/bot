const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder().setName('coinflip').setDescription('Pile ou face ?'),
  async execute(interaction) {
    const result = Math.random() < 0.5 ? '🪙 Pile !' : '🪙 Face !';
    await interaction.reply({ embeds: [new EmbedBuilder().setColor(0xf1c40f).setTitle('Lancer de pièce').setDescription(`**${result}**`)] });
  },
};
