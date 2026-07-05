/**
 * seed.js
 * Populates the products table with the full catalogue from the original
 * index.html. Re-running is safe — uses INSERT OR IGNORE.
 *
 * Run with:  node db/seed.js
 * (or via:   npm run seed)
 */

const db = require('./database');

// ─── Full product list (article → name, price, category, subcategory) ─────────
// Sourced directly from the products array in index.html.
// volume is parsed from the name (first "NNN мл" match), null when not present.

const PRODUCTS = [
  // ── Пластиковые стаканы ──────────────────────────────────────────────────
  { id: "10002", name: "Стакан-стопка пластиковый 100 мл. прозрачный",       price: 4.5,  category: "Пластиковая посуда", subcategory: "Стаканы пластиковые" },
  { id: "10003", name: "Стакан пластиковый 200 мл. белый",                   price: 5,    category: "Пластиковая посуда", subcategory: "Стаканы пластиковые" },
  { id: "10007", name: "Стакан пластиковый 200 мл. прозрачный",              price: 3.5,  category: "Пластиковая посуда", subcategory: "Стаканы пластиковые" },
  { id: "10008", name: "Стакан пластиковый 300 мл. прозрачный",              price: 6,    category: "Пластиковая посуда", subcategory: "Стаканы пластиковые" },
  { id: "10005", name: "Стакан пластиковый 400 мл. прозрачный",              price: 7,    category: "Пластиковая посуда", subcategory: "Стаканы пластиковые" },

  // ── Шейкеры ──────────────────────────────────────────────────────────────
  { id: "11101", name: "Шейкер-стакан 200 мл. прозрачный",                   price: 30,   category: "Пластиковая посуда", subcategory: "Шейкеры" },
  { id: "11102", name: "Шейкер-стакан 300 мл. прозрачный",                   price: 38,   category: "Пластиковая посуда", subcategory: "Шейкеры" },
  { id: "11103", name: "Шейкер-стакан 400 мл. прозрачный",                   price: 39,   category: "Пластиковая посуда", subcategory: "Шейкеры" },
  { id: "11104", name: "Шейкер-стакан 500 мл. прозрачный",                   price: 40,   category: "Пластиковая посуда", subcategory: "Шейкеры" },

  // ── Бабл Ти ──────────────────────────────────────────────────────────────
  { id: "11106", name: "Стакан Бабл Ти 375 мл.",                              price: 37,   category: "Пластиковая посуда", subcategory: "Бабл Ти" },
  { id: "11107", name: "Стакан Бабл Ти 500 мл.",                              price: 30,   category: "Пластиковая посуда", subcategory: "Бабл Ти" },
  { id: "11108", name: "Стакан Бабл Ти 650 мл.",                              price: 45,   category: "Пластиковая посуда", subcategory: "Бабл Ти" },

  // ── Бумажные стаканы ─────────────────────────────────────────────────────
  { id: "12131", name: "Бумажный стакан 165 мл. под эспрессо белый",          price: 14,   category: "Бумажная посуда", subcategory: "Стаканы бумажные" },
  { id: "12132", name: "Бумажный стакан 165 мл. под эспрессо чёрный",         price: 14,   category: "Бумажная посуда", subcategory: "Стаканы бумажные" },
  { id: "12012", name: "Бумажный стакан 250 мл. белый",                        price: 15,   category: "Бумажная посуда", subcategory: "Стаканы бумажные" },
  { id: "12013", name: "Бумажный стакан 350 мл. белый",                        price: 24,   category: "Бумажная посуда", subcategory: "Стаканы бумажные" },
  { id: "12022", name: "Бумажный стакан 250 мл. бирюзовый",                   price: 18,   category: "Бумажная посуда", subcategory: "Стаканы бумажные" },
  { id: "12042", name: "Бумажный стакан 250 мл. красный",                      price: 16,   category: "Бумажная посуда", subcategory: "Стаканы бумажные" },
  { id: "12072", name: "Бумажный стакан 250 мл. крафт",                        price: 15,   category: "Бумажная посуда", subcategory: "Стаканы бумажные" },
  { id: "12062", name: "Бумажный стакан 250 мл. чёрный",                       price: 15,   category: "Бумажная посуда", subcategory: "Стаканы бумажные" },

  // ── Крышки ───────────────────────────────────────────────────────────────
  { id: "13027", name: "Крышка d-95 мм. прозрачная с вырезом",                price: 13,   category: "Аксессуары", subcategory: "Крышки" },
  { id: "11115", name: "Крышка купольная с отверстием",                        price: 14,   category: "Аксессуары", subcategory: "Крышки" },
  { id: "11116", name: "Крышка купольная без отверстия",                       price: 13,   category: "Аксессуары", subcategory: "Крышки" },
  { id: "13011", name: "Крышка d-80 мм. с питейником",                        price: 10,   category: "Аксессуары", subcategory: "Крышки" },
];

/** Extract the first integer volume in мл from a product name, or return null. */
function extractVolume(name) {
  const match = name.match(/(\d+)\s*мл/);
  return match ? parseInt(match[1], 10) : null;
}

async function seed() {
  await db.connect();

  let inserted = 0;
  let skipped  = 0;

  for (const p of PRODUCTS) {
    const existing = db.get('SELECT id FROM products WHERE id = ?', [p.id]);
    if (existing) {
      skipped++;
      continue;
    }

    db.run(
      `INSERT INTO products (id, name, price, category, subcategory, volume, image_url)
       VALUES (?, ?, ?, ?, ?, ?, NULL)`,
      [p.id, p.name, p.price, p.category, p.subcategory, extractVolume(p.name)]
    );
    inserted++;
  }

  console.log(`✅  Seeding complete — ${inserted} inserted, ${skipped} already existed.`);

  // Quick summary by category
  const summary = db.all(`
    SELECT category, COUNT(*) AS total
    FROM   products
    GROUP  BY category
    ORDER  BY total DESC
  `);
  console.log('\n📦  Products by category:');
  summary.forEach(r => console.log(`   ${r.category.padEnd(25)} ${r.total}`));
}

seed().catch(err => {
  console.error('❌  seed.js failed:', err.message);
  process.exit(1);
});
