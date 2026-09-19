import Database from 'better-sqlite3'
import { drizzle, type BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import * as schema from './schema'

export type AppDatabase = BetterSQLite3Database<typeof schema>

const SCHEMA_SQL = `
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS room (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  building TEXT NOT NULL,
  floor TEXT NOT NULL,
  room_number TEXT NOT NULL,
  UNIQUE (building, floor, room_number)
);

CREATE TABLE IF NOT EXISTS rack (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  room_id INTEGER NOT NULL REFERENCES room(id),
  name TEXT NOT NULL,
  UNIQUE (room_id, name)
);

CREATE TABLE IF NOT EXISTS device (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  rack_id INTEGER NOT NULL REFERENCES rack(id),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  model TEXT,
  u_position INTEGER,
  UNIQUE (rack_id, name)
);

CREATE TABLE IF NOT EXISTS interface (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  device_id INTEGER NOT NULL REFERENCES device(id),
  name TEXT NOT NULL,
  media TEXT NOT NULL,
  speed TEXT,
  notes TEXT,
  UNIQUE (device_id, name)
);

CREATE TABLE IF NOT EXISTS link (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  a_interface_id INTEGER NOT NULL REFERENCES interface(id),
  b_interface_id INTEGER NOT NULL REFERENCES interface(id),
  cable_labeled INTEGER NOT NULL,
  media TEXT NOT NULL,
  notes TEXT,
  CHECK (a_interface_id != b_interface_id),
  CHECK (a_interface_id < b_interface_id),
  UNIQUE (a_interface_id, b_interface_id)
);

CREATE TRIGGER IF NOT EXISTS link_interface_exclusive_insert
BEFORE INSERT ON link
BEGIN
  SELECT CASE
    WHEN EXISTS (
      SELECT 1 FROM link
      WHERE a_interface_id IN (NEW.a_interface_id, NEW.b_interface_id)
         OR b_interface_id IN (NEW.a_interface_id, NEW.b_interface_id)
    )
    THEN RAISE(ABORT, 'An interface can appear in at most one link')
  END;
END;

CREATE TRIGGER IF NOT EXISTS link_interface_exclusive_update
BEFORE UPDATE ON link
BEGIN
  SELECT CASE
    WHEN EXISTS (
      SELECT 1 FROM link
      WHERE id != NEW.id
        AND (
          a_interface_id IN (NEW.a_interface_id, NEW.b_interface_id)
          OR b_interface_id IN (NEW.a_interface_id, NEW.b_interface_id)
        )
    )
    THEN RAISE(ABORT, 'An interface can appear in at most one link')
  END;
END;
`

export function createDb(filePath: string): { sqlite: Database.Database; db: AppDatabase } {
  const sqlite = new Database(filePath)
  sqlite.pragma('journal_mode = WAL')
  sqlite.pragma('foreign_keys = ON')
  sqlite.exec(SCHEMA_SQL)
  const db = drizzle(sqlite, { schema })
  return { sqlite, db }
}
