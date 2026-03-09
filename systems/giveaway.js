// ============================================
// SYSTÈME DE GIVEAWAY
// ============================================
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const giveaways = new Map(); // messageId -> giveaway data

function formatTime(ms) {
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}j`;
}

async function startGiveaway(channel, { prize, duration, winners, hostedBy }) {
  const endsAt = Date.now() + duration;

  const embed = new EmbedBuilder()
    .setColor(0xff6b6b)
    .setTitle(`🎉 GIVEAWAY — ${prize}`)
    .setDescription(`Clique sur 🎉 pour participer !\n\n**Fin dans :** ${formatTime(duration)}\n**Gagnants :** ${winners}\n**Organisé par :** ${hostedBy}`)
    .setFooter({ text: `Fin le` })
    .setTimestamp(endsAt);

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('giveaway_enter').setLabel('Participer').setEmoji('🎉').setStyle(ButtonStyle.Primary),
  );

  const msg = await channel.send({ embeds: [embed], components: [row] });

  const data = { prize, endsAt, winners, hostedBy: hostedBy.toString(), participants: [], messageId: msg.id, channelId: channel.id, ended: false };
  giveaways.set(msg.id, data);

  // Timer pour la fin
  setTimeout(() => endGiveaway(msg.id, channel.client), duration);

  return msg;
}

async function handleGiveawayButton(interaction) {
  const data = giveaways.get(interaction.message.id);
  if (!data || data.ended) return interaction.reply({ content: '❌ Ce giveaway est terminé.', ephemeral: true });

  const userId = interaction.user.id;
  if (data.participants.includes(userId)) {
    data.participants = data.participants.filter(id => id !== userId);
    await interaction.reply({ content: '✅ Tu t\'es désinscipt du giveaway.', ephemeral: true });
  } else {
    data.participants.push(userId);
    await interaction.reply({ content: `🎉 Tu participes au giveaway **${data.prize}** ! (${data.participants.length} participants)`, ephemeral: true });
  }
  giveaways.set(interaction.message.id, data);
}

async function endGiveaway(messageId, client) {
  const data = giveaways.get(messageId);
  if (!data || data.ended) return;
  data.ended = true;
  giveaways.set(messageId, data);

  try {
    const channel = await client.channels.fetch(data.channelId);
    const msg = await channel.messages.fetch(messageId);

    if (data.participants.length === 0) {
      const embed = new EmbedBuilder().setColor(0x808080).setTitle(`🎉 GIVEAWAY TERMINÉ — ${data.prize}`).setDescription('Aucun participant. Pas de gagnant.');
      await msg.edit({ embeds: [embed], components: [] });
      return;
    }

    const shuffled = [...data.participants].sort(() => Math.random() - 0.5);
    const winnerIds = shuffled.slice(0, Math.min(data.winners, shuffled.length));
    const winnerMentions = winnerIds.map(id => `<@${id}>`).join(', ');

    const embed = new EmbedBuilder()
      .setColor(0xffd700)
      .setTitle(`🎉 GIVEAWAY TERMINÉ — ${data.prize}`)
      .setDescription(`**Gagnant(s) :** ${winnerMentions}\n**Participants :** ${data.participants.length}\n**Organisé par :** ${data.hostedBy}`)
      .setTimestamp();

    await msg.edit({ embeds: [embed], components: [] });
    await channel.send(`🎉 Félicitations ${winnerMentions} ! Vous avez gagné **${data.prize}** !`);
  } catch (err) {
    console.error('Giveaway end error:', err);
  }
}

module.exports = { startGiveaway, handleGiveawayButton, endGiveaway, giveaways };
