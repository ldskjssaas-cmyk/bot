const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../../systems/database');

module.exports = {
  data: new SlashCommandBuilder().setName('reactionrole').setDescription('Gestion des rôles par réaction')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(sub => sub.setName('add').setDescription('Ajoute un rôle par réaction')
      .addStringOption(opt => opt.setName('messageid').setDescription('ID du message').setRequired(true))
      .addStringOption(opt => opt.setName('emoji').setDescription('L\'emoji à réagir').setRequired(true))
      .addRoleOption(opt => opt.setName('role').setDescription('Le rôle à donner').setRequired(true)))
    .addSubcommand(sub => sub.setName('remove').setDescription('Supprime un rôle par réaction')
      .addStringOption(opt => opt.setName('messageid').setDescription('ID du message').setRequired(true))
      .addStringOption(opt => opt.setName('emoji').setDescription('L\'emoji').setRequired(true)))
    .addSubcommand(sub => sub.setName('list').setDescription('Liste les rôles par réaction configurés')),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const guildId = interaction.guild.id;

    if (sub === 'add') {
      const msgId = interaction.options.getString('messageid');
      const emoji = interaction.options.getString('emoji');
      const role = interaction.options.getRole('role');
      db.setReactionRole(guildId, msgId, emoji, role.id);
      await interaction.reply({ content: `✅ Réaction ${emoji} → ${role} configuré sur le message \`${msgId}\``, ephemeral: true });
    }

    if (sub === 'remove') {
      const msgId = interaction.options.getString('messageid');
      const emoji = interaction.options.getString('emoji');
      db.removeReactionRole(guildId, msgId, emoji);
      await interaction.reply({ content: `✅ Rôle par réaction supprimé.`, ephemeral: true });
    }

    if (sub === 'list') {
      const rr = db.getReactionRoles(guildId);
      if (!Object.keys(rr).length) return interaction.reply({ content: '❌ Aucun rôle par réaction configuré.', ephemeral: true });
      const lines = Object.entries(rr).flatMap(([msgId, emojis]) =>
        Object.entries(emojis).map(([emoji, roleId]) => `Message \`${msgId}\` | ${emoji} → <@&${roleId}>`)
      );
      await interaction.reply({ content: lines.join('\n'), ephemeral: true });
    }
  },
};
