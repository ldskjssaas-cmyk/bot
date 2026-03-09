const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const riddles = [
  { question: "Plus je sèche, plus je suis mouillée. Qui suis-je ?", answer: "serviette", hint: "Tu l'utilises après la douche" },
  { question: "J'ai des villes, mais pas de maisons. J'ai des forêts, mais pas d'arbres. J'ai de l'eau, mais pas de poissons. Que suis-je ?", answer: "carte", hint: "Tu me consultes pour te repérer" },
  { question: "Je parle sans bouche et entends sans oreilles. Je n'ai pas de corps, mais prends vie avec le vent. Qui suis-je ?", answer: "echo", hint: "Crie dans une grotte..." },
  { question: "Plus tu en prends, plus tu en laisses derrière toi. Que suis-je ?", answer: "pas", hint: "Tu en fais quand tu marches" },
  { question: "Qu'est-ce qui a des dents mais ne mord pas ?", answer: "peigne", hint: "Tu l'utilises pour les cheveux" },
  { question: "Je suis toujours devant toi mais ne peut pas être vu. Qui suis-je ?", answer: "futur", hint: "Le temps qui n'est pas encore arrivé" },
];

module.exports = {
  data: new SlashCommandBuilder().setName('riddle').setDescription('Réponds à une devinette !'),

  async execute(interaction) {
    const riddle = riddles[Math.floor(Math.random() * riddles.length)];

    const embed = new EmbedBuilder()
      .setColor(0x9b59b6)
      .setTitle('🧩 Devinette !')
      .setDescription(riddle.question)
      .setFooter({ text: 'Tu as 60 secondes pour répondre dans le chat !' });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('riddle_hint').setLabel('Indice 💡').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('riddle_answer').setLabel('Abandonner ❌').setStyle(ButtonStyle.Danger),
    );

    await interaction.reply({ embeds: [embed], components: [row] });

    const msg = await interaction.fetchReply();

    // Collecteur pour les messages
    const msgCollector = interaction.channel.createMessageCollector({
      filter: m => m.author.id === interaction.user.id,
      time: 60_000,
    });

    // Collecteur pour les boutons
    const btnCollector = msg.createMessageComponentCollector({ time: 60_000 });

    btnCollector.on('collect', async i => {
      if (i.user.id !== interaction.user.id) return i.reply({ content: '❌ Pas ta partie !', ephemeral: true });
      if (i.customId === 'riddle_hint') {
        await i.reply({ content: `💡 Indice : ${riddle.hint}`, ephemeral: true });
      } else {
        msgCollector.stop();
        btnCollector.stop();
        await i.update({ embeds: [embed.setColor(0xff0000).setFooter({ text: `La réponse était : ${riddle.answer}` })], components: [] });
      }
    });

    msgCollector.on('collect', async m => {
      if (m.content.toLowerCase().trim() === riddle.answer.toLowerCase()) {
        msgCollector.stop();
        btnCollector.stop();
        await m.reply({ embeds: [new EmbedBuilder().setColor(0x00ff00).setTitle('🎉 Bonne réponse !').setDescription(`La réponse était bien **${riddle.answer}** !`)] });
        await msg.edit({ components: [] });
      }
    });

    msgCollector.on('end', (_, reason) => {
      if (reason === 'time') {
        msg.edit({ embeds: [embed.setColor(0xff0000).setFooter({ text: `Temps écoulé ! La réponse était : ${riddle.answer}` })], components: [] }).catch(() => {});
      }
    });
  },
};
