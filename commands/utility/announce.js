const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder().setName('announce').setDescription('Faire une annonce officielle')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addStringOption(opt => opt.setName('titre').setDescription('Titre de l\'annonce').setRequired(true))
    .addStringOption(opt => opt.setName('message').setDescription('Contenu de l\'annonce').setRequired(true))
    .addChannelOption(opt => opt.setName('salon').setDescription('Salon cible (défaut: salon actuel)'))
    .addStringOption(opt => opt.setName('couleur').setDescription('Couleur hex (ex: FF0000)'))
    .addRoleOption(opt => opt.setName('mention').setDescription('Mentionner un rôle'))
    .addBooleanOption(opt => opt.setName('everyone').setDescription('Mentionner @everyone ?')),

  async execute(interaction) {
    const titre = interaction.options.getString('titre');
    const message = interaction.options.getString('message');
    const channel = interaction.options.getChannel('salon') || interaction.channel;
    const couleur = interaction.options.getString('couleur');
    const role = interaction.options.getRole('mention');
    const everyone = interaction.options.getBoolean('everyone');
    const color = couleur ? parseInt(couleur.replace('#', ''), 16) : 0x5865f2;

    const embed = new EmbedBuilder()
      .setColor(color)
      .setTitle(`📢 ${titre}`)
      .setDescription(message)
      .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL() })
      .setFooter({ text: `Annonce par ${interaction.user.tag}` })
      .setTimestamp();

    let content = '';
    if (everyone) content += '@everyone ';
    if (role) content += `${role} `;

    await channel.send({ content: content.trim() || undefined, embeds: [embed], allowedMentions: { parse: ['everyone', 'roles'] } });
    await interaction.reply({ content: `✅ Annonce envoyée dans ${channel} !`, ephemeral: true });
  },
};
