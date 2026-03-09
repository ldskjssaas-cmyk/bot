const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder().setName('purgeuser').setDescription('Supprime les messages d\'un membre spécifique')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addUserOption(opt => opt.setName('membre').setDescription('Le membre').setRequired(true))
    .addIntegerOption(opt => opt.setName('nombre').setDescription('Nombre de messages à scanner (max 200)').setMinValue(1).setMaxValue(200)),

  async execute(interaction) {
    const target = interaction.options.getUser('membre');
    const limit = interaction.options.getInteger('nombre') || 100;
    await interaction.deferReply({ ephemeral: true });

    const messages = await interaction.channel.messages.fetch({ limit });
    const toDelete = messages.filter(m => m.author.id === target.id && Date.now() - m.createdTimestamp < 1209600000);

    if (!toDelete.size) return interaction.editReply('❌ Aucun message récent de cet utilisateur.');

    await interaction.channel.bulkDelete(toDelete, true);
    await interaction.editReply({ embeds: [new EmbedBuilder().setColor(0xff6600)
      .setDescription(`🗑️ **${toDelete.size}** message(s) de **${target.tag}** supprimé(s).`)] });
  },
};
