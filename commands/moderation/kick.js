const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { logAction } = require('../../systems/logs');

module.exports = {
  data: new SlashCommandBuilder().setName('kick').setDescription('Expulse un membre')
    .addUserOption(opt => opt.setName('membre').setDescription('Membre à expulser').setRequired(true))
    .addStringOption(opt => opt.setName('raison').setDescription('Raison'))
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

  async execute(interaction) {
    const target = interaction.options.getMember('membre');
    const raison = interaction.options.getString('raison') || 'Aucune raison';
    if (!target?.kickable) return interaction.reply({ content: '❌ Impossible de kick ce membre.', ephemeral: true });

    await target.kick(raison);
    await logAction({ guild: interaction.guild, action: '👢 Kick', target: target.user, moderator: interaction.user, reason: raison, color: 0xff6600 });
    await interaction.reply({ embeds: [new EmbedBuilder().setColor(0xff6600).setTitle('👢 Membre expulsé')
      .addFields({ name: 'Membre', value: target.user.tag, inline: true }, { name: 'Raison', value: raison })] });
  },
};
