const { randomUUID } = require('crypto');
const { db } = require('./db');

function currentTimestamp() {
  return new Date().toISOString();
}

async function createAthlete(input) {
  await db.open();
  const now = currentTimestamp();
  const athlete = {
    id: randomUUID(),
    firstName: input.firstName,
    lastName: input.lastName,
    dominantHand: input.dominantHand,
    birthYear: input.birthYear,
    createdAt: now,
    updatedAt: now,
  };

  await db.table('athletes').add(athlete);
  return athlete;
}

async function updateAthlete(id, updates) {
  await db.open();
  const table = db.table('athletes');
  const existing = await table.get(id);
  if (!existing) {
    throw new Error(`Athlete ${id} not found`);
  }

  const updated = {
    ...existing,
    ...updates,
    updatedAt: currentTimestamp(),
  };

  await table.put(updated);
  return updated;
}

async function getAthlete(id) {
  await db.open();
  return db.table('athletes').get(id);
}

async function getAllAthletes() {
  await db.open();
  return db.table('athletes').orderBy('lastName').toArray();
}

async function deleteAthlete(id) {
  await db.open();
  await db.table('athletes').delete(id);
}

module.exports = {
  createAthlete,
  updateAthlete,
  getAthlete,
  getAllAthletes,
  deleteAthlete,
};
