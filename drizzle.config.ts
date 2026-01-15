import * as dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";

dotenv.config({
    path: `.env.${process.env.NODE_ENV || "development"}`, 
});

export default defineConfig({
    out: "./lib/db/migrations",
    schema: "./lib/db/schema.ts",
    dialect: "postgresql",
    dbCredentials: {
        url: process.env.DATABASE_URL!,
    },
    schemaFilter: ['public'],
    introspect: {
      casing: "preserve",
    },
    casing: "camelCase",
})