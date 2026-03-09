const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder().setName('roleinfo').setDescription('Infos sur un rôle')
    .addRoleOption(opt => opt.setName('role').setDescription('Le rôle').setRequired(true)),
  async execute(interaction) {
    const role = interaction.options.getRole('role');
    const embed = new EmbedBuilder().setColor(role.color || 0x5865f2).setTitle(`🎭 ${role.name}`)
      .addFields(
        { name: 'ID', value: role.id, inline: true },
        { name: 'Couleur', value: role.hexColor, inline: true },
        { name: 'Membres', value: `${role.members.size}`, inline: true },
        { name: 'Mentionnable', value: role.mentionable ? 'Oui' : 'Non', inline: true },
        { name: 'Créé le', value: `<t:${Math.floor(role.createdTimestamp / 1000)}:D>`, inline: true },
      );
    await interaction.reply({ embeds: [embed] });
  },
};
