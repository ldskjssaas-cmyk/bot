// ============================================
// SYSTÈME AUTOMOD AMÉLIORÉ
// ============================================
const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('./database');

const spamTracker = new Map();
const warnCount = new Map();

const defaultConfig = {
  antiSpam: true, spamThreshold: 5, spamInterval: 5000,
  antiLink: true, allowedDomains: ['discord.gg', 'discord.com'],
  antiMention: true, maxMentions: 5,
  antiCaps: true, capsPercent: 70, minCapsLength: 10,
  muteOnSpam: true, muteDuration: 5 * 60 * 1000,
};

function getConfig(guildId) {
  const saved = db.getConfig(guildId);
  return { ...defaultConfig, ...saved };
}

function setConfig(guildId, key, value) {
  db.setConfig(guildId, key, value);
}

const urlRegex = /(https?:\/\/|www\.|discord\.gg\/)[^\s]+/gi;

async function punish(member, reason, config, channel) {
  const key = `${member.guild.id}-${member.id}`;
  const warns = (warnCount.get(key) || 0) + 1;
  warnCount.set(key, warns);

  // Log dans la db
  const sanctions = db.load('sanctions');
  const sKey = key;
  if (!sanctions[sKey]) sanctions[sKey] = [];
  sanctions[sKey].push({ type: '🤖 AutoMod', raison: reason, date: new Date().toISOString(), mod: 'AutoMod' });
  db.save('sanctions', sanctions);

  try {
    await member.user.send(`⚠️ AutoMod sur **${member.guild.name}** : ${reason}`).catch(() => {});
    if (warns >= 3 && member.moderatable) {
      await member.ban({ reason: `AutoMod: 3 infractions - ${reason}` });
      channel?.send({ embeds: [new EmbedBuilder().setColor(0xff0000).setTitle('🔨 AutoMod — Ban').setDescription(`${member.user.tag} banni après 3 infractions.`).setTimestamp()] });
    } else if (warns >= 2 && member.moderatable && config.muteOnSpam) {
      await member.timeout(config.muteDuration, `AutoMod: ${reason}`);
      channel?.send({ embeds: [new EmbedBuilder().setColor(0xff9900).setTitle('🔇 AutoMod — Mute 5min').setDescription(`${member.user.tag} muté (infraction ${warns}/3).`).setTimestamp()] });
    } else {
      channel?.send({ embeds: [new EmbedBuilder().setColor(0xffcc00).setTitle('⚠️ AutoMod — Avertissement').setDescription(`${member.user.tag} : ${reason} (${warns}/3)`).setTimestamp()] });
    }
  } catch (err) { console.error('AutoMod punish error:', err); }
}

async function handleMessage(message) {
  if (message.author.bot || !message.guild) return;
  const member = message.member;
  if (!member) return;
  if (member.permissions.has(PermissionFlagsBits.Administrator)) return;

  const config = getConfig(message.guild.id);
  const content = message.content;

  // ─── FILTRE DE MOTS ───
  const bannedWords = config.bannedWords || [];
  if (bannedWords.length && bannedWords.some(w => content.toLowerCase().includes(w))) {
    await message.delete().catch(() => {});
    await punish(member, 'Mot interdit', config, message.channel);
    return;
  }

  // ─── ANTI-LIEN ───
  if (config.antiLink) {
    urlRegex.lastIndex = 0;
    if (urlRegex.test(content)) {
      const urls = content.match(/(https?:\/\/|www\.|discord\.gg\/)[^\s]+/gi) || [];
      const hasBlocked = urls.some(url => !config.allowedDomains.some(d => url.includes(d)));
      if (hasBlocked) {
        await message.delete().catch(() => {});
        await punish(member, 'Lien non autorisé', config, message.channel);
        return;
      }
    }
  }

  // ─── ANTI-MENTION ───
  if (config.antiMention && message.mentions.users.size >= config.maxMentions) {
    await message.delete().catch(() => {});
    await punish(member, `Trop de mentions (${message.mentions.users.size})`, config, message.channel);
    return;
  }

  // ─── ANTI-CAPS ───
  if (config.antiCaps && content.length >= config.minCapsLength) {
    const letters = content.replace(/[^a-zA-Z]/g, '');
    if (letters.length > 0) {
      const caps = content.replace(/[^A-Z]/g, '').length;
      if ((caps / letters.length) * 100 >= config.capsPercent) {
        await message.delete().catch(() => {});
        await punish(member, 'Trop de majuscules', config, message.channel);
        return;
      }
    }
  }

  // ─── ANTI-SPAM ───
  if (config.antiSpam) {
    const key = `${message.guild.id}-${message.author.id}`;
    const now = Date.now();
    const tracker = spamTracker.get(key) || { timestamps: [] };
    tracker.timestamps = tracker.timestamps.filter(t => now - t < config.spamInterval);
    tracker.timestamps.push(now);
    spamTracker.set(key, tracker);
    if (tracker.timestamps.length >= config.spamThreshold) {
      tracker.timestamps = [];
      spamTracker.set(key, tracker);
      await punish(member, 'Spam détecté', config, message.channel);
    }
  }
}

module.exports = { handleMessage, getConfig, setConfig };
