const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder().setName('calc').setDescription('Calculatrice simple')
    .addStringOption(opt => opt.setName('calcul').setDescription('Ex: 5 + 3 * 2').setRequired(true)),
  async execute(interaction) {
    const expr = interaction.options.getString('calcul');
    try {
      const sanitized = expr.replace(/[^0-9+\-*/().\s]/g, '');
      const result = Function('"use strict"; return (' + sanitized + ')')();
      await interaction.reply({ embeds: [new EmbedBuilder().setColor(0x27ae60)
        .setTitle('🧮 Calculatrice').addFields({ name: 'Calcul', value: expr, inline: true }, { name: 'Résultat', value: `**${result}**`, inline: true })] });
    } catch {
      await interaction.reply({ content: '❌ Expression invalide.', ephemeral: true });
    }
  },
};
