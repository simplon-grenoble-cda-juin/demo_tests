import { Repository } from "../libs/Repository";
import Player from "../modeles/Player";
import { PlayerDbRow } from "../types/Types";

export class PlayerRepository extends Repository {
  findAll = async (): Promise<Player[] | null> => {
    const query = {
      name: "find-all-player",
      text: "SELECT * FROM public.player",
    };

    try {
      const result = await this.pool.query<PlayerDbRow>(query);
      const players = result.rows.map((row) => Player.fromRow(row));

      return players;
    } catch (error) {
      console.log(error);
    }

    return [];
  };
}
