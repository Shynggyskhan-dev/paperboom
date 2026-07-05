/**
 * init.js
 * Creates all tables if they don't already exist.
 * Safe to re-run (uses IF NOT EXISTS).
 *
 * Run with:  node db/init.js
 */

const db = require('./database');

async function init() {
  await db.connect();

  db.exec(`
    -- ----------------------------------------------------------------
    -- Users
    -- phone is the unique login identifier (Kazakhstani format: +7...)
    -- ----------------------------------------------------------------
    CREATE TABLE IF NOT EXISTS users (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      company_name TEXT    NOT NULL,
      phone        TEXT    NOT NULL UNIQUE,
      password_hash TEXT   NOT NULL,
      created_at   TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    -- ----------------------------------------------------------------
    -- Products
    --
    -- IMPORTANT: "id" is an internal auto-increment primary key, NOT the
    -- spreadsheet article number. The source catalogue (Catalog_Parsed_New.xlsx)
    -- contains 8 article numbers that map to multiple DIFFERENT products
    -- (e.g. article 24010 = 6 distinct cake-bottom sizes). Using the article
    -- as a primary key would silently drop 13 real products on import.
    -- "article" is kept as a separate, indexed (non-unique) column so the
    -- frontend can still search/display "Арт. 24010" exactly as before —
    -- it just isn't used for row identity.
    --
    -- volume is extracted from the product name where present (e.g. "250 мл")
    -- ----------------------------------------------------------------
    CREATE TABLE IF NOT EXISTS products (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      article       TEXT    NOT NULL,              -- Артикул (NOT unique — see note above)
      name          TEXT    NOT NULL,               -- Товар
      category      TEXT    NOT NULL,               -- Категория
      subcategory   TEXT    NOT NULL,               -- Подкатегория
      price_piece   REAL    NOT NULL DEFAULT 0,      -- Цена за штуку
      price_pack    REAL    NOT NULL DEFAULT 0,      -- Цена за упаковку
      price_box     REAL    NOT NULL DEFAULT 0,      -- Цена за коробку
      qty_pack      INTEGER NOT NULL DEFAULT 0,      -- Кол-во в упаковке
      qty_box       INTEGER NOT NULL DEFAULT 0,      -- Кол-во в коробке
      volume        INTEGER,                         -- ml, parsed from name when present
      image_url     TEXT                             -- nullable until images are uploaded
    );

    -- ----------------------------------------------------------------
    -- Orders
    -- ----------------------------------------------------------------
    CREATE TABLE IF NOT EXISTS orders (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      total_sum    REAL    NOT NULL,
      status       TEXT    NOT NULL DEFAULT 'new',   -- new | confirmed | shipped | done
      created_at   TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    -- ----------------------------------------------------------------
    -- Order items — snapshot of price at purchase time
    -- unit_type records whether this line was bought as piece/pack/box
    -- ----------------------------------------------------------------
    CREATE TABLE IF NOT EXISTS order_items (
      id                INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id          INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      product_id        INTEGER NOT NULL REFERENCES products(id),
      unit_type         TEXT    NOT NULL DEFAULT 'piece',  -- piece | pack | box
      quantity          INTEGER NOT NULL CHECK (quantity > 0),
      price_at_purchase REAL    NOT NULL
    );

    -- ----------------------------------------------------------------
    -- Favourites  (many-to-many: user ↔ product)
    -- ----------------------------------------------------------------
    CREATE TABLE IF NOT EXISTS favorites (
      user_id    INTEGER NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      PRIMARY KEY (user_id, product_id)
    );

    -- ----------------------------------------------------------------
    -- Indexes for common look-ups
    -- ----------------------------------------------------------------
    CREATE INDEX IF NOT EXISTS idx_products_article     ON products(article);
    CREATE INDEX IF NOT EXISTS idx_products_category    ON products(category);
    CREATE INDEX IF NOT EXISTS idx_products_subcategory ON products(subcategory);
    CREATE INDEX IF NOT EXISTS idx_orders_user_id       ON orders(user_id);
    CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
  `);

  console.log('✅  Database initialised — tables created (paperboom.db)');
}

init().catch(err => {
  console.error('❌  init.js failed:', err.message);
  process.exit(1);
});