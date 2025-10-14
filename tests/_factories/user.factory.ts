import { Client } from "pg";
import { faker } from "@faker-js/faker";
import argon2 from "argon2";
import User from "../../src/modeles/User";

export type UserProps = {
  email?: string;
  password?: string;
  created_at?: Date | string;
};

export class UserFactory {
  static build = async (props: UserProps = {}): Promise<User> => {
    const email = props.email ?? faker.internet.email().toLowerCase();
    const password = props.password ?? (await argon2.hash("123"));
    const created_at =
      props.created_at instanceof Date
        ? props.created_at.toISOString()
        : props.created_at ?? new Date().toISOString();

    return new User(email, password, created_at);
  };

  static populate = async (
    client: Client,
    props: UserProps = {}
  ): Promise<User> => {
    const user = await this.build(props);

    const res = await client.query<{ id: number }>(
      `INSERT INTO public."user"(email, password, created_at)
        VALUES ($1, $2, $3)
        RETURNING id
      `,
      [user.getEmail(), user.getPasswordHash(), user.getCreatedAt()]
    );

    user.setId(res.rows[0].id);

    return user;
  };

  static populateRandom = async (
    client: Client,
    number: number
  ): Promise<User[]> => {
    const users: User[] = [];

    for (let i = 0; i < number; i++) {
      const user = await this.populate(client, {});
      users.push(user);
    }

    return users;
  };
}
