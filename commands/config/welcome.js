const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../../systems/database');

module.exports = {
  data: new SlashCommandBuilder().setName('welcome').setDescription('Configure les messages de bienvenue/au revoir')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(sub => sub.setName('set').setDescription('Configure le salon de bienvenue')
      .addChannelOption(opt => opt.setName('salon').setDescription('Salon de bienvenue').setRequired(true))
      .addStringOption(opt => opt.setName('message').setDescription('Message ({user} {username} {server} {count})')))
    .addSubcommand(sub => sub.setName('goodbye').setDescription('Configure le salon d\'au revoir')
      .addChannelOption(opt => opt.setName('salon').setDescription('Salon d\'au revoir').setRequired(true))
      .addStringOption(opt => opt.setName('message').setDescription('Message ({user} {username} {server})')))
    .addSubcommand(sub => sub.setName('autorole').setDescription('Rôle donné automatiquement à l\'arrivée')
      .addRoleOption(opt => opt.setName('role').setDescription('Le rôle').setRequired(true)))
    .addSubcommand(sub => sub.setName('status').setDescription('Affiche la config actuelle'))
    .addSubcommand(sub => sub.setName('test').setDescription('Teste le message de bienvenue')),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const guildId = interaction.guild.id;

    if (sub === 'set') {
      const channel = interaction.options.getChannel('salon');
      const message = interaction.options.getString('message');
      db.setConfig(guildId, 'welcomeChannelId', channel.id);
      if (message) db.setConfig(guildId, 'welcomeMessage', message);
      await interaction.reply({ content: `✅ Bienvenue configuré dans ${channel}\n📝 Variables : \`{user}\` \`{username}\` \`{server}\` \`{count}\``, ephemeral: true });
    }

    if (sub === 'goodbye') {
      const channel = interaction.options.getChannel('salon');
      const message = interaction.options.getString('message');
      db.setConfig(guildId, 'goodbyeChannelId', channel.id);
      if (message) db.setConfig(guildId, 'goodbyeMessage', message);
      await interaction.reply({ content: `✅ Au revoir configuré dans ${channel}`, ephemeral: true });
    }

    if (sub === 'autorole') {
      const role = interaction.options.getRole('role');
      db.setConfig(guildId, 'autoRoleId', role.id);
      await interaction.reply({ content: `✅ Rôle automatique défini : ${role}`, ephemeral: true });
    }

    if (sub === 'status') {
      const config = db.getConfig(guildId);
      const embed = new EmbedBuilder().setColor(0x5865f2).setTitle('⚙️ Config Bienvenue')
        .addFields(
          { name: '👋 Salon bienvenue', value: config.welcomeChannelId ? `<#${config.welcomeChannelId}>` : 'Non défini', inline: true },
          { name: '👋 Salon au revoir', value: config.goodbyeChannelId ? `<#${config.goodbyeChannelId}>` : 'Non défini', inline: true },
          { name: '🎭 Rôle automatique', value: config.autoRoleId ? `<@&${config.autoRoleId}>` : 'Non défini', inline: true },
          { name: '📝 Message', value: config.welcomeMessage || 'Par défaut' },
        );
      await interaction.reply({ embeds: [embed], ephemeral: true });
    }

    if (sub === 'test') {
      const { handleWelcome } = require('../../systems/welcome');
      const member = interaction.guild.members.cache.get(interaction.user.id);
      await handleWelcome(member);
      await interaction.reply({ content: '✅ Message de test envoyé !', ephemeral: true });
    }
  },
};
