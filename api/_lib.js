const { kv } = require('@vercel/kv');

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

async function getKey(licenseKey) {
  return await kv.get('key:' + licenseKey.toUpperCase());
}

async function setKey(licenseKey, data) {
  await kv.set('key:' + licenseKey.toUpperCase(), data);
}

module.exports = {
  kv, TRIAL_DAYS, ADMIN_SECRET, cors, daysBetween, getMachine, setMachine, getKey, setKey
};
