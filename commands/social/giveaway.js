const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { startGiveaway, endGiveaway, giveaways } = require('../../systems/giveaway');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('giveaway')
    .setDescription('Gestion des giveaways')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand(sub => sub.setName('start').setDescription('Lance un giveaway')
      .addStringOption(opt => opt.setName('lot').setDescription('Ce qu\'on gagne').setRequired(true))
      .addIntegerOption(opt => opt.setName('duree').setDescription('Durée en minutes').setRequired(true).setMinValue(1))
      .addIntegerOption(opt => opt.setName('gagnants').setDescription('Nombre de gagnants').setRequired(true).setMinValue(1).setMaxValue(10)))
    .addSubcommand(sub => sub.setName('end').setDescription('Termine un giveaway immédiatement')
      .addStringOption(opt => opt.setName('messageid').setDescription('ID du message du giveaway').setRequired(true)))
    .addSubcommand(sub => sub.setName('reroll').setDescription('Reroll les gagnants')
      .addStringOption(opt => opt.setName('messageid').setDescription('ID du message').setRequired(true))),

  async execute(interaction, client) {
    const sub = interaction.options.getSubcommand();

    if (sub === 'start') {
      const prize = interaction.options.getString('lot');
      const duration = interaction.options.getInteger('duree') * 60 * 1000;
      const winners = interaction.options.getInteger('gagnants');
      await interaction.deferReply({ ephemeral: true });
      await startGiveaway(interaction.channel, { prize, duration, winners, hostedBy: interaction.user });
      await interaction.editReply('✅ Giveaway lancé !');
    }

    if (sub === 'end') {
      const msgId = interaction.options.getString('messageid');
      await endGiveaway(msgId, client);
      await interaction.reply({ content: '✅ Giveaway terminé !', ephemeral: true });
    }

    if (sub === 'reroll') {
      const msgId = interaction.options.getString('messageid');
      const data = giveaways.get(msgId);
      if (!data || data.participants.length === 0) return interaction.reply({ content: '❌ Aucun participant trouvé.', ephemeral: true });
      data.ended = false;
      giveaways.set(msgId, data);
      await endGiveaway(msgId, client);
      await interaction.reply({ content: '🎉 Reroll effectué !', ephemeral: true });
    }
  },
};
