// ============================================
// SYSTÈME DE TICKETS AVANCÉ
// ============================================
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits, ChannelType, StringSelectMenuBuilder } = require('discord.js');

const ticketData = new Map();

const CATEGORIES = [
  { label: '🛠️ Support', value: 'support', description: 'Aide technique ou générale' },
  { label: '🚨 Report', value: 'report', description: 'Signaler un membre' },
  { label: '🤝 Partenariat', value: 'partnership', description: 'Proposer un partenariat' },
  { label: '❓ Autre', value: 'other', description: 'Autre demande' },
];

function getTicketData(guildId) {
  return ticketData.get(guildId) || { categoryId: null, supportRoleId: null, counter: 0, logChannelId: null };
}

async function createTicketPanel(channel, guild, data) {
  const embed = new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle('🎫 Système de Support')
    .setDescription('Sélectionne la catégorie de ta demande pour ouvrir un ticket.')
    .setFooter({ text: guild.name });

  const row = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId('ticket_category')
      .setPlaceholder('Choisir une catégorie...')
      .addOptions(CATEGORIES),
  );

  await channel.send({ embeds: [embed], components: [row] });
}

async function handleCategorySelect(interaction) {
  const { guild, user, values } = interaction;
  const category = values[0];
  const categoryLabel = CATEGORIES.find(c => c.value === category)?.label || category;
  const data = getTicketData(guild.id);
  data.counter = (data.counter || 0) + 1;
  ticketData.set(guild.id, data);

  const existing = guild.channels.cache.find(c => c.name === `ticket-${user.username.toLowerCase().replace(/[^a-z0-9]/g, '')}`);
  if (existing) return interaction.reply({ content: `❌ Tu as déjà un ticket ouvert : ${existing}`, ephemeral: true });

  const permissionOverwrites = [
    { id: guild.roles.everyone, deny: [PermissionFlagsBits.ViewChannel] },
    { id: user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
  ];

  if (data.supportRoleId) {
    const supportRole = guild.roles.cache.get(data.supportRoleId);
    if (supportRole) permissionOverwrites.push({ id: supportRole.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] });
  }

  const channel = await guild.channels.create({
    name: `ticket-${user.username.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
    type: ChannelType.GuildText,
    parent: data.categoryId || null,
    permissionOverwrites,
  });

  const embed = new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle(`${categoryLabel} — Ticket #${data.counter}`)
    .setDescription(`Bonjour ${user} ! Un membre du staff va t'aider bientôt.\n\n**Catégorie :** ${categoryLabel}\n\nDécris ta demande ci-dessous.`)
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('ticket_close').setLabel('Fermer').setEmoji('🔒').setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId('ticket_claim').setLabel('Prendre en charge').setEmoji('✋').setStyle(ButtonStyle.Success),
  );

  await channel.send({ content: `${user}${data.supportRoleId ? ` <@&${data.supportRoleId}>` : ''}`, embeds: [embed], components: [row] });
  await interaction.reply({ content: `✅ Ticket créé : ${channel}`, ephemeral: true });
}

async function handleTicketClaim(interaction) {
  const { channel, member } = interaction;
  if (!channel.name.startsWith('ticket-')) return interaction.reply({ content: '❌ Pas un ticket.', ephemeral: true });
  const embed = new EmbedBuilder().setColor(0x00ff00).setDescription(`✋ Ticket pris en charge par ${member}`);
  await interaction.reply({ embeds: [embed] });
}

async function handleTicketClose(interaction) {
  const { channel, user, guild } = interaction;
  if (!channel.name.startsWith('ticket-')) return interaction.reply({ content: '❌ Pas un ticket.', ephemeral: true });

  // Transcription
  const messages = await channel.messages.fetch({ limit: 100 });
  const transcript = messages.reverse().map(m => `[${new Date(m.createdTimestamp).toLocaleString()}] ${m.author.tag}: ${m.content}`).join('\n');

  // Trouver le créateur du ticket (premier message mentionné)
  const firstMsg = messages.first();
  const ticketOwner = channel.permissionOverwrites.cache.find(o => o.type === 1 && o.id !== user.id);

  // Envoyer la transcription par DM
  try {
    const data = getTicketData(guild.id);
    const targetId = channel.permissionOverwrites.cache.find(o => o.type === 1)?.id;
    if (targetId) {
      const owner = await guild.members.fetch(targetId).catch(() => null);
      if (owner) {
        await owner.user.send({
          embeds: [new EmbedBuilder().setColor(0x5865f2).setTitle('📋 Transcription de ton ticket')
            .setDescription(`Ton ticket sur **${guild.name}** a été fermé par ${user.tag}.`)],
          files: transcript ? [{ attachment: Buffer.from(transcript), name: `transcript-${channel.name}.txt` }] : [],
        }).catch(() => {});
      }
    }
  } catch {}

  await interaction.reply({ embeds: [new EmbedBuilder().setColor(0xff0000).setTitle('🔒 Fermeture dans 5s...').setDescription(`Fermé par ${user.tag}`)] });
  setTimeout(() => channel.delete().catch(() => {}), 5000);
}

module.exports = { createTicketPanel, handleCategorySelect, handleTicketClaim, handleTicketClose, getTicketData, ticketData };
