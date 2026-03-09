const { setEditSnipe } = require('../systems/snipe');

module.exports = {
  name: 'messageUpdate',
  async execute(oldMessage, newMessage) {
    if (oldMessage.author?.bot) return;
    if (oldMessage.content === newMessage.content) return;
    setEditSnipe(oldMessage.channelId, {
      oldContent: oldMessage.content,
      newContent: newMessage.content,
      author: oldMessage.author,
      timestamp: oldMessage.createdTimestamp,
    });
  },
};
