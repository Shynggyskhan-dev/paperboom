/**
 * database.js
 * Thin wrapper around sql.js that persists the database to disk.
 * sql.js is a pure-JS port of SQLite — no native build required.
 *
 * Usage:
 *   const db = require('./database');
 *   db.run('INSERT INTO users ...');
 *   db.get('SELECT * FROM users WHERE id = ?', [1]);
 *   db.all('SELECT * FROM products');
 */

const fs   = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'paperboom.db');

let _db   = null;
let _SQL  = null;

/**
 * Load (or initialise) the database synchronously.
 * Call this once at startup before any queries.
 */
async function connect() {
  if (_db) return _db;

  const initSqlJs = require('sql.js');
  _SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    _db = new _SQL.Database(fileBuffer);
  } else {
    _db = new _SQL.Database();
  }

  // Enable WAL-style safety — sql.js is in-memory, but we persist on every write
  _db.run('PRAGMA journal_mode = MEMORY;');
  _db.run('PRAGMA foreign_keys = ON;');

  return _db;
}

/** Persist current in-memory state to disk. Called after every mutating query. */
function save() {
  if (!_db) throw new Error('DB not connected. Call connect() first.');
  const data = _db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

/** Execute a statement that returns no rows (INSERT / UPDATE / DELETE / CREATE). */
function run(sql, params = []) {
  if (!_db) throw new Error('DB not connected.');
  _db.run(sql, params);
  save();
  return { lastInsertRowid: _db.exec('SELECT last_insert_rowid() AS id')[0]?.values[0][0] ?? null };
}

/** Return the first matching row as a plain object, or undefined. */
function get(sql, params = []) {
  if (!_db) throw new Error('DB not connected.');
  const stmt = _db.prepare(sql);
  stmt.bind(params);
  if (stmt.step()) {
    const row = stmt.getAsObject();
    stmt.free();
    return row;
  }
  stmt.free();
  return undefined;
}

/** Return all matching rows as an array of plain objects. */
function all(sql, params = []) {
  if (!_db) throw new Error('DB not connected.');
  const stmt   = _db.prepare(sql);
  const rows   = [];
  stmt.bind(params);
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

/** Execute multiple statements separated by semicolons (schema creation etc.). */
function exec(sql) {
  if (!_db) throw new Error('DB not connected.');
  _db.exec(sql);
  save();
}

module.exports = { connect, run, get, all, exec, save };
