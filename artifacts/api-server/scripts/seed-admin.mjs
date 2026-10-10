import crypto from "node:crypto";
import postgres from "postgres";

const secret = process.env.SESSION_SECRET ?? "aedusim-admin-dev-secret";
const db = process.env.DATABASE_URL;

if (!db) { console.error("DATABASE_URL missing"); process.exit(1); }

const username = process.argv[2];
const password = process.argv[3];
const role = process.argv[4] ?? "admin";

if (!username || !password) {
  console.error("Usage: node seed-admin.mjs <username> <password> [role]");
  process.exit(1);
}

const hash = crypto.createHash("sha256").update(secret + password).digest("hex");
const sql = postgres(db);

await sql`
  INSERT INTO admin_users (username, password_hash, role)
  VALUES (${username}, ${hash}, ${role})
  ON CONFLICT (username) DO UPDATE
    SET password_hash = EXCLUDED.password_hash,
        role = EXCLUDED.role
`;

console.log(`✅ Admin user '${username}' upserted with role '${role}'.`);
await sql.end();
