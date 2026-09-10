const { kv } = require('@vercel/kv');
const fs = require('fs');
const path = require('path');

const TRIAL_DAYS = 2;
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'kafira-admin-change-me';

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-secret');
}

function daysBetween(fromIso, toDate = new Date()) {
  const from = new Date(fromIso);
  const ms = toDate.getTime() - from.getTime();
  return ms / (1000 * 60 * 60 * 24);
}

async function getMachine(machineId) {
  return await kv.get('machine:' + machineId);
}

async function setMachine(machineId, data) {
  await kv.set('machine:' + machineId, data);
}

async function getKeyUsage(licenseKey) {
  return await kv.get('keyusage:' + licenseKey.toUpperCase());
}

async function setKeyUsage(licenseKey, data) {
  await kv.set('keyusage:' + licenseKey.toUpperCase(), data);
}

/** Manual keys from GitHub file: server/data/license-keys.json */
function loadManualKeys() {
  try {
    const filePath = path.join(process.cwd(), 'data', 'license-keys.json');
    if (!fs.existsSync(filePath)) {
      // fallback relative to api folder
      const alt = path.join(__dirname, '..', '..', 'data', 'license-keys.json');
      if (fs.existsSync(alt)) {
        const raw = JSON.parse(fs.readFileSync(alt, 'utf8'));
        return (raw.keys || []).map(k => String(k).trim().toUpperCase());
      }
      return [];
    }
    const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    return (raw.keys || []).map(k => String(k).trim().toUpperCase());
  } catch (e) {
    console.error('loadManualKeys error', e.message);
    return [];
  }
}

function isKeyInManualList(licenseKey) {
  const keys = loadManualKeys();
  return keys.includes(String(licenseKey).trim().toUpperCase());
}

module.exports = {
  kv,
  TRIAL_DAYS,
  ADMIN_SECRET,
  cors,
  daysBetween,
  getMachine,
  setMachine,
  getKeyUsage,
  setKeyUsage,
  loadManualKeys,
  isKeyInManualList
};
