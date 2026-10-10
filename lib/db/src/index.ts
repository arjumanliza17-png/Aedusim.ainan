import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is required but was not provided.");
}

const client = postgres(connectionString);
export const db = drizzle(client, { schema });

export {
  conversationsTable,
  messagesTable,
  profileTable,
  challengesTable,
  challengeCompletionsTable,
  examsTable,
  examSessionsTable,
  savedTable,
  documentsTable,
  adminUsersTable,
  couponCodesTable,
  systemSettingsTable,
  announcementsTable,
  topicProgressTable,
  placementResultsTable,
  paymentSubmissionsTable,
  adminAuditLogTable,
} from "./schema";
