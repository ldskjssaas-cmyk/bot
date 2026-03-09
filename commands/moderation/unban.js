const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unban')
    .setDescription('Débannit un utilisateur')
    .addStringOption((opt) =>
      opt.setName('userid').setDescription("ID Discord de l'utilisateur").setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  async execute(interaction) {
    const userId = interaction.options.getString('userid');

    try {
      const bannedUser = await interaction.guild.bans.fetch(userId);
      if (!bannedUser) {
        return interaction.reply({ content: '❌ Cet utilisateur n\'est pas banni.', ephemeral: true });
      }

      await interaction.guild.members.unban(userId);
      const embed = new EmbedBuilder()
        .setColor(0x00ff00)
        .setTitle('✅ Utilisateur débanni')
        .addFields(
          { name: 'Utilisateur', value: `${bannedUser.user.tag}`, inline: true },
          { name: 'Modérateur', value: `${interaction.user.tag}`, inline: true },
        )
        .setTimestamp();
      await interaction.reply({ embeds: [embed] });
    } catch (err) {
      await interaction.reply({ content: `❌ Utilisateur introuvable ou déjà débanni.`, ephemeral: true });
    }
  },
};
