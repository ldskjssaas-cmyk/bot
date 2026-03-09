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

const weatherEmojis = { 0:'☀️', 1:'🌤️', 2:'⛅', 3:'☁️', 45:'🌫️', 48:'🌫️', 51:'🌦️', 53:'🌦️', 55:'🌧️', 61:'🌧️', 63:'🌧️', 65:'🌧️', 71:'❄️', 73:'❄️', 75:'❄️', 80:'🌦️', 81:'🌧️', 82:'⛈️', 95:'⛈️', 99:'⛈️' };
const weatherDesc = { 0:'Ciel dégagé', 1:'Principalement clair', 2:'Partiellement nuageux', 3:'Couvert', 45:'Brouillard', 51:'Bruine légère', 61:'Pluie légère', 63:'Pluie modérée', 65:'Pluie forte', 71:'Neige légère', 80:'Averses légères', 82:'Averses violentes', 95:'Orage', 99:'Orage avec grêle' };

module.exports = {
  data: new SlashCommandBuilder().setName('meteo').setDescription('Affiche la météo d\'une ville')
    .addStringOption(opt => opt.setName('ville').setDescription('Nom de la ville').setRequired(true)),

  async execute(interaction) {
    const ville = interaction.options.getString('ville');
    await interaction.deferReply();

    try {
      // Géocodage
      const geo = await fetchJSON(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(ville)}&count=1&language=fr`);
      if (!geo.results?.length) return interaction.editReply('❌ Ville introuvable.');

      const { latitude, longitude, name, country } = geo.results[0];

      // Météo
      const weather = await fetchJSON(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=relativehumidity_2m,apparent_temperature&timezone=auto`);
      const cw = weather.current_weather;
      const emoji = weatherEmojis[cw.weathercode] || '🌡️';
      const desc = weatherDesc[cw.weathercode] || 'Inconnu';
      const humidity = weather.hourly?.relativehumidity_2m?.[0] || '?';
      const feelsLike = weather.hourly?.apparent_temperature?.[0] || '?';

      const embed = new EmbedBuilder()
        .setColor(0x3498db)
        .setTitle(`${emoji} Météo — ${name}, ${country}`)
        .addFields(
          { name: '🌡️ Température', value: `${cw.temperature}°C`, inline: true },
          { name: '🤔 Ressenti', value: `${feelsLike}°C`, inline: true },
          { name: '💧 Humidité', value: `${humidity}%`, inline: true },
          { name: '💨 Vent', value: `${cw.windspeed} km/h`, inline: true },
          { name: '🌤️ Conditions', value: desc, inline: true },
        )
        .setTimestamp()
        .setFooter({ text: 'Open-Meteo API' });

      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      await interaction.editReply('❌ Impossible de récupérer la météo.');
    }
  },
};
