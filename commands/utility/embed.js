const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder().setName('embed').setDescription('Crée un embed personnalisé')
    .addStringOption(opt => opt.setName('titre').setDescription('Titre').setRequired(true))
    .addStringOption(opt => opt.setName('description').setDescription('Description').setRequired(true))
    .addStringOption(opt => opt.setName('couleur').setDescription('Couleur hex (ex: FF0000)'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
  async execute(interaction) {
    const titre = interaction.options.getString('titre');
    const description = interaction.options.getString('description');
    const couleur = interaction.options.getString('couleur');
    const color = couleur ? parseInt(couleur.replace('#',''), 16) : 0x5865f2;
    await interaction.reply({ embeds: [new EmbedBuilder().setColor(color).setTitle(titre).setDescription(description).setTimestamp()] });
  },
};
