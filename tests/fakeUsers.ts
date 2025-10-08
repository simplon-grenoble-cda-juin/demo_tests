import User from "../src/modeles/User";

export const fakeUsers = [
  new User("test1@test.com", "123", new Date().toISOString()),
  new User("test2@test.com", "123", new Date().toISOString()),
  new User("test3@test.com", "123", new Date().toISOString()),
];
