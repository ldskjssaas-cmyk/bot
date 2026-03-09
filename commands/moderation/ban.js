const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { logAction } = require('../../systems/logs');

module.exports = {
  data: new SlashCommandBuilder().setName('ban').setDescription('Bannit un membre')
    .addUserOption(opt => opt.setName('membre').setDescription('Membre à bannir').setRequired(true))
    .addStringOption(opt => opt.setName('raison').setDescription('Raison'))
    .addIntegerOption(opt => opt.setName('jours').setDescription('Supprimer messages (0-7)').setMinValue(0).setMaxValue(7))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  async execute(interaction) {
    const target = interaction.options.getMember('membre');
    const raison = interaction.options.getString('raison') || 'Aucune raison';
    const jours = interaction.options.getInteger('jours') ?? 0;
    if (!target?.bannable) return interaction.reply({ content: '❌ Impossible de bannir ce membre.', ephemeral: true });

    await target.ban({ reason: raison, deleteMessageDays: jours });
    await logAction({ guild: interaction.guild, action: '🔨 Ban', target: target.user, moderator: interaction.user, reason: raison, color: 0xff0000 });
    await interaction.reply({ embeds: [new EmbedBuilder().setColor(0xff0000).setTitle('🔨 Membre banni')
      .addFields({ name: 'Membre', value: target.user.tag, inline: true }, { name: 'Raison', value: raison })] });
  },
};
