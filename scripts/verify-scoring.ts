import assert from "node:assert/strict";
import {
  applyPointDelta,
  deriveFromGames,
  fingerprintMatch,
  resolveTargetGame,
  type GameState,
} from "../src/lib/match-state";
import { isGameComplete, isMatchComplete } from "../src/lib/scoring";

function games(): GameState[] {
  return Array.from({ length: 5 }, (_, i) => ({
    id: `g${i + 1}`,
    gameNumber: i + 1,
    homePoints: 0,
    awayPoints: 0,
    isComplete: false,
    winnerSide: null,
  }));
}

function scoreTo(list: GameState[], gameNumber: number, home: number, away: number) {
  return list.map((g) => {
    if (g.gameNumber !== gameNumber) return g;
    return {
      ...g,
      homePoints: home,
      awayPoints: away,
      isComplete: isGameComplete(home, away),
      winnerSide: isGameComplete(home, away) ? (home > away ? "HOME" : "AWAY") : null,
    };
  });
}

let g = games();
for (let i = 0; i < 11; i++) {
  const t = resolveTargetGame(g, "HOME", 1);
  g = applyPointDelta(g, t.gameNumber, "HOME", 1);
}
assert.equal(g[0].homePoints, 11);
assert.equal(g[0].isComplete, true);
assert.equal(deriveFromGames(g).homeScore, 1);
assert.equal(deriveFromGames(g).status, "LIVE");

// Undo after game win should target completed game
const undoTarget = resolveTargetGame(g, "HOME", -1);
assert.equal(undoTarget.gameNumber, 1);
g = applyPointDelta(g, undoTarget.gameNumber, "HOME", -1);
assert.equal(g[0].homePoints, 10);
assert.equal(g[0].isComplete, false);

g = scoreTo(g, 1, 11, 0);
g = scoreTo(g, 2, 11, 0);
g = scoreTo(g, 3, 11, 0);
const done = deriveFromGames(g);
assert.equal(done.homeScore, 3);
assert.equal(done.decided, true);
assert.equal(done.status, "COMPLETED");
assert.equal(isMatchComplete(3, 0), true);

const a = fingerprintMatch({
  id: "m1",
  status: "LIVE",
  homeScore: 1,
  awayScore: 0,
  games: g,
});
const b = fingerprintMatch({
  id: "m1",
  status: "LIVE",
  homeScore: 1,
  awayScore: 0,
  games: g,
});
assert.equal(a, b);

console.log("verify-scoring: ok");
