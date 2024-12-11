/* KINDLY REFER TO README.md FOR INSTRUCTIONS ON HOW TO RESTORE THE DATABASE */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

require("dotenv").config({
  path: path.resolve(__dirname, "../.env.local"),
});

const { PrismaClient, QuestionType, Token } = require("@prisma/client");

const prisma = new PrismaClient();
// Keep the backup file in the scripts folder
const backupFile = path.resolve(__dirname, "backup.sql.gz");

async function main() {
  // Dropping existing schema to avoid any conflicts
  const databaseConnection = process.env.DATABASE_PRISMA_URL;
  execSync(`psql ${databaseConnection} -c "DROP SCHEMA public CASCADE;"`, {
    stdio: "inherit",
  });
  execSync(`psql ${databaseConnection} -c "CREATE SCHEMA public;"`, {
    stdio: "inherit",
  });

  console.log(`Restoring production database from ${backupFile}...`);
  execSync(`gunzip -dc ${backupFile} | psql ${databaseConnection}`, {
    stdio: "inherit",
  });
}

main()
  .then(async () => {
    console.log("Database restored successfully!");
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
