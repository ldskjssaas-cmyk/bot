module.exports = {
  name: 'messageDelete',
  async execute(message, client) {
    if (message.author?.bot || !message.guild) return;
    if (!client.snipes) client.snipes = new Map();
    client.snipes.set(message.channel.id, {
      content: message.content,
      author: message.author?.tag || 'Inconnu',
      avatar: message.author?.displayAvatarURL() || null,
      timestamp: Date.now(),
    });
    // Auto-clear after 5 min
    setTimeout(() => {
      const s = client.snipes?.get(message.channel.id);
      if (s?.timestamp === client.snipes?.get(message.channel.id)?.timestamp) {
        client.snipes?.delete(message.channel.id);
      }
    }, 300_000);
  },
};
