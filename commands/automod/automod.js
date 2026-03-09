const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { getConfig, setConfig } = require('../../systems/automod');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('automod')
    .setDescription('Configure l\'automodération')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(sub => sub.setName('status').setDescription('Affiche la config actuelle'))
    .addSubcommand(sub => sub.setName('antispam').setDescription('Active/désactive l\'anti-spam')
      .addBooleanOption(opt => opt.setName('actif').setDescription('Activer ?').setRequired(true)))
    .addSubcommand(sub => sub.setName('antilink').setDescription('Active/désactive l\'anti-lien')
      .addBooleanOption(opt => opt.setName('actif').setDescription('Activer ?').setRequired(true)))
    .addSubcommand(sub => sub.setName('anticaps').setDescription('Active/désactive l\'anti-majuscules')
      .addBooleanOption(opt => opt.setName('actif').setDescription('Activer ?').setRequired(true)))
    .addSubcommand(sub => sub.setName('antimention').setDescription('Active/désactive l\'anti-mention')
      .addBooleanOption(opt => opt.setName('actif').setDescription('Activer ?').setRequired(true))),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const guildId = interaction.guild.id;
    const config = getConfig(guildId);

    if (sub === 'status') {
      const embed = new EmbedBuilder().setColor(0x5865f2).setTitle('🛡️ Configuration AutoMod')
        .addFields(
          { name: '🚫 Anti-Spam', value: config.antiSpam ? '✅ Actif' : '❌ Inactif', inline: true },
          { name: '🔗 Anti-Lien', value: config.antiLink ? '✅ Actif' : '❌ Inactif', inline: true },
          { name: '🔠 Anti-Caps', value: config.antiCaps ? '✅ Actif' : '❌ Inactif', inline: true },
          { name: '📢 Anti-Mention', value: config.antiMention ? '✅ Actif' : '❌ Inactif', inline: true },
          { name: '⚙️ Seuil spam', value: `${config.spamThreshold} msg / ${config.spamInterval/1000}s`, inline: true },
          { name: '📣 Max mentions', value: `${config.maxMentions}`, inline: true },
        );
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    const actif = interaction.options.getBoolean('actif');
    const map = { antispam: 'antiSpam', antilink: 'antiLink', anticaps: 'antiCaps', antimention: 'antiMention' };
    setConfig(guildId, map[sub], actif);
    await interaction.reply({ content: `✅ **${sub}** ${actif ? 'activé' : 'désactivé'} !`, ephemeral: true });
  },
};
