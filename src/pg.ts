import { Pool, types } from "pg";

types.setTypeParser(types.builtins.NUMERIC, (value: string) => {
  return parseFloat(value);
});

console.log({
  connectionTimeoutMillis: 5000,
  host: process.env.POSTGRES_HOST,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD || "",
  database: process.env.POSTGRES_DATABASE,
  port: Number(process.env.POSTGRES_PORT || 5432),
});

export const pool = new Pool({
  connectionTimeoutMillis: 5000,
  host: process.env.POSTGRES_HOST,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD || "",
  database: process.env.POSTGRES_DATABASE,
  port: Number(process.env.POSTGRES_PORT || 5432),
});
