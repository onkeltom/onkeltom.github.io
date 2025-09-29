const test = require('node:test');
const assert = require('node:assert/strict');
const { resetDatabaseForTesting } = require('../src/storage/db');
const { createAthlete, getAllAthletes } = require('../src/storage/athleteStore');

test.beforeEach(async () => {
  await resetDatabaseForTesting();
});

test('roster flow persists and sorts athletes', async () => {
  await createAthlete({ firstName: 'Alex', lastName: 'Zimmer' });
  await createAthlete({ firstName: 'Blake', lastName: 'Young' });
  await createAthlete({ firstName: 'Casey', lastName: 'Adams' });

  const all = await getAllAthletes();
  assert.deepEqual(
    all.map((athlete) => athlete.lastName),
    ['Adams', 'Young', 'Zimmer']
  );
});
