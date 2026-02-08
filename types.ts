
export enum AppState {
  WELCOME = 'WELCOME',
  SETUP = 'SETUP',
  GAME = 'GAME',
  WINNER = 'WINNER'
}

export type Team = {
  name: string;
  scores: number[];
  total: number;
};

export type GameSettings = {
  team1Name: string;
  team2Name: string;
  limit: 51 | 101 | 151;
};
