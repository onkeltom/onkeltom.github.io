class Table {
  constructor(name) {
    this.name = name;
    this.rows = new Map();
  }
  async add(value) {
    this.rows.set(value.id, structuredClone(value));
    return value.id;
  }
  async put(value) {
    this.rows.set(value.id, structuredClone(value));
    return value.id;
  }
  async get(id) {
    const item = this.rows.get(id);
    return item ? structuredClone(item) : undefined;
  }
  async delete(id) {
    this.rows.delete(id);
  }
  orderBy(field) {
    return {
      toArray: async () =>
        Array.from(this.rows.values())
          .map((value) => structuredClone(value))
          .sort((a, b) => {
            const left = a[field] ?? '';
            const right = b[field] ?? '';
            return String(left).localeCompare(String(right));
          }),
    };
  }
  toCollection() {
    return {
      modify: async (modifier) => {
        for (const [key, value] of this.rows.entries()) {
          const clone = structuredClone(value);
          await modifier(clone);
          this.rows.set(key, clone);
        }
      },
    };
  }
  async clear() {
    this.rows.clear();
  }
}

class Transaction {
  constructor(tables) {
    this.tables = tables;
  }
  table(name) {
    const table = this.tables.get(name);
    if (!table) throw new Error(`Table ${name} is not defined`);
    return table;
  }
}

class Dexie {
  constructor(name) {
    this.name = name;
    this.tables = new Map();
    this.versions = [];
    this.opened = false;
  }
  version(versionNumber) {
    const spec = { version: versionNumber, stores: {}, upgrade: undefined };
    this.versions.push(spec);
    return {
      stores: (schema) => {
        spec.stores = schema;
        return {
          upgrade: (upgradeFn) => {
            spec.upgrade = upgradeFn;
            return this;
          },
        };
      },
    };
  }
  table(name) {
    if (!this.tables.has(name)) this.tables.set(name, new Table(name));
    return this.tables.get(name);
  }
  async open() {
    if (this.opened) return this;
    this.versions.sort((a, b) => a.version - b.version);
    for (const spec of this.versions) {
      Object.keys(spec.stores).forEach((tableName) => {
        this.table(tableName);
      });
      if (spec.upgrade) {
        const transaction = new Transaction(this.tables);
        await spec.upgrade(transaction);
      }
    }
    this.opened = true;
    return this;
  }
  async close() {
    this.opened = false;
  }
  async delete() {
    for (const table of this.tables.values()) {
      await table.clear();
    }
    this.opened = false;
  }
}

const DEFAULT_SESSION_OPTIONS = Object.freeze({
  approachRecordingEnabled: false,
  defaultPreRollMs: 0,
  autoAdvanceAthlete: true,
});

class MotionDatabase extends Dexie {
  constructor() {
    super('motion-database');

    const baseSessionFields = 'id, createdAt, updatedAt';
    const baseAthleteFields = 'id, firstName, lastName';

    this.version(1).stores({
      athletes: baseAthleteFields,
      sessions: baseSessionFields,
    });

    this.version(2)
      .stores({
        athletes: `${baseAthleteFields}, dominantHand, birthYear`,
        sessions: `${baseSessionFields}, title, location`,
      })
      .upgrade(async (transaction) => {
        const sessionsTable = transaction.table('sessions');
        await sessionsTable.toCollection().modify((session) => {
          session.participants = session.participants ?? [];
          session.notes = session.notes ?? '';
          session.options = session.options ?? { ...DEFAULT_SESSION_OPTIONS };
        });
      });
  }
}

const db = new MotionDatabase();
const openPromise = db.open();

async function resetDatabaseForTesting() {
  await db.delete();
  await db.open();
}

module.exports = {
  db,
  DEFAULT_SESSION_OPTIONS,
  resetDatabaseForTesting,
  openPromise,
};
