const { EmbedBuilder } = require('discord.js');
const db = require('./database');

const starredMessages = new Map(); // messageId -> starboard message id

async function handleStar(reaction, user) {
  if (user.bot) return;
  if (reaction.partial) await reaction.fetch().catch(() => {});
  if (reaction.message.partial) await reaction.message.fetch().catch(() => {});

  const guild = reaction.message.guild;
  if (!guild) return;
  const config = db.getConfig(guild.id);
  if (!config.starboardChannelId) return;
  if (reaction.emoji.name !== '⭐') return;
  if (reaction.message.channelId === config.starboardChannelId) return;

  const threshold = config.starboardThreshold || 3;
  const count = reaction.count;

  const starboardChannel = guild.channels.cache.get(config.starboardChannelId);
  if (!starboardChannel) return;

  const msg = reaction.message;
  const existingId = starredMessages.get(msg.id);

  const embed = new EmbedBuilder()
    .setColor(0xffd700)
    .setAuthor({ name: msg.author.username, iconURL: msg.author.displayAvatarURL() })
    .setDescription(msg.content || null)
    .addFields(
      { name: '📍 Source', value: `[Aller au message](${msg.url})`, inline: true },
      { name: '📁 Salon', value: `<#${msg.channelId}>`, inline: true },
    )
    .setTimestamp(msg.createdTimestamp);

  if (msg.attachments.size > 0) {
    const img = msg.attachments.find(a => a.contentType?.startsWith('image/'));
    if (img) embed.setImage(img.url);
  }

  const content = `⭐ **${count}** | <#${msg.channelId}>`;

  if (count >= threshold) {
    if (existingId) {
      const existing = await starboardChannel.messages.fetch(existingId).catch(() => null);
      if (existing) await existing.edit({ content, embeds: [embed] }).catch(() => {});
    } else {
      const sent = await starboardChannel.send({ content, embeds: [embed] }).catch(() => null);
      if (sent) starredMessages.set(msg.id, sent.id);
    }
  }
}

module.exports = { handleStar };
