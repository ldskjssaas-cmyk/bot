const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder().setName('snipe').setDescription('Affiche le dernier message supprimé du salon'),
  async execute(interaction, client) {
    const snipes = client.snipes || new Map();
    const snipe = snipes.get(interaction.channel.id);
    if (!snipe) return interaction.reply({ content: '❌ Aucun message supprimé récemment dans ce salon.', ephemeral: true });
    await interaction.reply({ embeds: [new EmbedBuilder()
      .setColor(0xff6600)
      .setTitle('🔍 Message supprimé')
      .setDescription(snipe.content || '*[Aucun texte]*')
      .setAuthor({ name: snipe.author, iconURL: snipe.avatar })
      .setFooter({ text: `Supprimé` })
      .setTimestamp(snipe.timestamp)] });
  },
};
