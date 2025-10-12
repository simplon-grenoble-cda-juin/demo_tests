// APP

export interface ResultFail<E = unknown> {
  success: false;
  message: string;
  data?: E;
}

export interface ResultSuccess<S> {
  success: true;
  data: S;
  message?: string;
}

export type Result<S, E = unknown> = ResultSuccess<S> | ResultFail<E>;

// DATABASE

export interface UserDbRow {
  id?: number;
  email: string;
  password: string;
  created_at: string;
}

export interface TokenDbRow {
  id?: number;
  user_id: number;
  token: string;
  created_at: string;
}

export interface PlayerDbRow {
  nickname: string;
  full_name: string;
  birthdate: string;
  country: string;
  team_id: number;
  id?: number;
}
