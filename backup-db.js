const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error("No DATABASE_URL found in .env");
  process.exit(1);
}

const sql = neon(dbUrl);

async function run() {
  console.log("Connecting to Neon PostgreSQL...");
  const tables = await sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
  `;
  console.log("Found tables:", tables.map(t => t.table_name));

  const exportData = {};

  for (const row of tables) {
    const tableName = row.table_name;
    const countRes = await sql.query(`SELECT COUNT(*)::int as count FROM "${tableName}"`);
    const count = countRes[0].count;
    console.log(`Table ${tableName}: ${count} rows`);

    const data = await sql.query(`SELECT * FROM "${tableName}"`);
    exportData[tableName] = data;
  }

  const dumpPath = path.resolve(__dirname, 'neon_database_backup.json');
  fs.writeFileSync(dumpPath, JSON.stringify(exportData, null, 2));
  console.log("SUCCESS: Exported data written to:", dumpPath);
}

run().catch(e => {
  console.error("Database query failed:", e);
});
