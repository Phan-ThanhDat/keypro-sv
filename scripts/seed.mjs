import pkg from "pg";
const { Pool } = pkg;
import bcrypt from "bcrypt";
import dotenv from "dotenv";
dotenv.config();

async function seedUsers(client) {
  await client.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
  console.log('Creating "users" table...');
  await client.query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    );
  `);

  const usersCount = await client.query(`SELECT * FROM users LIMIT 1`);

  if (usersCount.rows.length > 0) {
    console.log("Users table already seeded");
    return;
  }

  const users = [
    {
      email: "admin1@example.com",
      password: bcrypt.hashSync("123456", 10),
    },
    {
      email: "admin2@example.com",
      password: bcrypt.hashSync("123456", 10),
    },
  ];

  console.log("Seeding users...");
  for (const user of users) {
    await client.query(`INSERT INTO users (email, password) VALUES ($1, $2)`, [
      user.email,
      user.password,
    ]);
  }
}

async function seedPoints(client) {
  // Maybe we can use PostGIS to store the points but for now we will use a simple table
  await client.query(
    `CREATE TABLE IF NOT EXISTS points (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      lat NUMERIC NOT NULL,
      lng NUMERIC NOT NULL,
      "labelSize" TEXT NOT NULL,
      category TEXT NOT NULL,
      "installYear" NUMERIC NOT NULL,
      "usageState" TEXT NOT NULL,
      owner TEXT NOT NULL,
      "createAt" TIMESTAMP DEFAULT NOW(),
      "createdBy" UUID REFERENCES users(id)
    )`
  );

  const points = [
    {
      id: "123",
      lat: 61.378466381494114,
      lng: 26.308762691638652,
      category: "1",
      labelSize: "medium",
      installYear: 2024,
      usageState: "1",
      owner: "1",
    },
    {
      lat: 64.35398842412371,
      lng: 15.360749218749987,
      category: "2",
      labelSize: "medium",
      installYear: 2024,
      usageState: "1",
      owner: "1",
      id: 1709312330845,
    },
    {
      lat: 65.79809485733908,
      lng: 16.063874218749987,
      category: "2",
      labelSize: "medium",
      installYear: 2023,
      usageState: "1",
      owner: "2",
      id: 1709312541677,
    },
    {
      lat: 66.3505553180471,
      lng: 20.546296093749987,
      category: "4",
      labelSize: "large",
      installYear: 2023,
      usageState: "2",
      owner: "2",
      id: 1709312599271,
    },
    {
      lat: 65.25192588007725,
      lng: 19.425690624999987,
      category: "2",
      labelSize: "medium",
      installYear: 2024,
      usageState: "1",
      owner: "1",
      id: 1709312648324,
    },
    {
      lat: 65.40783641306172,
      lng: 19.469635937499987,
      category: "3",
      labelSize: "medium",
      installYear: 2024,
      usageState: "1",
      owner: "1",
      id: 1709312834426,
    },
    {
      lat: 65.42437277632833,
      lng: 19.39202616873972,
      category: "3",
      labelSize: "small",
      installYear: 2024,
      usageState: "1",
      owner: "1",
      id: 1709312851769,
    },
  ];

  console.log("Seeding points...");

  const pointsCount = await client.query(`SELECT * FROM points LIMIT 1`);
  if (pointsCount.rows.length > 0) {
    console.log("Points table already seeded");
    return;
  }

  const admin1 = await client.query(
    `SELECT id FROM users WHERE email = 'admin1@example.com'`
  );

  for (const point of points) {
    await client.query(
      `INSERT INTO points (lat, lng, "labelSize", category, "installYear", "usageState", owner, "createdBy") VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        point.lat,
        point.lng,
        point.labelSize,
        point.category,
        point.installYear,
        point.usageState,
        point.owner,
        admin1.rows[0].id,
      ]
    );
  }
}

async function main() {
  console.log(`Connecting to the database at ${process.env.POSTGRES_HOST}...`);
  const pool = new Pool({
    connectionTimeoutMillis: 5000,
    host: process.env.POSTGRES_HOST,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD || "",
    database: process.env.POSTGRES_DATABASE,
    port: Number(process.env.POSTGRES_PORT || 5432),
    idleTimeoutMillis: 5000,
  });
  const client = await pool.connect();
  console.log("Seeding the database...");
  await seedUsers(client);
  await seedPoints(client);

  client.release();

  console.log("Database seeding complete");
}

main().catch((err) => {
  console.error(
    "An error occurred while attempting to seed the database:",
    err
  );
});
