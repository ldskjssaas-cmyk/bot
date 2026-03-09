const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const roasts = [
  "Tu es la preuve que Dieu a un sens de l'humour.",
  "Je t'expliquerais une blague, mais tu ne la comprendrais pas.",
  "Tu es comme une pizza froide : désiré au départ, regretté après.",
  "Si l'intelligence était de l'eau, tu serais un désert.",
  "Tu parles tellement vite que même le silence est plus intéressant.",
];
module.exports = {
  data: new SlashCommandBuilder().setName('roast').setDescription('Envoie un roast à quelqu\'un 🔥')
    .addUserOption(opt => opt.setName('cible').setDescription('La victime').setRequired(true)),
  async execute(interaction) {
    const target = interaction.options.getUser('cible');
    const roast = roasts[Math.floor(Math.random() * roasts.length)];
    await interaction.reply({ embeds: [new EmbedBuilder().setColor(0xff4500).setTitle(`🔥 Roast de ${target.username}`).setDescription(roast)] });
  },
};
