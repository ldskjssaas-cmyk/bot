const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder().setName('say').setDescription('Fait parler le bot')
    .addStringOption(opt => opt.setName('message').setDescription('Le message').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
  async execute(interaction) {
    const message = interaction.options.getString('message');
    await interaction.reply({ content: '✅ Message envoyé !', ephemeral: true });
    await interaction.channel.send(message);
  },
};
