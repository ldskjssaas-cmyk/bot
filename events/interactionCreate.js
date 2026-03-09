const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { handleCategorySelect, handleTicketClaim, handleTicketClose } = require('../systems/ticket');
const { handleGiveawayButton } = require('../systems/giveaway');
const { handleVerifyButton } = require('../systems/antiraid');

const suggestionVotes = new Map();

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {

    // ─── STRING SELECT ───
    if (interaction.isStringSelectMenu()) {
      if (interaction.customId === 'ticket_category') return handleCategorySelect(interaction);
      // help_select is handled by the collector inside help.js
      return;
    }

    // ─── BUTTONS ───
    if (interaction.isButton()) {
      if (interaction.customId === 'ticket_close') return handleTicketClose(interaction);
      if (interaction.customId === 'ticket_claim') return handleTicketClaim(interaction);
      if (interaction.customId === 'giveaway_enter') return handleGiveawayButton(interaction);
      if (interaction.customId.startsWith('verify_')) return handleVerifyButton(interaction);
      if (interaction.customId === 'help_home') return; // Handled by collector

      // Suggestions votes
      if (['suggest_up', 'suggest_down', 'suggest_approve', 'suggest_reject'].includes(interaction.customId)) {
        const msgId = interaction.message.id;
        if (!suggestionVotes.has(msgId)) suggestionVotes.set(msgId, { up: new Set(), down: new Set() });
        const votes = suggestionVotes.get(msgId);
        const isAdmin = interaction.member.permissions.has('Administrator');

        if (interaction.customId === 'suggest_approve' && isAdmin) {
          const embed = EmbedBuilder.from(interaction.message.embeds[0]).setColor(0x00ff00);
          const sf = embed.data.fields?.find(f => f.name === '📊 Statut');
          if (sf) sf.value = '✅ Approuvée';
          return interaction.update({ embeds: [embed], components: [] });
        }
        if (interaction.customId === 'suggest_reject' && isAdmin) {
          const embed = EmbedBuilder.from(interaction.message.embeds[0]).setColor(0xff0000);
          const sf = embed.data.fields?.find(f => f.name === '📊 Statut');
          if (sf) sf.value = '❌ Rejetée';
          return interaction.update({ embeds: [embed], components: [] });
        }
        if (interaction.customId === 'suggest_up') {
          if (votes.up.has(interaction.user.id)) votes.up.delete(interaction.user.id);
          else { votes.up.add(interaction.user.id); votes.down.delete(interaction.user.id); }
        }
        if (interaction.customId === 'suggest_down') {
          if (votes.down.has(interaction.user.id)) votes.down.delete(interaction.user.id);
          else { votes.down.add(interaction.user.id); votes.up.delete(interaction.user.id); }
        }

        const embed = EmbedBuilder.from(interaction.message.embeds[0]);
        const vf = embed.data.fields?.find(f => f.name === '🗳️ Votes');
        if (vf) vf.value = `👍 ${votes.up.size}  |  👎 ${votes.down.size}`;

        const { ActionRowBuilder: AR, ButtonBuilder: BB, ButtonStyle: BS } = require('discord.js');
        const row = new AR().addComponents(
          new BB().setCustomId('suggest_up').setLabel(`${votes.up.size}`).setEmoji('👍').setStyle(BS.Success),
          new BB().setCustomId('suggest_down').setLabel(`${votes.down.size}`).setEmoji('👎').setStyle(BS.Danger),
          new BB().setCustomId('suggest_approve').setLabel('Approuver').setStyle(BS.Secondary),
          new BB().setCustomId('suggest_reject').setLabel('Rejeter').setStyle(BS.Secondary),
        );
        return interaction.update({ embeds: [embed], components: [row] });
      }
    }

    // ─── SLASH COMMANDS ───
    if (!interaction.isChatInputCommand()) return;
    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    // Cooldowns
    const cooldownAmount = (command.cooldown || 3) * 1000;
    const cooldownKey = `${command.data.name}-${interaction.user.id}`;
    const now = Date.now();
    if (client.cooldowns.has(cooldownKey)) {
      const expiry = client.cooldowns.get(cooldownKey);
      if (now < expiry) {
        const remaining = ((expiry - now) / 1000).toFixed(1);
        return interaction.reply({ content: `⏳ Attends encore **${remaining}s** avant de réutiliser \`/${command.data.name}\`.`, ephemeral: true });
      }
    }
    client.cooldowns.set(cooldownKey, now + cooldownAmount);
    setTimeout(() => client.cooldowns.delete(cooldownKey), cooldownAmount);

    try {
      await command.execute(interaction, client);
    } catch (error) {
      console.error(`Erreur commande ${interaction.commandName}:`, error);
      const errEmbed = new EmbedBuilder().setColor(0xff0000).setTitle('❌ Erreur').setDescription('Une erreur est survenue. Réessaie dans un instant.');
      if (interaction.replied || interaction.deferred) await interaction.followUp({ embeds: [errEmbed], ephemeral: true });
      else await interaction.reply({ embeds: [errEmbed], ephemeral: true });
    }
  },
};
