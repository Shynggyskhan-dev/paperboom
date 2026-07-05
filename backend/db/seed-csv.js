/**
 * seed-csv.js
 * Reads Catalog_Parsed_New.csv and populates the products table.
 *
 * CSV headers (Russian):
 *   Артикул, Товар, Категория, Подкатегория,
 *   Цена за штуку, Цена за упаковку, Цена за коробку,
 *   Кол-во в упаковке, Кол-во в коробке
 *
 * IMPORTANT — read before re-running:
 *   This script TRUNCATES the products table before importing, so it is
 *   safe to re-run any number of times (no duplicate accumulation).
 *   Existing favorites/order_items referencing old product ids will be
 *   orphaned if you re-seed after orders exist — acceptable for the
 *   import/dev phase, but flagged here deliberately rather than hidden.
 *
 * Run with:  node db/seed-csv.js
 * (or via:   npm run seed:csv)
 */

const fs   = require('fs');
const path = require('path');
const csv  = require('csv-parser');
const db   = require('./database');

const CSV_PATH = path.join(__dirname, 'Catalog_Parsed_New.csv');

/** Parse a CSV numeric cell. Empty string / undefined / garbage → 0. */
function parseNumber(val) {
  if (val === undefined || val === null) return 0;
  const cleaned = String(val).trim().replace(',', '.');
  if (cleaned === '') return 0;
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : n;
}

/** Parse a CSV integer cell. Empty/garbage → 0. */
function parseInt0(val) {
  if (val === undefined || val === null) return 0;
  const cleaned = String(val).trim();
  if (cleaned === '') return 0;
  const n = parseInt(cleaned, 10);
  return isNaN(n) ? 0 : n;
}

/** Extract the first integer volume in мл from a product name, or null. */
function extractVolume(name) {
  if (!name) return null;
  const match = name.match(/(\d+)\s*мл/i);
  return match ? parseInt(match[1], 10) : null;
}

/** Clean a raw CSV string cell: trim, collapse repeated whitespace. */
function cleanText(val) {
  if (val === undefined || val === null) return '';
  return String(val).trim().replace(/\s+/g, ' ');
}

async function seed() {
  if (!fs.existsSync(CSV_PATH)) {
    console.error(`❌  CSV not found at ${CSV_PATH}`);
    console.error('    Place Catalog_Parsed_New.csv inside backend/db/ and re-run.');
    process.exit(1);
  }

  await db.connect();

  // Truncate so re-running this script never duplicates rows.
  db.exec('DELETE FROM products;');
  db.exec("DELETE FROM sqlite_sequence WHERE name='products';"); // reset autoincrement

  const rows = await new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(CSV_PATH)
      .pipe(csv())
      .on('data', (row) => results.push(row))
      .on('end', () => resolve(results))
      .on('error', reject);
  });

  let inserted       = 0;
  let skippedNoName   = 0;
  let skippedNoArticle = 0;
  let zeroPriceCount  = 0;

  for (const row of rows) {
    const article     = cleanText(row['Артикул']);
    const name         = cleanText(row['Товар']);
    const category     = cleanText(row['Категория']) || 'БЕЗ КАТЕГОРИИ';
    const subcategory  = cleanText(row['Подкатегория']) || 'Разное';

    const price_piece  = parseNumber(row['Цена за штуку']);
    const price_pack   = parseNumber(row['Цена за упаковку']);
    const price_box    = parseNumber(row['Цена за коробку']);
    const qty_pack     = parseInt0(row['Кол-во в упаковке']);
    const qty_box      = parseInt0(row['Кол-во в коробке']);

    // Graceful handling of bad rows — skip but count, never crash the import.
    if (!article) {
      skippedNoArticle++;
      continue;
    }
    if (!name) {
      skippedNoName++;
      continue; // 2 known blank-name rows in the source file (articles 29003, 29005)
    }
    if (price_piece === 0 && price_pack === 0 && price_box === 0) {
      zeroPriceCount++; // still import — just flag (20 known rows like this)
    }

    db.run(
      `INSERT INTO products
         (article, name, category, subcategory,
          price_piece, price_pack, price_box, qty_pack, qty_box, volume, image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL)`,
      [
        article, name, category, subcategory,
        price_piece, price_pack, price_box, qty_pack, qty_box,
        extractVolume(name),
      ]
    );
    inserted++;
  }

  console.log('✅  CSV import complete');
  console.log(`    Inserted:                ${inserted}`);
  console.log(`    Skipped (no article):    ${skippedNoArticle}`);
  console.log(`    Skipped (no name):       ${skippedNoName}`);
  console.log(`    Zero-price (imported anyway): ${zeroPriceCount}`);

  const byCategory = db.all(`
    SELECT category, COUNT(*) AS total
    FROM   products
    GROUP  BY category
    ORDER  BY total DESC
  `);
  console.log('\n📦  Products by category:');
  byCategory.forEach(r => console.log(`   ${r.category.padEnd(28)} ${r.total}`));

  const dupArticles = db.all(`
    SELECT article, COUNT(*) AS cnt
    FROM   products
    GROUP  BY article
    HAVING cnt > 1
  `);
  if (dupArticles.length) {
    console.log(`\nℹ️   ${dupArticles.length} article numbers map to multiple distinct products`);
    console.log('    (expected — these are different variants sharing an article in the source file)');
  }
}

seed().catch(err => {
  console.error('❌  seed-csv.js failed:', err.message);
  process.exit(1);
});
