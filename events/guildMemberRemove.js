const { handleGoodbye } = require('../systems/welcome');

module.exports = {
  name: 'guildMemberRemove',
  async execute(member) {
    await handleGoodbye(member);
  },
};
