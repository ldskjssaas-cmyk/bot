const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { createTicketPanel, getTicketData, ticketData } = require('../../systems/ticket');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('Gestion des tickets')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(sub => sub.setName('setup').setDescription('Crée le panel de tickets dans ce salon'))
    .addSubcommand(sub => sub.setName('setrole').setDescription('Définit le rôle support')
      .addRoleOption(opt => opt.setName('role').setDescription('Rôle support').setRequired(true))),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const data = getTicketData(interaction.guild.id);

    if (sub === 'setup') {
      await createTicketPanel(interaction.channel, interaction.guild, data);
      await interaction.reply({ content: '✅ Panel de tickets créé !', ephemeral: true });
    }

    if (sub === 'setrole') {
      const role = interaction.options.getRole('role');
      data.supportRoleId = role.id;
      ticketData.set(interaction.guild.id, data);
      await interaction.reply({ content: `✅ Rôle support défini : ${role}`, ephemeral: true });
    }
  },
};
