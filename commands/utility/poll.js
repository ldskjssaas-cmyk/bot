const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder().setName('poll').setDescription('Crée un sondage')
    .addStringOption(opt => opt.setName('question').setDescription('La question').setRequired(true))
    .addStringOption(opt => opt.setName('option1').setDescription('Option 1').setRequired(true))
    .addStringOption(opt => opt.setName('option2').setDescription('Option 2').setRequired(true))
    .addStringOption(opt => opt.setName('option3').setDescription('Option 3'))
    .addStringOption(opt => opt.setName('option4').setDescription('Option 4')),
  async execute(interaction) {
    const question = interaction.options.getString('question');
    const options = [
      interaction.options.getString('option1'),
      interaction.options.getString('option2'),
      interaction.options.getString('option3'),
      interaction.options.getString('option4'),
    ].filter(Boolean);
    const emojis = ['1️⃣','2️⃣','3️⃣','4️⃣'];
    const embed = new EmbedBuilder().setColor(0x3498db).setTitle(`📊 ${question}`)
      .setDescription(options.map((o, i) => `${emojis[i]} ${o}`).join('\n'))
      .setFooter({ text: `Sondage créé par ${interaction.user.tag}` });
    const msg = await interaction.reply({ embeds: [embed], fetchReply: true });
    for (let i = 0; i < options.length; i++) await msg.react(emojis[i]);
  },
};
