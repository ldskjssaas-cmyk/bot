const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder().setName('ship').setDescription('Calcule la compatibilité entre deux personnes 💕')
    .addUserOption(opt => opt.setName('personne1').setDescription('Première personne').setRequired(true))
    .addUserOption(opt => opt.setName('personne2').setDescription('Deuxième personne').setRequired(true)),

  async execute(interaction) {
    const user1 = interaction.options.getUser('personne1');
    const user2 = interaction.options.getUser('personne2');
    const seed = (BigInt(user1.id) + BigInt(user2.id)) % 101n;
    const percent = Number(seed);
    const filled = Math.floor(percent / 10);
    const bar = '❤️'.repeat(filled) + '🖤'.repeat(10 - filled);

    let verdict, color;
    if (percent >= 80) { verdict = '😍 Âmes sœurs !'; color = 0xff69b4; }
    else if (percent >= 60) { verdict = '💑 Super compatibles !'; color = 0xff6b6b; }
    else if (percent >= 40) { verdict = '😊 Ça peut marcher !'; color = 0xffcc00; }
    else if (percent >= 20) { verdict = '🤔 Compliqué...'; color = 0xff9900; }
    else { verdict = '💔 Pas vraiment...'; color = 0x808080; }

    const shipName = user1.username.slice(0, Math.floor(user1.username.length / 2)) + user2.username.slice(Math.floor(user2.username.length / 2));

    const embed = new EmbedBuilder().setColor(color)
      .setTitle(`💕 Ship — ${user1.username} & ${user2.username}`)
      .setDescription(`**${bar}**\n\n**${percent}% compatible** — ${verdict}\n\n💑 Nom du couple : **${shipName}**`);
    await interaction.reply({ embeds: [embed] });
  },
};
