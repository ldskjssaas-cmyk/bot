// ============================================
// SYSTÈME ANTI-RAID + VÉRIFICATION
// ============================================
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');

const joinTracker = new Map();   // guildId -> [timestamps]
const verifyConfig = new Map();  // guildId -> { roleId, channelId, enabled }
const raidConfig = new Map();    // guildId -> { threshold, interval, lockdown }

function getRaidConfig(guildId) {
  return raidConfig.get(guildId) || { threshold: 10, interval: 10000, lockdown: false };
}

function getVerifyConfig(guildId) {
  return verifyConfig.get(guildId) || { roleId: null, channelId: null, enabled: false };
}

async function handleJoin(member, client) {
  const { guild } = member;
  const config = getRaidConfig(guild.id);
  const vConfig = getVerifyConfig(guild.id);

  // ─── ANTI-RAID ───
  const now = Date.now();
  const joins = joinTracker.get(guild.id) || [];
  const recentJoins = joins.filter(t => now - t < config.interval);
  recentJoins.push(now);
  joinTracker.set(guild.id, recentJoins);

  if (recentJoins.length >= config.threshold) {
    config.lockdown = true;
    raidConfig.set(guild.id, config);

    // Notifie les admins
    const logCh = guild.channels.cache.find(c => c.name.includes('log') || c.name.includes('mod'));
    if (logCh) {
      await logCh.send({ embeds: [new EmbedBuilder()
        .setColor(0xff0000)
        .setTitle('🚨 RAID DÉTECTÉ !')
        .setDescription(`**${recentJoins.length} membres** ont rejoint en moins de **${config.interval/1000}s** !\nLe serveur est en mode **lockdown**.\nUtilise \`/antiraid unlock\` pour le désactiver.`)
        .setTimestamp()] });
    }

    // Kick les nouveaux arrivants pendant le lockdown
    try { await member.kick('Anti-raid: lockdown actif'); } catch {}
    return;
  }

  if (config.lockdown) {
    try { await member.kick('Anti-raid: lockdown actif'); } catch {}
    return;
  }

  // ─── VÉRIFICATION ───
  if (vConfig.enabled && vConfig.channelId) {
    try {
      const verifyChannel = guild.channels.cache.get(vConfig.channelId);
      if (!verifyChannel) return;

      const embed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle('✅ Bienvenue !')
        .setDescription(`Bienvenue ${member} sur **${guild.name}** !\nClique sur le bouton ci-dessous pour vérifier que tu n'es pas un bot.`)
        .setThumbnail(member.user.displayAvatarURL());

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`verify_${member.id}`).setLabel('Je ne suis pas un bot !').setEmoji('✅').setStyle(ButtonStyle.Success),
      );

      const msg = await verifyChannel.send({ content: `${member}`, embeds: [embed], components: [row] });
      setTimeout(() => msg.delete().catch(() => {}), 5 * 60 * 1000);
    } catch (err) {
      console.error('Verify error:', err);
    }
  }
}

async function handleVerifyButton(interaction) {
  const { guild, customId, user } = interaction;
  if (!customId.startsWith('verify_')) return;

  const targetId = customId.replace('verify_', '');
  if (user.id !== targetId) {
    return interaction.reply({ content: '❌ Ce bouton n\'est pas pour toi !', ephemeral: true });
  }

  const vConfig = getVerifyConfig(guild.id);
  if (!vConfig.roleId) {
    return interaction.reply({ content: '❌ Aucun rôle de vérification configuré.', ephemeral: true });
  }

  const member = guild.members.cache.get(user.id);
  if (!member) return;

  try {
    await member.roles.add(vConfig.roleId);
    await interaction.reply({ content: '✅ Tu es vérifié ! Bienvenue sur le serveur !', ephemeral: true });
    await interaction.message.delete().catch(() => {});
  } catch (err) {
    await interaction.reply({ content: `❌ Erreur : ${err.message}`, ephemeral: true });
  }
}

module.exports = { handleJoin, handleVerifyButton, getRaidConfig, getVerifyConfig, raidConfig, verifyConfig };
