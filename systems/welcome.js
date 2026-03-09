// ============================================
// SYSTÈME DE BIENVENUE / AU REVOIR
// ============================================
const { EmbedBuilder } = require('discord.js');
const db = require('./database');

async function handleWelcome(member) {
  const config = db.getConfig(member.guild.id);
  if (!config.welcomeChannelId) return;

  const channel = member.guild.channels.cache.get(config.welcomeChannelId);
  if (!channel) return;

  const memberCount = member.guild.memberCount;
  const message = (config.welcomeMessage || 'Bienvenue sur **{server}**, {user} ! Tu es le membre numéro **{count}** 🎉')
    .replace('{user}', `${member}`)
    .replace('{username}', member.user.username)
    .replace('{server}', member.guild.name)
    .replace('{count}', memberCount);

  const embed = new EmbedBuilder()
    .setColor(config.welcomeColor || 0x5865f2)
    .setTitle(`👋 Bienvenue sur ${member.guild.name} !`)
    .setDescription(message)
    .setThumbnail(member.user.displayAvatarURL({ size: 256 }))
    .addFields(
      { name: '👤 Compte créé le', value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:D>`, inline: true },
      { name: '👥 Membres', value: `${memberCount}`, inline: true },
    )
    .setImage(config.welcomeBanner || null)
    .setTimestamp();

  await channel.send({ embeds: [embed] });

  // Rôle automatique
  if (config.autoRoleId) {
    const role = member.guild.roles.cache.get(config.autoRoleId);
    if (role) await member.roles.add(role).catch(() => {});
  }
}

async function handleGoodbye(member) {
  const config = db.getConfig(member.guild.id);
  if (!config.goodbyeChannelId) return;

  const channel = member.guild.channels.cache.get(config.goodbyeChannelId);
  if (!channel) return;

  const message = (config.goodbyeMessage || '**{username}** a quitté le serveur. À bientôt peut-être...')
    .replace('{user}', `${member}`)
    .replace('{username}', member.user.username)
    .replace('{server}', member.guild.name);

  const embed = new EmbedBuilder()
    .setColor(0x808080)
    .setTitle('👋 Au revoir !')
    .setDescription(message)
    .setThumbnail(member.user.displayAvatarURL({ size: 256 }))
    .addFields({ name: '👥 Membres restants', value: `${member.guild.memberCount}`, inline: true })
    .setTimestamp();

  await channel.send({ embeds: [embed] });
}

module.exports = { handleWelcome, handleGoodbye };
