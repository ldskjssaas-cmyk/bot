const db = require('../systems/database');

module.exports = {
  name: 'messageReactionRemove',
  async execute(reaction, user) {
    if (user.bot) return;
    try {
      if (reaction.partial) await reaction.fetch();
      const guild = reaction.message.guild;
      if (!guild) return;
      const rr = db.getReactionRoles(guild.id);
      const msgRoles = rr[reaction.message.id];
      if (!msgRoles) return;
      const roleId = msgRoles[reaction.emoji.name] || msgRoles[reaction.emoji.toString()];
      if (!roleId) return;
      const member = await guild.members.fetch(user.id);
      const role = guild.roles.cache.get(roleId);
      if (role) await member.roles.remove(role);
    } catch (err) { console.error('ReactionRemove error:', err); }
  },
};
