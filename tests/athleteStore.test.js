const test = require('node:test');
const assert = require('node:assert/strict');
const { db, DEFAULT_SESSION_OPTIONS, resetDatabaseForTesting } = require('../src/storage/db');
const { createAthlete, deleteAthlete, getAllAthletes, updateAthlete } = require('../src/storage/athleteStore');

test.beforeEach(async () => {
  await resetDatabaseForTesting();
});

test('database migrations hydrate session defaults', async () => {
  const sessionsTable = db.table('sessions');
  await sessionsTable.add({
    id: 'session-legacy',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  });

  await db.close();
  await db.open();
  const stored = await sessionsTable.get('session-legacy');

  assert.deepEqual(stored.participants, []);
  assert.equal(stored.notes, '');
  assert.deepEqual(stored.options, DEFAULT_SESSION_OPTIONS);
});

test('athleteStore CRUD flow', async () => {
  const created = await createAthlete({ firstName: 'Sky', lastName: 'Johnson' });
  assert.ok(created.id);

  const all = await getAllAthletes();
  assert.equal(all.length, 1);

  const updated = await updateAthlete(created.id, { lastName: 'Jones' });
  assert.equal(updated.lastName, 'Jones');
  assert.notEqual(updated.updatedAt, created.updatedAt);

  await deleteAthlete(created.id);
  const remaining = await getAllAthletes();
  assert.equal(remaining.length, 0);
});
