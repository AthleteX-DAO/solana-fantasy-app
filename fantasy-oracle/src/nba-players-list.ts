interface NBAPlayerRaw {
    FantasyPlayerKey: string,
    PlayerID: number; // 19801,
    Name: string; // 'Josh Allen',
    Team: string; // 'BUF',
}


import { axios, AxiosResponse } from "./axios";

export interface NBAPlayer {
    PlayerID: number,
    Name: string,
    Position: string,
    FG: string
}

export async function getPlayerList(): Promise<NBAPlayer[]> {

    const res: AxiosResponse<NBAPlayerRaw> = await axios.get(
        'https://api.sportsdata.io/v3/'
    );

    return res.data.map((player: JSON) => {
        const {  } = player;
        return {  };
    });
}