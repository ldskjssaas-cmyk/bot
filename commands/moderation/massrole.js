const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder().setName('massrole').setDescription('Donne/retire un rôle à tous les membres')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption(opt => opt.setName('action').setDescription('Action').setRequired(true)
      .addChoices({ name: '➕ Donner', value: 'add' }, { name: '➖ Retirer', value: 'remove' }))
    .addRoleOption(opt => opt.setName('role').setDescription('Le rôle').setRequired(true))
    .addBooleanOption(opt => opt.setName('bots').setDescription('Inclure les bots ? (défaut: non)')),

  async execute(interaction) {
    const action = interaction.options.getString('action');
    const role = interaction.options.getRole('role');
    const includeBots = interaction.options.getBoolean('bots') ?? false;

    await interaction.deferReply({ ephemeral: true });
    await interaction.guild.members.fetch();

    const members = interaction.guild.members.cache.filter(m => includeBots ? true : !m.user.bot);
    let count = 0;

    const embed = new EmbedBuilder().setColor(0xffcc00)
      .setTitle(`⏳ MassRole en cours...`)
      .setDescription(`${action === 'add' ? 'Ajout de' : 'Retrait de'} ${role} sur **${members.size}** membres...`);
    await interaction.editReply({ embeds: [embed] });

    for (const [, member] of members) {
      try {
        if (action === 'add' && !member.roles.cache.has(role.id)) {
          await member.roles.add(role);
          count++;
        } else if (action === 'remove' && member.roles.cache.has(role.id)) {
          await member.roles.remove(role);
          count++;
        }
        await new Promise(r => setTimeout(r, 300)); // Rate limit protection
      } catch {}
    }

    const done = new EmbedBuilder().setColor(0x00ff00)
      .setTitle('✅ MassRole terminé')
      .addFields(
        { name: 'Rôle', value: `${role}`, inline: true },
        { name: 'Action', value: action === 'add' ? '➕ Ajouté' : '➖ Retiré', inline: true },
        { name: 'Membres affectés', value: `**${count}**`, inline: true },
      )
      .setTimestamp();
    await interaction.editReply({ embeds: [done] });
  },
};
