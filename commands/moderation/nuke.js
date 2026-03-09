const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder().setName('nuke').setDescription('Recrée le salon (vide tous les messages)')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    const ch = interaction.channel;
    const pos = ch.position;
    const clone = await ch.clone({ reason: `Nuke par ${interaction.user.tag}` });
    await clone.setPosition(pos);
    await ch.delete();
    await clone.send({ embeds: [new EmbedBuilder().setColor(0xff0000).setTitle('💣 Salon nuke !').setDescription(`Salon recréé par ${interaction.user}.`).setTimestamp()] });
  },
};
