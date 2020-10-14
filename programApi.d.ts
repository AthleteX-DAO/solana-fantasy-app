interface League {}

interface Program {
  /**
   * list of players available for current/coming season
   * used as initial list for league creating
   */
  availablePlayers: string[];

  /**
   * full state of every league
   */
  leagues: Record<string, League>;

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

  joinLeague(leagueId: string): void;

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
   * Ability to update list of players available for coming season
   * @param players player names
   */
  updatePlayersList(players: string[]): void;

  /**
   * The way Oracle will bring weekly game scores
   * @param scores
   */
  commitPlayerScores(scores: Record<string, number>, endSeason: boolean): void;
}
