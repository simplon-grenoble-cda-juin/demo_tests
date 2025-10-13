import { faker } from "@faker-js/faker";
import dotenv from "dotenv";
import { Client } from "pg";

dotenv.config({ path: ".env.test" });

export const getClient = () => {
  return new Client({
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    host: process.env.PGHOST,
    port: process.env.PGPORT ? parseInt(process.env.PGPORT, 10) : undefined,
    database: process.env.PGDATABASE,
  });
};

export const begin = async (): Promise<Client> => {
  faker.seed(123);

  const client = getClient();
  await client.connect();
  await client.query("BEGIN");

  return client;
};

export const rollbackAndRelease = async (client: Client) => {
  try {
    await client.query("ROLLBACK");
  } finally {
    await client.end();
  }
};

export const commitAndRelease = async (client: Client) => {
  try {
    await client.query("COMMIT");
  } finally {
    await client.end();
  }
};
