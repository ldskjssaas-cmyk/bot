const { handleJoin } = require('../systems/antiraid');
const { handleWelcome } = require('../systems/welcome');

module.exports = {
  name: 'guildMemberAdd',
  async execute(member, client) {
    await handleJoin(member, client);
    await handleWelcome(member);
  },
};
