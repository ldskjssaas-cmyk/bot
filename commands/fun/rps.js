const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder().setName('rps').setDescription('Pierre, feuille, ciseaux !')
    .addStringOption(opt => opt.setName('choix').setDescription('Ton choix').setRequired(true)
      .addChoices({ name: '🪨 Pierre', value: 'pierre' }, { name: '📄 Feuille', value: 'feuille' }, { name: '✂️ Ciseaux', value: 'ciseaux' })),
  async execute(interaction) {
    const choices = ['pierre', 'feuille', 'ciseaux'];
    const emojis = { pierre: '🪨', feuille: '📄', ciseaux: '✂️' };
    const user = interaction.options.getString('choix');
    const bot = choices[Math.floor(Math.random() * 3)];
    let result = user === bot ? '🤝 Égalité !' :
      (user === 'pierre' && bot === 'ciseaux') || (user === 'feuille' && bot === 'pierre') || (user === 'ciseaux' && bot === 'feuille')
        ? '🎉 Tu as gagné !' : '😈 J\'ai gagné !';
    await interaction.reply({ embeds: [new EmbedBuilder().setColor(0xe74c3c).setTitle('Pierre, Feuille, Ciseaux')
      .addFields({ name: 'Ton choix', value: `${emojis[user]} ${user}`, inline: true }, { name: 'Mon choix', value: `${emojis[bot]} ${bot}`, inline: true }, { name: 'Résultat', value: result })] });
  },
};
