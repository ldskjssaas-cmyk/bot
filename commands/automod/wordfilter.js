const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../../systems/database');

module.exports = {
  data: new SlashCommandBuilder().setName('wordfilter').setDescription('Filtre de mots interdits')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(sub => sub.setName('add').setDescription('Ajoute un mot interdit')
      .addStringOption(opt => opt.setName('mot').setDescription('Le mot').setRequired(true)))
    .addSubcommand(sub => sub.setName('remove').setDescription('Retire un mot interdit')
      .addStringOption(opt => opt.setName('mot').setDescription('Le mot').setRequired(true)))
    .addSubcommand(sub => sub.setName('list').setDescription('Liste les mots interdits'))
    .addSubcommand(sub => sub.setName('clear').setDescription('Vide toute la liste')),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const guildId = interaction.guild.id;
    const config = db.getConfig(guildId);
    const words = config.bannedWords || [];

    if (sub === 'add') {
      const word = interaction.options.getString('mot').toLowerCase();
      if (words.includes(word)) return interaction.reply({ content: '❌ Ce mot est déjà dans la liste.', ephemeral: true });
      words.push(word);
      db.setConfig(guildId, 'bannedWords', words);
      await interaction.reply({ content: `✅ Mot \`${word}\` ajouté au filtre.`, ephemeral: true });
    }

    if (sub === 'remove') {
      const word = interaction.options.getString('mot').toLowerCase();
      const idx = words.indexOf(word);
      if (idx === -1) return interaction.reply({ content: '❌ Mot introuvable.', ephemeral: true });
      words.splice(idx, 1);
      db.setConfig(guildId, 'bannedWords', words);
      await interaction.reply({ content: `✅ Mot \`${word}\` retiré du filtre.`, ephemeral: true });
    }

    if (sub === 'list') {
      if (!words.length) return interaction.reply({ content: '❌ Aucun mot interdit configuré.', ephemeral: true });
      await interaction.reply({ embeds: [new EmbedBuilder().setColor(0xff0000).setTitle('🚫 Mots interdits')
        .setDescription(words.map(w => `\`${w}\``).join(', '))
        .setFooter({ text: `${words.length} mot(s)` })], ephemeral: true });
    }

    if (sub === 'clear') {
      db.setConfig(guildId, 'bannedWords', []);
      await interaction.reply({ content: '✅ Liste vidée.', ephemeral: true });
    }
  },
};
