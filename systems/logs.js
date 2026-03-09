// ============================================
// SYSTÈME DE LOGS DE MODÉRATION
// ============================================
const { EmbedBuilder, AuditLogEvent } = require('discord.js');

const logChannels = new Map(); // guildId -> channelId

function setLogChannel(guildId, channelId) {
  logChannels.set(guildId, channelId);
}

function getLogChannel(guildId) {
  return logChannels.get(guildId);
}

async function sendLog(guild, embed) {
  const channelId = logChannels.get(guild.id);
  if (!channelId) return;
  try {
    const channel = guild.channels.cache.get(channelId);
    if (channel) await channel.send({ embeds: [embed] });
  } catch (err) {
    console.error('Log error:', err);
  }
}

async function logAction({ guild, action, target, moderator, reason, color = 0x5865f2, extra = [] }) {
  const embed = new EmbedBuilder()
    .setColor(color)
    .setTitle(`📋 ${action}`)
    .setThumbnail(target?.displayAvatarURL?.() || null)
    .addFields(
      { name: '👤 Utilisateur', value: target ? `${target.tag || target} (${target.id || '?'})` : 'Inconnu', inline: true },
      { name: '🛡️ Modérateur', value: moderator ? `${moderator.tag} (${moderator.id})` : 'Système', inline: true },
      { name: '📝 Raison', value: reason || 'Aucune raison', inline: false },
      ...extra,
    )
    .setTimestamp()
    .setFooter({ text: `ID: ${target?.id || '?'}` });

  await sendLog(guild, embed);
}

module.exports = { setLogChannel, getLogChannel, sendLog, logAction };
