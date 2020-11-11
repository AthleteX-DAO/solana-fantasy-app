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

export async function calculateScore(playerExternalIds: number[], week: number) {
  console.log('number of players for calculating score', playerExternalIds.length);

  const response: AxiosResponse<ScoreRaw[]> = await axios.get(
    `https://api.sportsdata.io/v3/nfl/stats/json/PlayerGameStatsByWeek/2020/${week}?key=014d8886bd8f40dfabc9f75bc0451a0d`
  );

  const playerGameStatsArr = response.data.filter((o) => playerExternalIds.includes(o.PlayerID));
  console.log('received scores from API only for', playerGameStatsArr.length);

  const notMatched: number[] = [];
  playerExternalIds.forEach((externalId) => {
    const res = playerGameStatsArr.map((p) => p.PlayerID).includes(externalId);
    if (!res) {
      // console.log(externalId, 'not matched');
      notMatched.push(externalId);
    }
  });

  console.log(
    'not matched to these external ids',
    notMatched.sort((a, b) => {
      return a > b ? 1 : -1;
    })
  );

  let totalScore = 0;
  let scoresArr: Array<number> = Array(playerExternalIds.length).fill(0);

  for (const playerGameStats of playerGameStatsArr) {
    const playerId = playerGameStats.PlayerID;
    // https://www.espn.in/fantasy/football/ffl/story?page=fflrulesstandardscoring
    /**
     * Calculation for Offense STARTS here
     */
    let playerScore = 0;

    let offensePositions = ['QB', 'RB', 'WR', 'TE'];
    if (offensePositions.includes(playerGameStats.Position)) {
      /**
       * 6 pts per rushing or receiving TD
       */
      {
        const rushings = playerGameStats.RushingTouchdowns;
        const receivings = playerGameStats.ReceivingTouchdowns;

        playerScore += (rushings + receivings) * 6;
      }

      /**
       * 6 pts for player returning kick/punt for TD
       */
      {
        const returningKicksPlunts =
          playerGameStats.PuntReturnTouchdowns + playerGameStats.KickReturnTouchdowns;

        playerScore += returningKicksPlunts * 6;
      }

      /**
       * 6 pts for player returning or recovering a fumble for TD
       */
      {
        const fumbles =
          playerGameStats.FumbleReturnTouchdowns +
          (playerGameStats.OffensiveFumbleRecoveryTouchdowns ?? 0); //+

        playerScore += fumbles * 6;
      }

      /**
       * 4 pts per passing TD
       */
      {
        const passingTd = playerGameStats.PassingTouchdowns;

        playerScore += passingTd * 4;
      }

      /**
       * 2 pts per rushing or receiving 2 pt conversion (note: teams do not receive points for yardage gained during the conversion)
       */
      {
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

        playerScore += (rushings + receivings) * 2;
      }

      /**
       * 2 pts per passing 2 pt conversion
       */
      {
        const passing =
          playerGameStats.PassingAttempts +
          playerGameStats.PassingCompletions +
          playerGameStats.PassingInterceptions +
          playerGameStats.PassingLong +
          playerGameStats.PassingSackYards +
          playerGameStats.PassingSacks +
          playerGameStats.PassingTouchdowns +
          playerGameStats.PassingYards;

        playerScore += passing * 2;
      }

      /**
       * 1 pt per 10 yards rushing or receiving
       */
      {
        const rushings = playerGameStats.RushingYards;

        const receivings = playerGameStats.ReceivingYards;

        playerScore += Math.floor((rushings + receivings) / 10) * 1;
      }

      /**
       * 1 pt per 25 yards passing
       */
      {
        const passing = playerGameStats.PassingYards;

        playerScore += Math.floor(passing / 25) * 1;
      }

      /**
       *  Calculation for Offense Bonous Points
       */
      {
        /**
         * 2 pts per rushing or receiving TD of 40 yards or more
         */
        {
          const rushings = playerGameStats.RushingYards;
          const receivings = playerGameStats.ReceivingYards;

          playerScore += Math.floor((rushings + receivings) / 40) * 2;
        }

        /**
         * 2 pts per passing TD of 40 yards or more (note: the player must score a touchdown to score the points)
         */
        {
          const passing = playerGameStats.PassingYards;

          playerScore += Math.floor(passing / 40) * 1;
        }
      }

      /**
       *  Calculation for Offense Penalty Points
       */
      {
        /**
         * -2 pts per intercepted pass
         */
        {
          const passing = playerGameStats.PassingInterceptions;

          playerScore += passing * -2;
        }

        /**
         * -2 pts per fumble lost
         */
        {
          const fumbles = playerGameStats.FumblesLost;

          playerScore += fumbles * 6;
        }
      }
    }
    /**
     * Calculation for Offense ENDS here
     */

    /**
     * Calculation for Kickers (K) STARTS here
     */
    let kickersPositions = ['K'];
    if (kickersPositions.includes(playerGameStats.Position)) {
      /**
       * 5 pts per 50+ yard FG made
       */
      {
        const fg = playerGameStats.FieldGoalsMade50Plus;
        playerScore += fg * 5;
      }

      /**
       * 4 pts per 40-49 yard FG made
       */
      {
        const fg = playerGameStats.FieldGoalsMade40to49;
        playerScore += fg * 4;
      }

      /**
       * 3 pts per FG made, 39 yards or less
       */
      {
        const fg =
          playerGameStats.FieldGoalsMade0to19 +
          playerGameStats.FieldGoalsMade20to29 +
          playerGameStats.FieldGoalsMade30to39;

        playerScore += fg * 3;
      }

      /**
       * 2 pts per rushing, passing, or receiving 2 pt conversion
       */
      {
        const rushings = playerGameStats.RushingAttempts;
        const receivings =
          playerGameStats.ReceivingLong +
          playerGameStats.ReceivingTargets +
          playerGameStats.ReceivingTouchdowns;

        const passing = playerGameStats.PassingAttempts;

        playerScore += (rushings + passing + receivings) * 2;
      }

      /**
       * 1 pt per Extra Point made
       */
      {
        const extraPoint = playerGameStats.ExtraPointsMade;

        playerScore += extraPoint * 1;
      }

      /**
       * Kickers Penalty Points
       */

      /**
       * -2 pts per missed FG (0-39 yds)
       */
      {
        // i think there can be different/specific props here outside of interface
        const missedFG = 0;
        // playerGameStats.FieldGoalPercentage +
        // playerGameStats.FieldGoalReturnTouchdowns +
        // playerGameStats.FieldGoalReturnYards +
        // playerGameStats.FieldGoalsAttempted +
        // playerGameStats.FieldGoalsHadBlocked +
        // playerGameStats.FieldGoalsLongestMade +
        // playerGameStats.FieldGoalsMade +
        // playerGameStats.FieldGoalsMade0to19 +
        // playerGameStats.FieldGoalsMade20to29 +
        // playerGameStats.FieldGoalsMade30to39; //+
        // playerGameStats.FieldGoalsMade40to49 +
        // playerGameStats.FieldGoalsMade50Plus +
        // playerGameStats.FantasyPointsDraftKings;
        // playerGameStats.fg

        playerScore += missedFG * -2;
      }

      /**
       * -1 pt per missed FG (40-49 yds)
       * (note: a missed FG includes any attempt that is blocked, deflected, etc.)
       */
      {
        // i think there can be different/specific props here outside of interface
        const missedFG = 0;
        // playerGameStats.FieldGoalPercentage +
        // playerGameStats.FieldGoalReturnTouchdowns +
        // playerGameStats.FieldGoalReturnYards +
        // playerGameStats.FieldGoalsAttempted +
        // playerGameStats.FieldGoalsHadBlocked +
        // playerGameStats.FieldGoalsLongestMade +
        // playerGameStats.FieldGoalsMade +
        // playerGameStats.FieldGoalsMade0to19 +
        // playerGameStats.FieldGoalsMade20to29 +
        // playerGameStats.FieldGoalsMade30to39 +
        // playerGameStats.FieldGoalsMade40to49 +
        // playerGameStats.FieldGoalsMade50Plus +
        // playerGameStats.FantasyPointsDraftKings;

        playerScore += missedFG * -1;
      }
    }
    /**
     * Calculation for Kickers (K) ENDS here
     */

    /**
     * Defensive/Special Teams (D) STARTS here
     */
    let defensivePositions = ['D'];
    if (defensivePositions.includes(playerGameStats.Position)) {
      /**
       * 3 pts per defensive or special teams TD
       */
      {
        const td = playerGameStats.DefensiveTouchdowns + playerGameStats.SpecialTeamsTouchdowns;

        playerScore += td * 3;
      }

      /**
       * 2 pts per interception
       */
      {
        const interceptions = playerGameStats.Interceptions;

        playerScore += interceptions * 2;
      }

      /**
       * 2 pts per fumble recovery (Note: includes a fumble by the opposing team out of the end zone)
       */
      {
        const fumbleRecovery =
          playerGameStats.FumblesOwnRecoveries + playerGameStats.FumblesRecovered;

        playerScore += fumbleRecovery * 2;
      }

      /**
       * 2 pts per blocked punt, PAT, or FG (Note: a deflected kick of any kind does not receive points)
       */
      {
        const blocked =
          playerGameStats.BlockedKicks +
          playerGameStats.FieldGoalsHadBlocked +
          playerGameStats.PuntsHadBlocked;

        playerScore += blocked * 2;
      }

      /**
       * 2 pts per safety
       */
      {
        const safety = playerGameStats.Safeties; //+ playerGameStats.SafetiesAllowed;

        playerScore += safety * 2;
      }

      /**
       * 1 pt per sack
       */
      {
        const sack = playerGameStats.Sacks;
        playerScore += sack * 1;
      }
    }
    /**
     * Defensive/Special Teams (D) ENDS here
     */
    totalScore += playerScore;

    const index = playerExternalIds.indexOf(playerId);
    if (index === -1) {
      // this error should not be happen, but if does then it is singnal for a bug
      console.log(playerExternalIds, playerId);

      throw new Error(`Player of index ${index} with id ${playerId} not available`);
    }

    if (playerScore < 0) {
      playerScore = 0;
    }
    scoresArr[index] = playerScore ?? 0;
  }

  return { totalScore, scoresArr };
}
