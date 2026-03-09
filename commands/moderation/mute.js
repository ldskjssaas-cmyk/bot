const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder().setName('mute').setDescription('Rend muet un membre')
    .addUserOption(opt => opt.setName('membre').setDescription('Le membre').setRequired(true))
    .addIntegerOption(opt => opt.setName('minutes').setDescription('Durée en minutes (max 40320)').setMinValue(1).setMaxValue(40320))
    .addStringOption(opt => opt.setName('raison').setDescription('La raison'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
  async execute(interaction) {
    const target = interaction.options.getMember('membre');
    const minutes = interaction.options.getInteger('minutes') || 10;
    const raison = interaction.options.getString('raison') || 'Aucune raison';
    if (!target?.moderatable) return interaction.reply({ content: '❌ Impossible de muter ce membre.', ephemeral: true });
    await target.timeout(minutes * 60 * 1000, raison);
    await interaction.reply({ embeds: [new EmbedBuilder().setColor(0xff9900).setTitle('🔇 Membre muté')
      .addFields({ name: 'Membre', value: target.user.tag, inline: true }, { name: 'Durée', value: `${minutes} min`, inline: true }, { name: 'Raison', value: raison })] });
  },
};
