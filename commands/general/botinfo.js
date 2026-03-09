const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder().setName('botinfo').setDescription('Informations sur le bot'),

  async execute(interaction, client) {
    const uptime = process.uptime();
    const days = Math.floor(uptime / 86400);
    const hours = Math.floor((uptime % 86400) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);

    const mem = process.memoryUsage();
    const ramUsed = (mem.heapUsed / 1024 / 1024).toFixed(1);
    const ramTotal = (mem.heapTotal / 1024 / 1024).toFixed(1);

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle(`🤖 ${client.user.username}`)
      .setThumbnail(client.user.displayAvatarURL())
      .addFields(
        { name: '⏱️ Uptime', value: `${days}j ${hours}h ${minutes}m ${seconds}s`, inline: true },
        { name: '📡 Latence', value: `${Math.round(client.ws.ping)}ms`, inline: true },
        { name: '💾 RAM', value: `${ramUsed}/${ramTotal} MB`, inline: true },
        { name: '🌐 Serveurs', value: `${client.guilds.cache.size}`, inline: true },
        { name: '👥 Membres', value: `${client.guilds.cache.reduce((acc, g) => acc + g.memberCount, 0)}`, inline: true },
        { name: '⚡ Commandes', value: `${client.commands.size}`, inline: true },
        { name: '🛠️ Node.js', value: process.version, inline: true },
        { name: '📦 discord.js', value: require('discord.js').version, inline: true },
      )
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  },
};
