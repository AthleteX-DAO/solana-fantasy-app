type GameResults = Record<number, number>;

interface Season {
  /**
   * list of players available for current/coming season
   * used as initial list for league creating
   */
  availablePlayers: string[];

  games: Record<number, GameResults>;
}

interface UserState {
  ownedPlayers: number[];

  gamePlayersPick: Record<number, number[]>;

  exchangeProposals: Array<{ from: number; to: number }>;
}

interface League {
  seasonId: number;

  bidAmount: number;

  invitedUsers: string[];

  maxUsers: number;

  users: Record<string, UserState>;
}

interface Program {
  /**
   * Record of id:playerName
   */
  players: Record<number, string>;

  /**
   * Record of id:season
   */
  seasons: Record<number, Season>;

  /**
   * full state of every league
   */
  leagues: Record<number, League>;

  // User Api
  // ----------------------------------------------------------------------------------------------------------------

  /**
   * Creates a new league/room with players
   * @param bidAmount
   * @param numberOfPlayers
   * @param invitedPlayers
   * @returns id of league/room
   */
  createLeague(bidAmount: number, numberOfPlayers: number, invitedPlayers?: string[]): string;

  joinLeague(leagueIndex: string): void;

  /**
   * Participate in auction. Update your bids for players.
   * @param bids record of playerName:bid
   */
  bidForPlayers(bids: Record<string, number>): void;

  /**
   * Change list of active players for next game
   * @param players array of players names
   */
  selectInGamePlayers(players: string[]): void;

  /**
   * Ability to ecxhange players between users within league
   * @param player player name to exchange
   * @param to player name to exchange for
   */
  exchangePlayer(player: string, to: string): void;

  // Private Oracle Api
  // ----------------------------------------------------------------------------------------------------------------

  /**
   * Create new season
   * @param season season state
   */
  createNewSeason(season: Season): void;

  /**
   * The way Oracle will bring weekly game scores
   * @param scores
   */
  commitPlayerScores(scores: Record<string, number>, endSeason: boolean): void;
}
