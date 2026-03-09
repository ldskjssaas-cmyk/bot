const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder().setName('lock').setDescription('Verrouille / déverrouille le salon')
    .addStringOption(opt => opt.setName('action').setDescription('Action').setRequired(true)
      .addChoices({ name: '🔒 Verrouiller', value: 'lock' }, { name: '🔓 Déverrouiller', value: 'unlock' }))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
  async execute(interaction) {
    const action = interaction.options.getString('action');
    const everyone = interaction.guild.roles.everyone;
    if (action === 'lock') {
      await interaction.channel.permissionOverwrites.edit(everyone, { SendMessages: false });
      await interaction.reply({ embeds: [new EmbedBuilder().setColor(0xff0000).setDescription('🔒 Salon verrouillé.')] });
    } else {
      await interaction.channel.permissionOverwrites.edit(everyone, { SendMessages: null });
      await interaction.reply({ embeds: [new EmbedBuilder().setColor(0x00ff00).setDescription('🔓 Salon déverrouillé.')] });
    }
  },
};
