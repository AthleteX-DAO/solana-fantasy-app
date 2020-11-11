interface PlayerRaw {
  FantasyPlayerKey: string; //'19801',
  PlayerID: number; // 19801,
  Name: string; // 'Josh Allen',
  Team: string; // 'BUF',
  Position: string; // 'QB',
  AverageDraftPosition: number; // 108.9,
  AverageDraftPositionPPR: number; // 108.3,
  ByeWeek: number; // 11,
  LastSeasonFantasyPoints: number; // 153,
  ProjectedFantasyPoints: number; // 324.9,
  AuctionValue: number; // 12,
  AuctionValuePPR: number; // 12,
  AverageDraftPositionIDP: number; // 166,
  AverageDraftPositionRookie: number; // null,
  AverageDraftPositionDynasty: number; // null,
  AverageDraftPosition2QB: null;
}

export interface PlayerRelevant {
  PlayerID: number; // 19801,
  Name: string; // 'Josh Allen',
  Position: string; // 'QB',
  AverageDraftPosition: number; // 108.9,
}

import { axios, AxiosResponse } from './axios';

export async function getPlayerList(): Promise<PlayerRelevant[]> {
  const response: AxiosResponse<PlayerRaw[]> = await axios.get(
    'https://api.sportsdata.io/v3/nfl/stats/json/FantasyPlayers?key=014d8886bd8f40dfabc9f75bc0451a0d'
  );
  console.log('API resp players count', response.data.length);

  return response.data.map((player) => {
    const { PlayerID, Name, Position, AverageDraftPosition } = player;
    return { PlayerID, Name, Position, AverageDraftPosition };
  });
}
