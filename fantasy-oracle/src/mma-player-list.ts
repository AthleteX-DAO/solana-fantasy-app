import { Player } from './../../sdk/state';

// @ts-ignore
import mma from 'mma';

interface MMAPlayerRaw extends Player {

}


export interface MMAPlayer extends Player {
    Name: string;
    Division: string; // Weight Class
}

export async function getMMAPlayerList(): Promise<MMAPlayer[]> {
    return response.data.map((player) => {
        
        return player;
    });
}
