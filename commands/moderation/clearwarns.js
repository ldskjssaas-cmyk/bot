const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../../systems/database');

module.exports = {
  data: new SlashCommandBuilder().setName('clearwarns').setDescription('Efface les avertissements d\'un membre')
    .addUserOption(opt => opt.setName('membre').setDescription('Le membre').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const user = interaction.options.getUser('membre');
    db.clearWarns(interaction.guild.id, user.id);
    await interaction.reply({ content: `✅ Avertissements de **${user.username}** effacés.`, ephemeral: true });
  },
};
