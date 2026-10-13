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

// Classic 21
let g = games();
for (let i = 0; i < 21; i++) {
  const t = resolveTargetGame(g, "HOME", 1);
  g = applyPointDelta(g, t.gameNumber, "HOME", 1, 21);
}
assert.equal(g[0].homePoints, 21);
assert.equal(g[0].isComplete, true);
assert.equal(isGameComplete(21, 19, 21), true);
assert.equal(isGameComplete(21, 20, 21), false);
assert.equal(isGameComplete(11, 9, 11), true);
assert.equal(isGameComplete(11, 10, 11), false);

// Modern 11
g = games();
for (let i = 0; i < 11; i++) {
  const t = resolveTargetGame(g, "HOME", 1);
  g = applyPointDelta(g, t.gameNumber, "HOME", 1, 11);
}
assert.equal(deriveFromGames(g, 11).homeScore, 1);

assert.equal(isMatchComplete(3, 0), true);
assert.equal(
  fingerprintMatch({
    id: "m1",
    status: "LIVE",
    homeScore: 1,
    awayScore: 0,
    games: g,
  }),
  fingerprintMatch({
    id: "m1",
    status: "LIVE",
    homeScore: 1,
    awayScore: 0,
    games: g,
  })
);

console.log("verify-scoring: ok");
