const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../../systems/database');
const { setLogChannel } = require('../../systems/logs');

module.exports = {
  data: new SlashCommandBuilder().setName('setup').setDescription('Configuration générale du bot')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(sub => sub.setName('xp').setDescription('Active/désactive le système XP')
      .addBooleanOption(opt => opt.setName('actif').setDescription('Activer ?').setRequired(true))
      .addChannelOption(opt => opt.setName('salon').setDescription('Salon pour les annonces de niveau')))
    .addSubcommand(sub => sub.setName('levelrole').setDescription('Donne un rôle à un niveau précis')
      .addIntegerOption(opt => opt.setName('niveau').setDescription('Niveau requis').setRequired(true).setMinValue(1))
      .addRoleOption(opt => opt.setName('role').setDescription('Rôle à donner').setRequired(true)))
    .addSubcommand(sub => sub.setName('status').setDescription('Affiche toute la configuration du bot')),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const guildId = interaction.guild.id;

    if (sub === 'xp') {
      const actif = interaction.options.getBoolean('actif');
      const salon = interaction.options.getChannel('salon');
      db.setConfig(guildId, 'xpEnabled', actif);
      if (salon) db.setConfig(guildId, 'levelUpChannelId', salon.id);
      await interaction.reply({ content: `✅ Système XP **${actif ? 'activé' : 'désactivé'}**${salon ? ` — annonces dans ${salon}` : ''}`, ephemeral: true });
    }

    if (sub === 'levelrole') {
      const niveau = interaction.options.getInteger('niveau');
      const role = interaction.options.getRole('role');
      const config = db.getConfig(guildId);
      const levelRoles = config.levelRoles || {};
      levelRoles[niveau] = role.id;
      db.setConfig(guildId, 'levelRoles', levelRoles);
      await interaction.reply({ content: `✅ Au niveau **${niveau}**, les membres recevront ${role}`, ephemeral: true });
    }

    if (sub === 'status') {
      const config = db.getConfig(guildId);
      const embed = new EmbedBuilder().setColor(0x5865f2).setTitle(`⚙️ Configuration — ${interaction.guild.name}`)
        .addFields(
          { name: '⭐ XP', value: config.xpEnabled !== false ? '✅ Actif' : '❌ Inactif', inline: true },
          { name: '📢 Salon niveau', value: config.levelUpChannelId ? `<#${config.levelUpChannelId}>` : 'Même salon', inline: true },
          { name: '📋 Logs mod', value: config.logChannelId ? `<#${config.logChannelId}>` : 'Non défini', inline: true },
          { name: '👋 Bienvenue', value: config.welcomeChannelId ? `<#${config.welcomeChannelId}>` : 'Non défini', inline: true },
          { name: '👋 Au revoir', value: config.goodbyeChannelId ? `<#${config.goodbyeChannelId}>` : 'Non défini', inline: true },
          { name: '🎭 Rôle auto', value: config.autoRoleId ? `<@&${config.autoRoleId}>` : 'Non défini', inline: true },
        )
        .setThumbnail(interaction.guild.iconURL())
        .setTimestamp();
      await interaction.reply({ embeds: [embed], ephemeral: true });
    }
  },
};
