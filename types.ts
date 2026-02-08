
export type AppState = 'WELCOME' | 'SETUP' | 'GAME' | 'WINNER';

export type Team = {
  name: string;
  scores: number[];
  total: number;
};

export type GameSettings = {
  team1Name: string;
  team2Name: string;
  limit: number;
};
