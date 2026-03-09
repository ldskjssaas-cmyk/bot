const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder().setName('avatar').setDescription("Affiche l'avatar d'un utilisateur")
    .addUserOption(opt => opt.setName('utilisateur').setDescription('L\'utilisateur')),
  async execute(interaction) {
    const user = interaction.options.getUser('utilisateur') || interaction.user;
    const embed = new EmbedBuilder().setColor(0x5865f2).setTitle(`Avatar de ${user.username}`)
      .setImage(user.displayAvatarURL({ size: 1024 }))
      .addFields({ name: 'Lien', value: `[Cliquer ici](${user.displayAvatarURL({ size: 1024 })})` });
    await interaction.reply({ embeds: [embed] });
  },
};
