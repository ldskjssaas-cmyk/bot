const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const https = require('https');

function fetchJSON(url) {
  return new Promise((res, rej) => {
    https.get(url, r => { let d = ''; r.on('data', c => d += c); r.on('end', () => { try { res(JSON.parse(d)); } catch(e) { rej(e); } }); }).on('error', rej);
  });
}

function decodeHTML(str) {
  return str.replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#039;/g,"'");
}

module.exports = {
  data: new SlashCommandBuilder().setName('trivia').setDescription('Question de culture générale !'),

  async execute(interaction) {
    await interaction.deferReply();
    try {
      const data = await fetchJSON('https://opentdb.com/api.php?amount=1&type=multiple&lang=fr');
      if (data.response_code !== 0) throw new Error('API error');

      const q = data.results[0];
      const question = decodeHTML(q.question);
      const correct = decodeHTML(q.correct_answer);
      const allAnswers = [...q.incorrect_answers.map(decodeHTML), correct].sort(() => Math.random() - 0.5);
      const correctIdx = allAnswers.indexOf(correct);
      const labels = ['🇦', '🇧', '🇨', '🇩'];

      const embed = new EmbedBuilder().setColor(0x9b59b6).setTitle('🧠 Trivia !')
        .setDescription(`**${question}**`)
        .addFields({ name: 'Catégorie', value: q.category, inline: true }, { name: 'Difficulté', value: q.difficulty, inline: true })
        .setFooter({ text: '⏳ Tu as 30 secondes !' });

      const row = new ActionRowBuilder().addComponents(
        allAnswers.map((ans, i) => new ButtonBuilder().setCustomId(`trivia_${i}`).setLabel(`${labels[i]} ${ans}`).setStyle(ButtonStyle.Primary))
      );

      await interaction.editReply({ embeds: [embed], components: [row] });
      const msg = await interaction.fetchReply();

      const collector = msg.createMessageComponentCollector({ time: 30_000 });
      const answered = new Set();

      collector.on('collect', async i => {
        if (answered.has(i.user.id)) return i.reply({ content: '❌ Tu as déjà répondu !', ephemeral: true });
        answered.add(i.user.id);
        const chosen = parseInt(i.customId.replace('trivia_', ''));
        const isCorrect = chosen === correctIdx;
        await i.reply({ content: isCorrect ? `✅ **Bonne réponse !** La réponse était : **${correct}**` : `❌ **Mauvaise réponse !** La bonne réponse était : **${correct}**`, ephemeral: true });
      });

      collector.on('end', () => {
        const finalEmbed = EmbedBuilder.from(embed).setColor(0x808080).setFooter({ text: `Réponse : ${correct}` });
        msg.edit({ embeds: [finalEmbed], components: [] }).catch(() => {});
      });
    } catch {
      await interaction.editReply('❌ Impossible de récupérer une question. Réessaie !');
    }
  },
};
