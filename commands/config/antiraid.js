const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { getRaidConfig, getVerifyConfig, raidConfig, verifyConfig } = require('../../systems/antiraid');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('antiraid')
    .setDescription('Configure le système anti-raid et vérification')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(sub =>
      sub.setName('config')
        .setDescription('Configure le seuil de détection du raid')
        .addIntegerOption(opt =>
          opt.setName('seuil')
            .setDescription('Nombre de joins pour déclencher le lockdown (défaut: 10)')
            .setMinValue(2).setMaxValue(50).setRequired(true))
        .addIntegerOption(opt =>
          opt.setName('intervalle')
            .setDescription('Intervalle en secondes (défaut: 10)')
            .setMinValue(3).setMaxValue(60).setRequired(true))
    )
    .addSubcommand(sub =>
      sub.setName('unlock')
        .setDescription('Désactive le lockdown anti-raid')
    )
    .addSubcommand(sub =>
      sub.setName('verify')
        .setDescription('Configure la vérification des nouveaux membres')
        .addBooleanOption(opt =>
          opt.setName('actif').setDescription('Activer la vérification ?').setRequired(true))
        .addChannelOption(opt =>
          opt.setName('salon').setDescription('Salon de vérification'))
        .addRoleOption(opt =>
          opt.setName('role').setDescription('Rôle donné après vérification'))
    )
    .addSubcommand(sub =>
      sub.setName('status')
        .setDescription('Affiche le statut actuel du système anti-raid')
    ),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const guildId = interaction.guild.id;

    if (sub === 'config') {
      const seuil = interaction.options.getInteger('seuil');
      const intervalle = interaction.options.getInteger('intervalle');
      const config = getRaidConfig(guildId);
      config.threshold = seuil;
      config.interval = intervalle * 1000;
      raidConfig.set(guildId, config);
      return interaction.reply({
        content: `✅ Anti-raid configuré : **${seuil} joins** en **${intervalle}s** → lockdown automatique.`,
        ephemeral: true,
      });
    }

    if (sub === 'unlock') {
      const config = getRaidConfig(guildId);
      config.lockdown = false;
      raidConfig.set(guildId, config);
      return interaction.reply({
        content: '✅ Lockdown désactivé. Les nouveaux membres peuvent à nouveau rejoindre.',
        ephemeral: true,
      });
    }

    if (sub === 'verify') {
      const actif = interaction.options.getBoolean('actif');
      const salon = interaction.options.getChannel('salon');
      const role = interaction.options.getRole('role');
      const config = getVerifyConfig(guildId);
      config.enabled = actif;
      if (salon) config.channelId = salon.id;
      if (role) config.roleId = role.id;
      verifyConfig.set(guildId, config);

      let msg = `✅ Vérification **${actif ? 'activée' : 'désactivée'}**.`;
      if (salon) msg += `\n📌 Salon : ${salon}`;
      if (role) msg += `\n🎭 Rôle : ${role}`;
      return interaction.reply({ content: msg, ephemeral: true });
    }

    if (sub === 'status') {
      const rc = getRaidConfig(guildId);
      const vc = getVerifyConfig(guildId);
      const embed = new EmbedBuilder()
        .setColor(rc.lockdown ? 0xff0000 : 0x5865f2)
        .setTitle('🛡️ Statut Anti-Raid')
        .addFields(
          { name: '🔒 Lockdown', value: rc.lockdown ? '🔴 Actif' : '🟢 Inactif', inline: true },
          { name: '⚡ Seuil', value: `${rc.threshold} joins`, inline: true },
          { name: '⏱️ Intervalle', value: `${rc.interval / 1000}s`, inline: true },
          { name: '✅ Vérification', value: vc.enabled ? '🟢 Active' : '🔴 Inactive', inline: true },
          { name: '📌 Salon vérif', value: vc.channelId ? `<#${vc.channelId}>` : 'Non défini', inline: true },
          { name: '🎭 Rôle vérif', value: vc.roleId ? `<@&${vc.roleId}>` : 'Non défini', inline: true },
        )
        .setTimestamp();
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }
  },
};
