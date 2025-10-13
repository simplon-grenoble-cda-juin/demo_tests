import { Client } from "pg";
import argon2 from "argon2";
import { faker } from "@faker-js/faker";
import User from "../../src/modeles/User";

export type UserAttrs = {
  email?: string;
  password?: string;
  created_at?: Date | string;
};

export const buildUser = async (attrs: UserAttrs = {}): Promise<User> => {
  const email = attrs.email ?? faker.internet.email().toLowerCase();
  const password = attrs.password ?? (await argon2.hash("123"));
  const created_at =
    attrs.created_at instanceof Date
      ? attrs.created_at.toISOString()
      : attrs.created_at ?? new Date().toISOString();

  return new User(email, password, created_at);
};

export const createUser = async (
  pool: Client,
  attrs: UserAttrs = {}
): Promise<User> => {
  const user = await buildUser(attrs);

  const res = await pool.query<{ id: number }>(
    `INSERT INTO public."user"(email, password, created_at)
     VALUES ($1, $2, $3)
     RETURNING id`,
    [user.getEmail(), user.getPasswordHash(), user.getCreatedAt()]
  );

  user.setId(res.rows[0].id);

  return user;
};
