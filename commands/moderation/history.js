const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../../systems/database');

module.exports = {
  data: new SlashCommandBuilder().setName('history').setDescription('Historique des sanctions d\'un membre')
    .addUserOption(opt => opt.setName('membre').setDescription('Le membre').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    const user = interaction.options.getUser('membre');
    const warns = db.getWarns(interaction.guild.id, user.id);
    const sanctions = db.load('sanctions')[`${interaction.guild.id}-${user.id}`] || [];
    const all = [...warns.map(w => ({ type: '⚠️ Warn', ...w })), ...sanctions].sort((a, b) => new Date(b.date) - new Date(a.date));

    if (!all.length) return interaction.reply({ content: `✅ **${user.username}** n'a aucun antécédent.`, ephemeral: true });

    const embed = new EmbedBuilder().setColor(0xff6600).setTitle(`📋 Historique — ${user.username}`)
      .setThumbnail(user.displayAvatarURL())
      .setDescription(all.slice(0, 10).map((s, i) =>
        `**${i + 1}.** ${s.type} — ${s.raison}\n└ Par \`${s.mod}\` — <t:${Math.floor(new Date(s.date).getTime() / 1000)}:R>`
      ).join('\n\n'))
      .setFooter({ text: `${all.length} sanction(s) au total` });
    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
