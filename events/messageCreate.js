const { handleMessage } = require('../systems/automod');

module.exports = {
  name: 'messageCreate',
  async execute(message) {
    if (message.author.bot || !message.guild) return;
    await handleMessage(message);
  },
};
