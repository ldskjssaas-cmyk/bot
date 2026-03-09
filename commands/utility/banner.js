const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder().setName('banner').setDescription('Affiche le banner d\'un utilisateur ou du serveur')
    .addSubcommand(sub => sub.setName('user').setDescription('Banner d\'un utilisateur')
      .addUserOption(opt => opt.setName('utilisateur').setDescription('L\'utilisateur')))
    .addSubcommand(sub => sub.setName('server').setDescription('Banner du serveur')),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();

    if (sub === 'user') {
      const user = await (interaction.options.getUser('utilisateur') || interaction.user).fetch();
      const banner = user.bannerURL({ size: 1024 });
      if (!banner) return interaction.reply({ content: `❌ **${user.username}** n'a pas de banner.`, ephemeral: true });
      const embed = new EmbedBuilder().setColor(user.accentColor || 0x5865f2)
        .setTitle(`🖼️ Banner de ${user.username}`)
        .setImage(banner)
        .addFields({ name: 'Lien', value: `[Télécharger](${banner})` });
      await interaction.reply({ embeds: [embed] });
    }

    if (sub === 'server') {
      const banner = interaction.guild.bannerURL({ size: 1024 });
      if (!banner) return interaction.reply({ content: '❌ Ce serveur n\'a pas de banner.', ephemeral: true });
      const embed = new EmbedBuilder().setColor(0x5865f2)
        .setTitle(`🖼️ Banner de ${interaction.guild.name}`)
        .setImage(banner)
        .addFields({ name: 'Lien', value: `[Télécharger](${banner})` });
      await interaction.reply({ embeds: [embed] });
    }
  },
};
