const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Supprime des messages en masse')
    .addIntegerOption((opt) =>
      opt
        .setName('nombre')
        .setDescription('Nombre de messages à supprimer (1-100)')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(100)
    )
    .addUserOption((opt) =>
      opt.setName('membre').setDescription('Supprimer uniquement les messages de ce membre')
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    const nombre = interaction.options.getInteger('nombre');
    const membre = interaction.options.getUser('membre');

    await interaction.deferReply({ ephemeral: true });

    let messages = await interaction.channel.messages.fetch({ limit: 100 });

    if (membre) {
      messages = messages.filter((m) => m.author.id === membre.id);
    }

    messages = [...messages.values()].slice(0, nombre);

    // Discord ne peut bulk delete que les messages de moins de 14 jours
    const recents = messages.filter(
      (m) => Date.now() - m.createdTimestamp < 14 * 24 * 60 * 60 * 1000
    );

    try {
      const deleted = await interaction.channel.bulkDelete(recents, true);
      const embed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle('🗑️ Messages supprimés')
        .setDescription(`**${deleted.size}** message(s) supprimé(s)${membre ? ` de ${membre.tag}` : ''}.`)
        .setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      await interaction.editReply({ content: `❌ Erreur : ${err.message}` });
    }
  },
};
