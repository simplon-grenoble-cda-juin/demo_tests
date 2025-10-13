import { getClient } from "./db";

export const truncateAll = async () => {
  const client = getClient();
  await client.connect();
  try {
    await client.query(`
      TRUNCATE
        public.token,
        public.match,
        public.team_tournament,
        public.player,
        public.tournament,
        public.team,
        public.game,
        public."user"
      RESTART IDENTITY CASCADE
    `);
  } finally {
    await client.end();
  }
};
