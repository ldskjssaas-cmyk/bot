const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder().setName('unmute').setDescription('Retire le mute d\'un membre')
    .addUserOption(opt => opt.setName('membre').setDescription('Le membre').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
  async execute(interaction) {
    const target = interaction.options.getMember('membre');
    if (!target) return interaction.reply({ content: '❌ Membre introuvable.', ephemeral: true });
    await target.timeout(null);
    await interaction.reply({ embeds: [new EmbedBuilder().setColor(0x00ff00).setTitle('🔊 Mute retiré').setDescription(`${target.user.tag} peut de nouveau parler.`)] });
  },
};
