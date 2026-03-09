const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const badges = {
  ActiveDeveloper: '👨‍💻 Dev Actif', BugHunterLevel1: '🐛 Bug Hunter',
  BugHunterLevel2: '🐛 Bug Hunter Gold', HypeSquadOnlineHouse1: '🏠 Bravery',
  HypeSquadOnlineHouse2: '🏠 Brilliance', HypeSquadOnlineHouse3: '🏠 Balance',
  PremiumEarlySupporter: '💎 Early Supporter', Staff: '🛠️ Staff Discord',
  Partner: '🤝 Partenaire', VerifiedDeveloper: '✅ Dev Vérifié',
};

module.exports = {
  data: new SlashCommandBuilder().setName('userinfo').setDescription('Infos détaillées sur un utilisateur')
    .addUserOption(opt => opt.setName('utilisateur').setDescription('L\'utilisateur')),

  async execute(interaction) {
    await interaction.deferReply();
    const user = interaction.options.getUser('utilisateur') || interaction.user;
    const member = interaction.guild.members.cache.get(user.id);
    const fetchedUser = await user.fetch();

    const sortedMembers = interaction.guild.members.cache.sort((a, b) => a.joinedTimestamp - b.joinedTimestamp);
    const joinPos = sortedMembers.map(m => m.id).indexOf(user.id) + 1;
    const userBadges = fetchedUser.flags?.toArray().map(f => badges[f]).filter(Boolean) || [];
    const roles = member?.roles.cache.filter(r => r.id !== interaction.guild.id).sort((a, b) => b.position - a.position);
    const topRole = member?.roles.highest;

    const embed = new EmbedBuilder()
      .setColor(topRole?.color || 0x5865f2)
      .setTitle(`👤 ${user.username}`)
      .setThumbnail(user.displayAvatarURL({ size: 256 }))
      .setImage(fetchedUser.bannerURL({ size: 1024 }) || null)
      .addFields(
        { name: '🆔 ID', value: user.id, inline: true },
        { name: '🤖 Bot', value: user.bot ? '✅' : '❌', inline: true },
        { name: '📅 Compte créé', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:D> (<t:${Math.floor(user.createdTimestamp / 1000)}:R>)`, inline: false },
        ...(member ? [
          { name: '📥 A rejoint', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:D> (<t:${Math.floor(member.joinedTimestamp / 1000)}:R>)`, inline: false },
          { name: '📊 Position', value: `#${joinPos} / ${interaction.guild.memberCount}`, inline: true },
          { name: '🎨 Couleur rôle', value: topRole?.hexColor || 'N/A', inline: true },
          { name: `🎭 Rôles (${roles.size})`, value: roles.size > 0 ? roles.map(r => `${r}`).slice(0, 8).join(' ') + (roles.size > 8 ? ` +${roles.size - 8}` : '') : 'Aucun', inline: false },
        ] : []),
        ...(userBadges.length ? [{ name: '🏅 Badges', value: userBadges.join(' · '), inline: false }] : []),
        ...(member?.premiumSince ? [{ name: '🚀 Booste depuis', value: `<t:${Math.floor(member.premiumSinceTimestamp / 1000)}:R>`, inline: true }] : []),
      )
      .setFooter({ text: `Demandé par ${interaction.user.tag}` })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};
