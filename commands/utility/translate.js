const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const https = require('https');

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => { try { resolve(JSON.parse(data)); } catch(e) { reject(e); } });
    }).on('error', reject);
  });
}

module.exports = {
  data: new SlashCommandBuilder().setName('translate').setDescription('Traduit un texte')
    .addStringOption(opt => opt.setName('texte').setDescription('Texte à traduire').setRequired(true))
    .addStringOption(opt => opt.setName('langue').setDescription('Langue cible').setRequired(true)
      .addChoices(
        { name: '🇫🇷 Français', value: 'fr' },
        { name: '🇬🇧 Anglais', value: 'en' },
        { name: '🇪🇸 Espagnol', value: 'es' },
        { name: '🇩🇪 Allemand', value: 'de' },
        { name: '🇮🇹 Italien', value: 'it' },
        { name: '🇵🇹 Portugais', value: 'pt' },
        { name: '🇯🇵 Japonais', value: 'ja' },
        { name: '🇨🇳 Chinois', value: 'zh' },
      )),

  async execute(interaction) {
    const texte = interaction.options.getString('texte');
    const langue = interaction.options.getString('langue');
    await interaction.deferReply();

    try {
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(texte)}&langpair=auto|${langue}`;
      const data = await fetchJSON(url);

      if (data.responseStatus !== 200) return interaction.editReply('❌ Traduction impossible.');

      const translated = data.responseData.translatedText;
      const embed = new EmbedBuilder()
        .setColor(0x27ae60)
        .setTitle('🌐 Traduction')
        .addFields(
          { name: '📝 Texte original', value: texte },
          { name: '✅ Traduction', value: translated },
        )
        .setFooter({ text: 'MyMemory API' });

      await interaction.editReply({ embeds: [embed] });
    } catch {
      await interaction.editReply('❌ Erreur lors de la traduction.');
    }
  },
};
