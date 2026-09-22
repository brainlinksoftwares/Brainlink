import { Client } from "@neondatabase/serverless";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const NEW_DB_URL = "postgresql://neondb_owner:npg_84iGZXnIhPEy@ep-lucky-sound-av9zp452-pooler.c-11.us-east-1.aws.neon.tech/neondb?sslmode=require";

async function restore() {
  console.log("Connecting to new Neon database via Client...");
  const client = new Client(NEW_DB_URL);
  await client.connect();

  const sqlFilePath = path.join(__dirname, "db", "migrations", "neon_database_restore.sql");
  const rawSql = fs.readFileSync(sqlFilePath, "utf8");

  console.log("Executing full schema & data restore script...");
  await client.query(rawSql);

  console.log("Restore executed successfully! Verifying counts...");
  const postsRes = await client.query("SELECT count(*) FROM posts;");
  const certsRes = await client.query("SELECT count(*) FROM certificates;");

  console.log(`Posts restored: ${postsRes.rows[0].count}`);
  console.log(`Certificates restored: ${certsRes.rows[0].count}`);

  await client.end();
  console.log("ALL DATA MIGRATED SUCCESSFULLY TO dev.brainlink@gmail.com!");
}

restore().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
