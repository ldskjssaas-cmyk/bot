const sniped = new Map(); // channelId -> { content, author, timestamp, attachments }
const editSniped = new Map();

function setSnipe(channelId, data) { sniped.set(channelId, data); }
function getSnipe(channelId) { return sniped.get(channelId) || null; }
function setEditSnipe(channelId, data) { editSniped.set(channelId, data); }
function getEditSnipe(channelId) { return editSniped.get(channelId) || null; }

module.exports = { setSnipe, getSnipe, setEditSnipe, getEditSnipe };
