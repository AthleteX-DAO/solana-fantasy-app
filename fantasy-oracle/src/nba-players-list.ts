interface NBAPlayerRaw {
    FantasyPlayerKey: string,
    PlayerID: number; 
    Position: string;
    Name: string; 
    Team: string; 
    Games: number;
    FantasyPoints: number;
    FieldGoalsMade: number;
    FreeThrowsMade: number;
    TwoPointersMade: number;
    ThreePointersMade: number;
    Rebounds: number;
    Assists: number;
    Points: number;
    PersonalFouls: number;
    LineupStatus: number;
    TrueShootingAttempts: number;
}


import { axios, AxiosResponse } from "./axios";

export interface NBAPlayer {
    PlayerID: number,
    Name: string,
    Position: string,
}

export async function getNBAPlayerList(): Promise<NBAPlayer[]> {

    const res: AxiosResponse<NBAPlayerRaw[]> = await axios.get(
        'https://api.sportsdata.io/v3/nba/projections/json/PlayerSeasonProjectionStats/2020?key=b00ef84629c94abc9e4acfa66a920ac5'
    );

    return res.data.map((player) => {
        const { PlayerID, Name, Position } = player;
        return { PlayerID, Name, Position };
    });
}