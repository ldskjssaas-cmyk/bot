const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../../systems/database');

module.exports = {
  data: new SlashCommandBuilder().setName('warns').setDescription('Voir les avertissements d\'un membre')
    .addUserOption(opt => opt.setName('membre').setDescription('Le membre').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    const user = interaction.options.getUser('membre');
    const warns = db.getWarns(interaction.guild.id, user.id);
    if (!warns.length) return interaction.reply({ content: `✅ **${user.username}** n'a aucun avertissement.`, ephemeral: true });
    const embed = new EmbedBuilder().setColor(0xffcc00).setTitle(`⚠️ Avertissements de ${user.username}`)
      .setDescription(warns.map((w, i) => `**${i+1}.** ${w.raison}\n└ Par ${w.mod} — <t:${Math.floor(new Date(w.date).getTime()/1000)}:R>`).join('\n\n'))
      .setFooter({ text: `${warns.length} avertissement(s) au total` });
    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
