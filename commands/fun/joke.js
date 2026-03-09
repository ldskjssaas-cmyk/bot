const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const jokes = [
  "Pourquoi les plongeurs plongent-ils toujours en arrière ? Parce que sinon ils tomberaient dans le bateau !",
  "Un homme entre dans une bibliothèque : 'Avez-vous des livres sur la paranoïa ?' La bibliothécaire : 'Ils sont juste derrière vous !'",
  "Qu'est-ce qu'un canif ? Un petit fien.",
  "Comment appelle-t-on un chat tombé dans un pot de peinture à Noël ? Un chat-peint de Noël !",
  "Qu'est-ce qu'un crocodile qui surveille la cour d'école ? Un sac à dents.",
  "Pourquoi l'épouvantail a-t-il reçu un prix ? Parce qu'il était exceptionnel dans son domaine !",
  "Qu'est-ce qu'un électricien qui tombe en panne ? Un conducteur.",
  "Pourquoi les fantômes sont mauvais menteurs ? Parce qu'on voit à travers eux !",
];
module.exports = {
  data: new SlashCommandBuilder().setName('joke').setDescription('Blague aléatoire !'),
  async execute(interaction) {
    const joke = jokes[Math.floor(Math.random() * jokes.length)];
    await interaction.reply({ embeds: [new EmbedBuilder().setColor(0xffcc00).setTitle('😂 Blague').setDescription(joke)] });
  },
};
