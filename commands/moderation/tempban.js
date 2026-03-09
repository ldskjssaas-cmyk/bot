const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { logAction } = require('../../systems/logs');
const db = require('../../systems/database');

module.exports = {
  data: new SlashCommandBuilder().setName('tempban').setDescription('Bannit temporairement un membre')
    .addUserOption(opt => opt.setName('membre').setDescription('Le membre').setRequired(true))
    .addIntegerOption(opt => opt.setName('heures').setDescription('Durée en heures').setRequired(true).setMinValue(1).setMaxValue(720))
    .addStringOption(opt => opt.setName('raison').setDescription('Raison'))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  async execute(interaction, client) {
    const target = interaction.options.getMember('membre');
    const heures = interaction.options.getInteger('heures');
    const raison = interaction.options.getString('raison') || 'Aucune raison';
    if (!target?.bannable) return interaction.reply({ content: '❌ Impossible de bannir ce membre.', ephemeral: true });

    await target.ban({ reason: `TempBan ${heures}h: ${raison}` });
    await logAction({ guild: interaction.guild, action: `⏱️ TempBan (${heures}h)`, target: target.user, moderator: interaction.user, reason: raison, color: 0xff4500 });

    const embed = new EmbedBuilder().setColor(0xff4500).setTitle('⏱️ Bannissement temporaire')
      .addFields(
        { name: 'Membre', value: target.user.tag, inline: true },
        { name: 'Durée', value: `${heures} heure(s)`, inline: true },
        { name: 'Fin', value: `<t:${Math.floor((Date.now() + heures * 3600000) / 1000)}:R>`, inline: true },
        { name: 'Raison', value: raison },
      ).setTimestamp();
    await interaction.reply({ embeds: [embed] });

    // Unban automatique
    setTimeout(async () => {
      try {
        await interaction.guild.members.unban(target.id, 'TempBan expiré');
        const ch = interaction.channel;
        await ch.send({ embeds: [new EmbedBuilder().setColor(0x00ff00).setDescription(`✅ **${target.user.tag}** a été débanni automatiquement (TempBan expiré).`)] });
      } catch {}
    }, heures * 3600000);
  },
};
