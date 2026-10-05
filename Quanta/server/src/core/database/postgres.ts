import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../../generated/prisma/client"

// TODO :: [infra] Create a new Prisma migration for the current schema: bunx prisma migrate dev --name <describe>
// TODO :: [infra] docker-compose mounts migration files by exact filename, switch to bunx prisma migrate deploy on container start
// TODO :: [infra] Nothing writes to AuditLog yet, insert a row from each mutation
// TODO :: [infra] Add indexes on companyId, userId and categoryId (every filter is a full scan today)
// TODO :: [infra] Raise the Prisma connection pool or put PgBouncer in front of Postgres
// TODO :: [infra] Add rate limiting
// TODO :: [infra] Cache rarely-changing data such as categories
// TODO :: [infra] Audit the queries we haven't reviewed for fan-out and N+1 bugs
 
const connectionString = process.env.DATABASE_URL;
 
if (!connectionString) {
  throw new Error(
    "DATABASE_URL is not set — check your .env file (local dev) or your docker-compose environment block (containerized).",
  );
}
 
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });
 
export { prisma };