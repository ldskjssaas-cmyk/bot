const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder().setName('ascii').setDescription('Convertit du texte en art ASCII')
    .addStringOption(opt => opt.setName('texte').setDescription('Texte (max 10 car.)').setRequired(true).setMaxLength(10)),

  async execute(interaction) {
    const text = interaction.options.getString('texte').toUpperCase();
    const chars = {
      'A':'▄▀█',B:'█▄▄',C:'█▀▀',D:'█▄█',E:'█▀▀',F:'█▀',G:'█▀▀',H:'█ █',I:'█',J:' █',
      K:'█▄▀',L:'█  ',M:'█▄█',N:'█▄▀',O:'█▀█',P:'█▀▄',Q:'▀▄▀',R:'█▀▄',S:'▄▀▀',
      T:'▀█▀',U:'█ █',V:'▀▄▀',W:'█ █',X:'▀▄▀',Y:'▀▄▀',Z:'▀▀█',
      '0':'█▀█','1':' █','2':'▀▀█','3':'▀▀█','4':'█▄█','5':'▄▀▀','6':'█▀▀','7':'▀▀█','8':'█▀█','9':'█▀█',
      ' ':'   ',
    };
    const result = text.split('').map(c => chars[c] || c).join(' ');
    await interaction.reply(`\`\`\`\n${result}\n\`\`\``);
  },
};
