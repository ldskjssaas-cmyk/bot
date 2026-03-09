const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const compliments = [
  "Tu illumines la pièce dès que tu entres !",
  "Tu es incroyablement intelligent(e) et créatif(ve).",
  "Le monde est meilleur grâce à toi.",
  "Tu as un sourire qui pourrait réchauffer n'importe quel cœur.",
  "Tu es une vraie source d'inspiration pour tout le monde !",
];
module.exports = {
  data: new SlashCommandBuilder().setName('compliment').setDescription('Envoie un compliment à quelqu\'un 💖')
    .addUserOption(opt => opt.setName('cible').setDescription('La personne').setRequired(true)),
  async execute(interaction) {
    const target = interaction.options.getUser('cible');
    const compliment = compliments[Math.floor(Math.random() * compliments.length)];
    await interaction.reply({ embeds: [new EmbedBuilder().setColor(0xff69b4).setTitle(`💖 Compliment pour ${target.username}`).setDescription(compliment)] });
  },
};
