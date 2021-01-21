interface NFLPlayerRaw {
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

export interface NFLPlayer {
  PlayerID: number; // 19801,
  Name: string; // 'Josh Allen',
  Position: string; // 'QB',
  AverageDraftPosition: number; // 108.9,
}

import { axios, AxiosResponse } from './axios';

export async function getPlayerList(): Promise<NFLPlayer[]> {
  const response: AxiosResponse<NFLPlayerRaw[]> = await axios.get(
    'https://api.sportsdata.io/v3/nfl/stats/json/FantasyPlayers?key=80f05fefe3ea4b2c81c0b6b0289beed9'
  );
  console.log('API resp players count', response.data.length);

  return response.data.map((player) => {
    const { PlayerID, Name, Position, AverageDraftPosition } = player;
    return { PlayerID, Name, Position, AverageDraftPosition };
  });
}
