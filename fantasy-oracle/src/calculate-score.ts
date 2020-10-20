import { axios, AxiosResponse } from './axios';

interface ScoreRaw {
  GameKey: string; // '202010122',
  PlayerID: number; // 20981,
  SeasonType: number; // 1,
  Season: number; // 2020,
  GameDate: string; // '2020-09-13T16:25:00',
  Week: number; // 1,
  Team: string; // 'TB',
  Opponent: string; // 'NO',
  HomeOrAway: string; // 'AWAY',
  Number: number; // 45,
  Name: string; // 'Devin White',
  Position: string; // 'ILB',
  PositionCategory: string; // 'DEF',
  Activated: number; // 1,
  Played: number; // 1,
  Started: number; // 1,
  PassingAttempts: number; // 0,
  PassingCompletions: number; // 0,
  PassingYards: number; // 0,
  PassingCompletionPercentage: number; // 0,
  PassingYardsPerAttempt: number; // 0,
  PassingYardsPerCompletion: number; // 0,
  PassingTouchdowns: number; // 0,
  PassingInterceptions: number; // 0,
  PassingRating: number; // 0,
  PassingLong: number; // 0,
  PassingSacks: number; // 0,
  PassingSackYards: number; // 0,
  RushingAttempts: number; // 0,
  RushingYards: number; // 0,
  RushingYardsPerAttempt: number; // 0,
  RushingTouchdowns: number; // 0,
  RushingLong: number; // 0,
  ReceivingTargets: number; // 0,
  Receptions: number; // 0,
  ReceivingYards: number; // 0,
  ReceivingYardsPerReception: number; // 0,
  ReceivingTouchdowns: number; // 0,
  ReceivingLong: number; // 0,
  Fumbles: number; // 0,
  FumblesLost: number; // 0,
  PuntReturns: number; // 0,
  PuntReturnYards: number; // 0,
  PuntReturnYardsPerAttempt: number; // 0,
  PuntReturnTouchdowns: number; // 0,
  PuntReturnLong: number; // 0,
  KickReturns: number; // 0,
  KickReturnYards: number; // 0,
  KickReturnYardsPerAttempt: number; // 0,
  KickReturnTouchdowns: number; // 0,
  KickReturnLong: number; // 0,
  SoloTackles: number; // 7.8,
  AssistedTackles: number; // 6.5,
  TacklesForLoss: number; // 2.6,
  Sacks: number; // 0,
  SackYards: number; // 0,
  QuarterbackHits: number; // 0,
  PassesDefended: number; // 1.3,
  FumblesForced: number; // 0,
  FumblesRecovered: number; // 0,
  FumbleReturnYards: number; // 0,
  FumbleReturnTouchdowns: number; // 0,
  Interceptions: number; // 0,
  InterceptionReturnYards: number; // 0,
  InterceptionReturnTouchdowns: number; // 0,
  BlockedKicks: number; // 0,
  SpecialTeamsSoloTackles: number; // 0,
  SpecialTeamsAssistedTackles: number; // 0,
  MiscSoloTackles: number; // 0,
  MiscAssistedTackles: number; // 0,
  Punts: number; // 0,
  PuntYards: number; // 0,
  PuntAverage: number; // 0,
  FieldGoalsAttempted: number; // 0,
  FieldGoalsMade: number; // 0,
  FieldGoalsLongestMade: number; // 0,
  ExtraPointsMade: number; // 0,
  TwoPointConversionPasses: number; // 0,
  TwoPointConversionRuns: number; // 0,
  TwoPointConversionReceptions: number; // 0,
  FantasyPoints: number; // 13.1,
  FantasyPointsPPR: number; // 13.1,
  ReceptionPercentage: number; // 0,
  ReceivingYardsPerTarget: number; // 0,
  Tackles: number; // 12.5,
  OffensiveTouchdowns: number; // 0,
  DefensiveTouchdowns: number; // 0,
  SpecialTeamsTouchdowns: number; // 0,
  Touchdowns: number; // 0,
  FantasyPosition: string; // 'LB',
  FieldGoalPercentage: number; // 0,
  PlayerGameID: number; // 990513800,
  FumblesOwnRecoveries: number; // 0,
  FumblesOutOfBounds: number; // 0,
  KickReturnFairCatches: number; // 0,
  PuntReturnFairCatches: number; // 0,
  PuntTouchbacks: number; // 0,
  PuntInside20: number; // 0,
  PuntNetAverage: number; // 0,
  ExtraPointsAttempted: number; // 0,
  BlockedKickReturnTouchdowns: number; // 0,
  FieldGoalReturnTouchdowns: number; // 0,
  Safeties: number; // 0,
  FieldGoalsHadBlocked: number; // 0,
  PuntsHadBlocked: number; // 0,
  ExtraPointsHadBlocked: number; // 0,
  PuntLong: number; // 0,
  BlockedKickReturnYards: number; // 0,
  FieldGoalReturnYards: number; // 0,
  PuntNetYards: number; // 0,
  SpecialTeamsFumblesForced: number; // 0,
  SpecialTeamsFumblesRecovered: number; // 0,
  MiscFumblesForced: number; // 0,
  MiscFumblesRecovered: number; // 0,
  ShortName: string; // 'Devin White',
  PlayingSurface: string; // 'Artificial',
  IsGameOver: boolean; // true,
  SafetiesAllowed: number; // 0,
  Stadium: string; // 'Mercedes-Benz Superdome',
  Temperature: number; // 93,
  Humidity: number; // 114,
  WindSpeed: number; // 16,
  FanDuelSalary: null;
  DraftKingsSalary: null;
  FantasyDataSalary: null;
  OffensiveSnapsPlayed: number; // 0,
  DefensiveSnapsPlayed: number; // 77,
  SpecialTeamsSnapsPlayed: number; // 10,
  OffensiveTeamSnaps: number; // 80,
  DefensiveTeamSnaps: number; // 77,
  SpecialTeamsTeamSnaps: number; // 31,
  VictivSalary: null;
  TwoPointConversionReturns: number; // 0,
  FantasyPointsFanDuel: number; // 0,
  FieldGoalsMade0to19: number; // 0,
  FieldGoalsMade20to29: number; // 0,
  FieldGoalsMade30to39: number; // 0,
  FieldGoalsMade40to49: number; // 0,
  FieldGoalsMade50Plus: number; // 0,
  FantasyPointsDraftKings: number; // 0,
  YahooSalary: null;
  FantasyPointsYahoo: number; // 0,
  InjuryStatus: string; // 'Scrambled',
  InjuryBodyPart: string; // 'Scrambled',
  InjuryStartDate: null;
  InjuryNotes: string; // 'Scrambled',
  FanDuelPosition: string; // 'Scrambled',
  DraftKingsPosition: string; // 'Scrambled',
  YahooPosition: string; // 'Scrambled',
  OpponentRank: number; // 17,
  OpponentPositionRank: null;
  InjuryPractice: string; // 'Scrambled',
  InjuryPracticeDescription: string; // 'Scrambled',
  DeclaredInactive: boolean; // false,
  FantasyDraftSalary: null;
  FantasyDraftPosition: null;
  TeamID: number; // 33,
  OpponentID: number; // 22,
  Day: string; // '2020-09-13T00:00:00',
  DateTime: string; // '2020-09-13T16:25:00',
  GlobalGameID: number; // 17274,
  GlobalTeamID: number; // 33,
  GlobalOpponentID: number; // 22,
  ScoreID: number; // 17274,
  FantasyPointsFantasyDraft: number; // 0,
  OffensiveFumbleRecoveryTouchdowns: null;
  ScoringDetails: Array<{
    GameKey: string; // '202010111',
    SeasonType: number; // 1,
    PlayerID: number; // 21684,
    Team: string; // 'DET',
    Season: number; // 2020,
    Week: number; // 1,
    ScoringType: string; // 'RushingTouchdown',
    Length: number; // 1,
    ScoringDetailID: number; // 469391,
    PlayerGameID: number; // 990512135
  }>; // []
}

export async function calculateScore(playerIds: number[]): Promise<number> {
  const response: AxiosResponse<ScoreRaw[]> = await axios.get(
    'https://api.sportsdata.io/v3/nfl/stats/json/PlayerGameStatsByWeek/2020/1?key=014d8886bd8f40dfabc9f75bc0451a0d'
  );
  const playerGameStatsArr = response.data.filter((o) => playerIds.includes(o.PlayerID));

  let totalScore = 0;

  for (const playerGameStats of playerGameStatsArr) {
    // https://www.espn.in/fantasy/football/ffl/story?page=fflrulesstandardscoring
    /**
     * Calculation for Offense
     */
    let offensePositions = ['QB', 'RB', 'WR', 'TE'];
    if (offensePositions.includes(playerGameStats.Position)) {
      /**
       * 6 pts per rushing or receiving TD
       */
      const rushings =
        playerGameStats.RushingAttempts +
        playerGameStats.RushingLong +
        playerGameStats.RushingTouchdowns +
        playerGameStats.RushingYards +
        playerGameStats.RushingYardsPerAttempt;

      const receivings =
        playerGameStats.ReceivingLong +
        playerGameStats.ReceivingTargets +
        playerGameStats.ReceivingTouchdowns +
        playerGameStats.ReceivingYards +
        playerGameStats.ReceivingYardsPerReception +
        playerGameStats.ReceivingYardsPerTarget;

      totalScore += (rushings + receivings) * 6;

      /**
       * 6 pts for player returning kick/punt for TD
       */
      const returningKicksPlunts =
        playerGameStats.PuntReturns +
        playerGameStats.PuntReturnYards +
        playerGameStats.PuntReturnYardsPerAttempt +
        playerGameStats.PuntReturnTouchdowns +
        playerGameStats.PuntReturnLong +
        playerGameStats.KickReturns +
        playerGameStats.KickReturnYards +
        playerGameStats.KickReturnYardsPerAttempt +
        playerGameStats.KickReturnTouchdowns +
        playerGameStats.KickReturnLong +
        playerGameStats.KickReturnFairCatches +
        playerGameStats.PuntReturnFairCatches;

      totalScore += returningKicksPlunts * 6;
    }
  }

  return totalScore;
}
