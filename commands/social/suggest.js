const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');
const db = require('../../systems/database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('suggest')
    .setDescription('Faire une suggestion ou gérer le salon')
    .addSubcommand(sub =>
      sub
        .setName('add')
        .setDescription('Envoyer une suggestion')
        .addStringOption(opt =>
          opt
            .setName('suggestion')
            .setDescription('Ta suggestion')
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub
        .setName('setchannel')
        .setDescription('Définit le salon de suggestions')
        .addChannelOption(opt =>
          opt
            .setName('salon')
            .setDescription('Le salon')
            .setRequired(true)
        )
    ),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const guildId = interaction.guild.id;

    // ── /suggest setchannel ──────────────────────────────────────────────────
    if (sub === 'setchannel') {
      if (!interaction.memberPermissions.has(PermissionFlagsBits.Administrator)) {
        return interaction.reply({
          content: '❌ Tu dois être **Administrateur** pour utiliser cette commande.',
          ephemeral: true,
        });
      }

      const channel = interaction.options.getChannel('salon');
      db.setConfig(guildId, 'suggestionChannelId', channel.id);

      return interaction.reply({
        content: `✅ Salon de suggestions défini : ${channel}`,
        ephemeral: true,
      });
    }

    // ── /suggest add ─────────────────────────────────────────────────────────
    if (sub === 'add') {
      const suggestion = interaction.options.getString('suggestion');
      const config = db.getConfig(guildId);
      const channelId = config?.suggestionChannelId;

      if (!channelId) {
        return interaction.reply({
          content: '❌ Aucun salon de suggestions configuré. Utilise `/suggest setchannel`.',
          ephemeral: true,
        });
      }

      const channel = interaction.guild.channels.cache.get(channelId);
      if (!channel) {
        return interaction.reply({
          content: '❌ Salon introuvable. Reconfigure-le avec `/suggest setchannel`.',
          ephemeral: true,
        });
      }

      const embed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle('💡 Nouvelle suggestion')
        .setDescription(suggestion)
        .addFields(
          { name: '👤 Proposé par', value: `${interaction.user}`, inline: true },
          { name: '🗳️ Votes',       value: '👍 0  |  👎 0',       inline: true },
          { name: '📊 Statut',      value: '🟡 En attente',        inline: true },
        )
        .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
        .setFooter({ text: `ID : ${interaction.user.id}` })
        .setTimestamp();

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('suggest_up')
          .setLabel('0')
          .setEmoji('👍')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId('suggest_down')
          .setLabel('0')
          .setEmoji('👎')
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId('suggest_approve')
          .setLabel('Approuver')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('suggest_reject')
          .setLabel('Rejeter')
          .setStyle(ButtonStyle.Secondary),
      );

      await channel.send({ embeds: [embed], components: [row] });

      return interaction.reply({
        content: '✅ Ta suggestion a bien été envoyée !',
        ephemeral: true,
      });
    }
  },
};
