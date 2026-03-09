const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder().setName('nickname').setDescription('Changer le pseudo d\'un membre')
    .addUserOption(opt => opt.setName('membre').setDescription('Le membre').setRequired(true))
    .addStringOption(opt => opt.setName('pseudo').setDescription('Nouveau pseudo (vide = reset)').setMaxLength(32))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageNicknames),

  async execute(interaction) {
    const member = interaction.options.getMember('membre');
    const nick = interaction.options.getString('pseudo') || null;
    if (!member?.manageable) return interaction.reply({ content: '❌ Je ne peux pas modifier ce membre.', ephemeral: true });
    const old = member.nickname || member.user.username;
    await member.setNickname(nick);
    await interaction.reply({ embeds: [new EmbedBuilder().setColor(0x5865f2).setDescription(`✅ Pseudo de **${old}** → **${nick || member.user.username}**`)] });
  },
};
