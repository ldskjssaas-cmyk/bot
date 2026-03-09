// ============================================
// SYSTÈME DE BASE DE DONNÉES (JSON fichiers)
// Sauvegarde tout entre les redémarrages
// ============================================
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function getFilePath(name) {
  return path.join(DATA_DIR, `${name}.json`);
}

function load(name) {
  ensureDir();
  const file = getFilePath(name);
  if (!fs.existsSync(file)) return {};
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return {}; }
}

function save(name, data) {
  ensureDir();
  fs.writeFileSync(getFilePath(name), JSON.stringify(data, null, 2));
}

// ─── Warns ───
function getWarns(guildId, userId) {
  const data = load('warns');
  return data[`${guildId}-${userId}`] || [];
}

function addWarn(guildId, userId, warn) {
  const data = load('warns');
  const key = `${guildId}-${userId}`;
  if (!data[key]) data[key] = [];
  data[key].push(warn);
  save('warns', data);
  return data[key];
}

function clearWarns(guildId, userId) {
  const data = load('warns');
  delete data[`${guildId}-${userId}`];
  save('warns', data);
}

// ─── Config serveur ───
function getConfig(guildId) {
  const data = load('configs');
  return data[guildId] || {};
}

function setConfig(guildId, key, value) {
  const data = load('configs');
  if (!data[guildId]) data[guildId] = {};
  data[guildId][key] = value;
  save('configs', data);
}

// ─── XP / Niveaux ───
function getXP(guildId, userId) {
  const data = load('xp');
  return data[`${guildId}-${userId}`] || { xp: 0, level: 0, totalXp: 0 };
}

function addXP(guildId, userId, amount) {
  const data = load('xp');
  const key = `${guildId}-${userId}`;
  if (!data[key]) data[key] = { xp: 0, level: 0, totalXp: 0 };
  data[key].xp += amount;
  data[key].totalXp += amount;

  // Calcul du niveau
  const xpForNextLevel = (data[key].level + 1) * 100;
  let leveledUp = false;
  if (data[key].xp >= xpForNextLevel) {
    data[key].xp -= xpForNextLevel;
    data[key].level++;
    leveledUp = true;
  }
  save('xp', data);
  return { ...data[key], leveledUp };
}

function getLeaderboard(guildId, limit = 10) {
  const data = load('xp');
  return Object.entries(data)
    .filter(([key]) => key.startsWith(guildId))
    .map(([key, val]) => ({ userId: key.replace(`${guildId}-`, ''), ...val }))
    .sort((a, b) => b.totalXp - a.totalXp)
    .slice(0, limit);
}

// ─── Reaction Roles ───
function getReactionRoles(guildId) {
  const data = load('reactionroles');
  return data[guildId] || {};
}

function setReactionRole(guildId, messageId, emoji, roleId) {
  const data = load('reactionroles');
  if (!data[guildId]) data[guildId] = {};
  if (!data[guildId][messageId]) data[guildId][messageId] = {};
  data[guildId][messageId][emoji] = roleId;
  save('reactionroles', data);
}

function removeReactionRole(guildId, messageId, emoji) {
  const data = load('reactionroles');
  if (data[guildId]?.[messageId]) {
    delete data[guildId][messageId][emoji];
    save('reactionroles', data);
  }
}

module.exports = {
  load, save,
  getWarns, addWarn, clearWarns,
  getConfig, setConfig,
  getXP, addXP, getLeaderboard,
  getReactionRoles, setReactionRole, removeReactionRole,
};
