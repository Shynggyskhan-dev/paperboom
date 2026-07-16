require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }, // required for Supabase
});

// Test connection on startup
pool.query('SELECT NOW()').then(result => {
    console.log('✅  PostgreSQL connected:', result.rows[0].now);
}).catch(err => {
    console.error('❌  PostgreSQL connection failed:', err.message);
    process.exit(1);
});

module.exports = pool;