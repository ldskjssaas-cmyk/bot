const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const WORDS = ['discord','ordinateur','programmation','javascript','serveur','moderation','giveaway','ticket','musique','clavier','souris','ecran','internet','application','commande','permission','utilisateur','message','reaction','channel'];

const HANGMAN_STAGES = [
  '```\n  +---+\n  |   |\n      |\n      |\n      |\n      |\n=========```',
  '```\n  +---+\n  |   |\n  O   |\n      |\n      |\n      |\n=========```',
  '```\n  +---+\n  |   |\n  O   |\n  |   |\n      |\n      |\n=========```',
  '```\n  +---+\n  |   |\n  O   |\n /|   |\n      |\n      |\n=========```',
  '```\n  +---+\n  |   |\n  O   |\n /|\\  |\n      |\n      |\n=========```',
  '```\n  +---+\n  |   |\n  O   |\n /|\\  |\n /    |\n      |\n=========```',
  '```\n  +---+\n  |   |\n  O   |\n /|\\  |\n / \\  |\n      |\n=========```',
];

const activeGames = new Map();

module.exports = {
  data: new SlashCommandBuilder().setName('hangman').setDescription('Joue au pendu !'),

  async execute(interaction) {
    const userId = interaction.user.id;
    if (activeGames.has(userId)) return interaction.reply({ content: '❌ Tu as déjà une partie en cours !', ephemeral: true });

    const word = WORDS[Math.floor(Math.random() * WORDS.length)];
    const game = { word, guessed: [], wrong: 0, maxWrong: 6 };
    activeGames.set(userId, game);

    await interaction.reply({ embeds: [buildEmbed(game, interaction.user)], components: buildButtons(game) });

    const msg = await interaction.fetchReply();

    const collector = msg.createMessageComponentCollector({ time: 120_000 });
    collector.on('collect', async i => {
      if (i.user.id !== userId) return i.reply({ content: '❌ Ce n\'est pas ta partie !', ephemeral: true });

      const currentGame = activeGames.get(userId);
      if (!currentGame) return;

      const letter = i.customId.replace('hang_', '');
      if (!currentGame.guessed.includes(letter)) {
        currentGame.guessed.push(letter);
        if (!currentGame.word.includes(letter)) currentGame.wrong++;
      }

      const won = currentGame.word.split('').every(l => currentGame.guessed.includes(l));
      const lost = currentGame.wrong >= currentGame.maxWrong;

      if (won || lost) {
        activeGames.delete(userId);
        collector.stop();
        const embed = buildEmbed(currentGame, i.user);
        if (won) embed.setColor(0x00ff00).setTitle('🎉 Gagné !');
        if (lost) embed.setColor(0xff0000).setTitle(`💀 Perdu ! Le mot était : **${currentGame.word}**`);
        return i.update({ embeds: [embed], components: [] });
      }

      await i.update({ embeds: [buildEmbed(currentGame, i.user)], components: buildButtons(currentGame) });
    });

    collector.on('end', () => { activeGames.delete(userId); });
  },
};

function buildEmbed(game, user) {
  const display = game.word.split('').map(l => game.guessed.includes(l) ? l : '_').join(' ');
  const wrongLetters = game.guessed.filter(l => !game.word.includes(l));
  return new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle('🪢 Pendu')
    .setDescription(HANGMAN_STAGES[game.wrong])
    .addFields(
      { name: '📝 Mot', value: `\`${display}\``, inline: true },
      { name: '❌ Erreurs', value: `${game.wrong}/${game.maxWrong}`, inline: true },
      { name: '🔤 Lettres essayées', value: wrongLetters.join(', ') || 'Aucune', inline: true },
    )
    .setFooter({ text: `Partie de ${user.tag}` });
}

function buildButtons(game) {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz';
  const rows = [];
  for (let i = 0; i < 4; i++) {
    const row = new ActionRowBuilder();
    for (let j = 0; j < 7 && (i * 7 + j) < 26; j++) {
      const letter = alphabet[i * 7 + j];
      row.addComponents(
        new ButtonBuilder()
          .setCustomId(`hang_${letter}`)
          .setLabel(letter.toUpperCase())
          .setStyle(game.guessed.includes(letter) ? ButtonStyle.Secondary : ButtonStyle.Primary)
          .setDisabled(game.guessed.includes(letter))
      );
    }
    rows.push(row);
  }
  return rows;
}
