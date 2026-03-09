const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder().setName('role').setDescription('Gestion des rôles d\'un membre')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addSubcommand(sub => sub.setName('add').setDescription('Ajoute un rôle')
      .addUserOption(opt => opt.setName('membre').setDescription('Le membre').setRequired(true))
      .addRoleOption(opt => opt.setName('role').setDescription('Le rôle').setRequired(true)))
    .addSubcommand(sub => sub.setName('remove').setDescription('Retire un rôle')
      .addUserOption(opt => opt.setName('membre').setDescription('Le membre').setRequired(true))
      .addRoleOption(opt => opt.setName('role').setDescription('Le rôle').setRequired(true)))
    .addSubcommand(sub => sub.setName('list').setDescription('Liste les rôles d\'un membre')
      .addUserOption(opt => opt.setName('membre').setDescription('Le membre').setRequired(true))),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const member = interaction.options.getMember('membre');
    const role = interaction.options.getRole('role');

    if (sub === 'add') {
      if (member.roles.cache.has(role.id)) return interaction.reply({ content: '❌ Ce membre a déjà ce rôle.', ephemeral: true });
      await member.roles.add(role);
      await interaction.reply({ embeds: [new EmbedBuilder().setColor(0x00ff00).setDescription(`✅ Rôle ${role} ajouté à **${member.user.username}**`)] });
    }
    if (sub === 'remove') {
      if (!member.roles.cache.has(role.id)) return interaction.reply({ content: '❌ Ce membre n\'a pas ce rôle.', ephemeral: true });
      await member.roles.remove(role);
      await interaction.reply({ embeds: [new EmbedBuilder().setColor(0xff0000).setDescription(`✅ Rôle ${role} retiré de **${member.user.username}**`)] });
    }
    if (sub === 'list') {
      const roles = member.roles.cache.filter(r => r.id !== interaction.guild.id).sort((a, b) => b.position - a.position);
      const embed = new EmbedBuilder().setColor(0x5865f2).setTitle(`🎭 Rôles de ${member.user.username}`)
        .setDescription(roles.map(r => `${r}`).join(', ') || 'Aucun rôle')
        .setFooter({ text: `${roles.size} rôle(s)` });
      await interaction.reply({ embeds: [embed], ephemeral: true });
    }
  },
};
