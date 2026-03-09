const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../../systems/database');
const { logAction } = require('../../systems/logs');

module.exports = {
  data: new SlashCommandBuilder().setName('warn').setDescription('Avertit un membre')
    .addUserOption(opt => opt.setName('membre').setDescription('Le membre').setRequired(true))
    .addStringOption(opt => opt.setName('raison').setDescription('La raison').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    const target = interaction.options.getUser('membre');
    const raison = interaction.options.getString('raison');
    const warns = db.addWarn(interaction.guild.id, target.id, {
      raison, date: new Date().toISOString(), mod: interaction.user.tag
    });
    await logAction({ guild: interaction.guild, action: '⚠️ Warn', target, moderator: interaction.user, reason: raison, color: 0xffcc00, extra: [{ name: 'Total warns', value: `${warns.length}` }] });
    const embed = new EmbedBuilder().setColor(0xffcc00).setTitle('⚠️ Avertissement')
      .addFields(
        { name: 'Membre', value: target.tag, inline: true },
        { name: 'Modérateur', value: interaction.user.tag, inline: true },
        { name: 'Raison', value: raison },
        { name: 'Total', value: `${warns.length} avertissement(s)` },
      );
    await interaction.reply({ embeds: [embed] });
    try { await target.send(`⚠️ Avertissement sur **${interaction.guild.name}** : ${raison}`); } catch {}
  },
};
