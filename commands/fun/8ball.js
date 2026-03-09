const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const responses = ["🟢 C'est certain !","🟢 Absolument oui !","🟢 Sans aucun doute.","🟡 Difficile à dire, réessaie.","🟡 Je ne peux pas prévoir maintenant.","🔴 N'y compte pas.","🔴 Ma réponse est non.","🔴 Les perspectives ne sont pas bonnes."];
module.exports = {
  data: new SlashCommandBuilder().setName('8ball').setDescription('Pose une question à la boule magique 🎱')
    .addStringOption(opt => opt.setName('question').setDescription('Ta question').setRequired(true)),
  async execute(interaction) {
    const question = interaction.options.getString('question');
    const response = responses[Math.floor(Math.random() * responses.length)];
    await interaction.reply({ embeds: [new EmbedBuilder().setColor(0x2c2f33).setTitle('🎱 Boule Magique')
      .addFields({ name: '❓ Question', value: question }, { name: '🎱 Réponse', value: response })] });
  },
};
