const { createDeck, dealCards } = require("./deck.js");
const {
  createGame,
  chooseContract,
  playCardTricks,
  playCardRentz,
  skipTurnRentz,
  findTrickWinner,
  updateRentzTable,
  checkRentzFinish,
  advancePlayer,
  isTheCardPlayedLegal,
  removeCardFromHandAfterBeingPlayed,
} = require("./game.js");
const {
  scoreDiamonds,
  scoreRedPope,
  scoreTotals,
  scoreRentz,
} = require("./scoring.js");
const {
  MIN_PLAYERS,
  MAX_PLAYERS,
  CARDS_PER_PLAYER,
  RANKS_MIN_PLAYERS,
  RANKS_MAX_PLAYERS,
  SUITS,
  HEARTS_SUIT,
  DIAMONDS_SUIT,
  SPADES_SUIT,
  CLOVER_SUIT,
  RED_POPE_CONTRACT,
  DIAMONDS_CONTRACT,
  TOTALS_CONTRACT,
  RENTZ_CONTRACT,
  RED_POPE_PENALTY,
  DIAMOND_PENALTY,
  TOTALS_TRICK_PENALTY,
  QUEEN_PENALTY,
  RENTZ_STARTING_GAIN,
  RENTZ_TAX,
  RENTZ_STARTING_RANK,
  K_RANK,
  Q_RANK,
  A_RANK,
  LOWEST_RANK_MIN_PLAYERS,
  LOWEST_RANK_MAX_PLAYERS,
} = require("./constants.js");

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  PASS: ${name}`);
    passed++;
  } catch (e) {
    console.log(`  FAIL: ${name}`);
    console.log(`        ${e.message}`);
    failed++;
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message || "Assertion failed");
}

// -------------------------------------------------
console.log("\nDECK TESTS");
// -------------------------------------------------

test("5 players produces 40 cards", () => {
  const deck = createDeck(MIN_PLAYERS, CARDS_PER_PLAYER);
  assert(deck.cards.length === 40, `Expected 40, got ${deck.cards.length}`);
});

test("6 players produces 48 cards", () => {
  const deck = createDeck(MAX_PLAYERS, CARDS_PER_PLAYER);
  assert(deck.cards.length === 48, `Expected 48, got ${deck.cards.length}`);
});

test("Deck contains no duplicate cards", () => {
  const deck = createDeck(MIN_PLAYERS, CARDS_PER_PLAYER);
  const seen = new Set();
  for (const card of deck.cards) {
    const key = card.suit + card.rank;
    assert(!seen.has(key), `Duplicate card found: ${key}`);
    seen.add(key);
  }
});

test("Invalid player count throws error", () => {
  let threw = false;
  try { createDeck(4, CARDS_PER_PLAYER); } catch (e) { threw = true; }
  assert(threw, "Should throw for 4 players");
});

test("5 player deck contains correct ranks", () => {
  const deck = createDeck(MIN_PLAYERS, CARDS_PER_PLAYER);
  const ranks = [...new Set(deck.cards.map(c => c.rank))].sort();
  const expected = [...new Set(RANKS_MIN_PLAYERS)].sort();
  assert(JSON.stringify(ranks) === JSON.stringify(expected), `Got: ${ranks}`);
});

test("6 player deck contains correct ranks", () => {
  const deck = createDeck(MAX_PLAYERS, CARDS_PER_PLAYER);
  const ranks = [...new Set(deck.cards.map(c => c.rank))].sort();
  const expected = [...new Set(RANKS_MAX_PLAYERS)].sort();
  assert(JSON.stringify(ranks) === JSON.stringify(expected), `Got: ${ranks}`);
});

test("Deal gives each player correct number of cards", () => {
  const deck = createDeck(MIN_PLAYERS, CARDS_PER_PLAYER);
  const hands = dealCards(deck, MIN_PLAYERS);
  for (const hand of hands) {
    assert(hand.length === CARDS_PER_PLAYER, `Expected ${CARDS_PER_PLAYER}, got ${hand.length}`);
  }
});

test("Deal rejects mismatched player count", () => {
  let threw = false;
  const deck = createDeck(MIN_PLAYERS, CARDS_PER_PLAYER);
  try { dealCards(deck, MAX_PLAYERS); } catch (e) { threw = true; }
  assert(threw, "Should throw for mismatched player count");
});

// -------------------------------------------------
console.log("\nGAME SETUP TESTS");
// -------------------------------------------------

test("createGame initializes scores to 0", () => {
  const game = createGame(["Alice", "Bob", "Charlie", "Diana", "Eve"]);
  for (const p of game.players) {
    assert(game.scores[p] === 0, `${p} score should be 0`);
  }
});

test("createGame gives each player 4 contracts", () => {
  const game = createGame(["Alice", "Bob", "Charlie", "Diana", "Eve"]);
  for (const p of game.players) {
    assert(game.contractsAvailable[p].length === 4, `${p} should have 4 contracts`);
  }
});

test("createGame starts at player index 0", () => {
  const game = createGame(["Alice", "Bob", "Charlie", "Diana", "Eve"]);
  assert(game.currentPlayerIndex === 0, "Should start at index 0");
});

test("createGame sets currentContract to null", () => {
  const game = createGame(["Alice", "Bob", "Charlie", "Diana", "Eve"]);
  assert(game.currentContract.name === null, "Contract name should be null");
  assert(game.currentContract.isBlind === false, "isBlind should be false");
});

test("createGame rejects invalid player count", () => {
  let threw = false;
  try { createGame(["A", "B", "C"]); } catch (e) { threw = true; }
  assert(threw, "Should throw for 3 players");
});

test("createGame shuffles player order", () => {
  const original = ["Alice", "Bob", "Charlie", "Diana", "Eve"];
  const firstPlayers = new Set();
  for (let i = 0; i < 20; i++) {
    const game = createGame([...original]);
    firstPlayers.add(game.players[0]);
  }
  assert(firstPlayers.size > 1, "Player order should vary across games");
});

test("createGame gives each player independent contract list", () => {
  const game = createGame(["Alice", "Bob", "Charlie", "Diana", "Eve"]);
  game.contractsAvailable[game.players[0]].splice(0, 1);
  assert(
    game.contractsAvailable[game.players[1]].length === 4,
    "Removing contract from player 0 should not affect player 1"
  );
});

test("createGame initializes rentzTable with all null suits", () => {
  const game = createGame(["Alice", "Bob", "Charlie", "Diana", "Eve"]);
  for (const suit of SUITS) {
    assert(game.rentzTable[suit] === null, `${suit} should be null`);
  }
});

// -------------------------------------------------
console.log("\nCONTRACT TESTS");
// -------------------------------------------------

test("chooseContract sets contract name and blind status", () => {
  let game = createGame(["Alice", "Bob", "Charlie", "Diana", "Eve"]);
  game = chooseContract(game, 0, RENTZ_CONTRACT, false);
  assert(game.currentContract.name === RENTZ_CONTRACT, "Contract should be Rentz");
  assert(game.currentContract.isBlind === false, "Should not be blind");
});

test("chooseContract blind sets isBlind to true", () => {
  let game = createGame(["Alice", "Bob", "Charlie", "Diana", "Eve"]);
  game = chooseContract(game, 0, RENTZ_CONTRACT, true);
  assert(game.currentContract.isBlind === true, "Should be blind");
});

test("chooseContract removes contract from player available list", () => {
  let game = createGame(["Alice", "Bob", "Charlie", "Diana", "Eve"]);
  const firstPlayer = game.players[0];
  game = chooseContract(game, 0, RENTZ_CONTRACT, false);
  assert(
    !game.contractsAvailable[firstPlayer].includes(RENTZ_CONTRACT),
    "Rentz should be removed from available contracts"
  );
});

test("chooseContract advances currentPlayerIndex", () => {
  let game = createGame(["Alice", "Bob", "Charlie", "Diana", "Eve"]);
  game = chooseContract(game, 0, RENTZ_CONTRACT, false);
  assert(game.currentPlayerIndex === 1, "Should advance to player 1");
});

test("chooseContract wraps currentPlayerIndex at end", () => {
  let game = createGame(["Alice", "Bob", "Charlie", "Diana", "Eve"]);
  game = chooseContract(game, 0, RENTZ_CONTRACT, false);
  game = chooseContract(game, 1, DIAMONDS_CONTRACT, false);
  game = chooseContract(game, 2, TOTALS_CONTRACT, false);
  game = chooseContract(game, 3, RED_POPE_CONTRACT, false);
  game = chooseContract(game, 4, RENTZ_CONTRACT, false);
  assert(game.currentPlayerIndex === 0, "Should wrap back to 0");
});

test("chooseContract rejects wrong player turn", () => {
  let threw = false;
  const game = createGame(["Alice", "Bob", "Charlie", "Diana", "Eve"]);
  try { chooseContract(game, 2, RENTZ_CONTRACT, false); } catch (e) { threw = true; }
  assert(threw, "Should throw when wrong player chooses");
});

test("chooseContract rejects already used contract", () => {
  let threw = false;
  let game = createGame(["Alice", "Bob", "Charlie", "Diana", "Eve"]);
  game = chooseContract(game, 0, RENTZ_CONTRACT, false);
  game = chooseContract(game, 1, DIAMONDS_CONTRACT, false);
  game = chooseContract(game, 2, TOTALS_CONTRACT, false);
  game = chooseContract(game, 3, RED_POPE_CONTRACT, false);
  game = chooseContract(game, 4, RENTZ_CONTRACT, false);
  try { chooseContract(game, 0, RENTZ_CONTRACT, false); } catch (e) { threw = true; }
  assert(threw, "Should throw when contract already used");
});

test("chooseContract deals cards to all players", () => {
  let game = createGame(["Alice", "Bob", "Charlie", "Diana", "Eve"]);
  game = chooseContract(game, 0, RENTZ_CONTRACT, false);
  for (const p of game.players) {
    assert(game.hands[p].length === CARDS_PER_PLAYER, `${p} should have ${CARDS_PER_PLAYER} cards`);
  }
});

test("chooseContract resets tricksTaken and cardsTaken", () => {
  let game = createGame(["Alice", "Bob", "Charlie", "Diana", "Eve"]);
  game = chooseContract(game, 0, DIAMONDS_CONTRACT, false);
  game = chooseContract(game, 1, RENTZ_CONTRACT, false);
  for (const p of game.players) {
    assert(game.tricksTaken[p] === 0, `${p} tricksTaken should be 0`);
    assert(game.cardsTaken[p].length === 0, `${p} cardsTaken should be empty`);
  }
});

test("chooseContract resets rentzTable", () => {
  let game = createGame(["Alice", "Bob", "Charlie", "Diana", "Eve"]);
  game = chooseContract(game, 0, RENTZ_CONTRACT, false);
  game = chooseContract(game, 1, DIAMONDS_CONTRACT, false);
  for (const suit of SUITS) {
    assert(game.rentzTable[suit] === null, `${suit} should reset to null`);
  }
});

// -------------------------------------------------
console.log("\nHELPER FUNCTION TESTS");
// -------------------------------------------------

test("advancePlayer increments currentPlayerIndex", () => {
  const game = createGame(["Alice", "Bob", "Charlie", "Diana", "Eve"]);
  advancePlayer(game);
  assert(game.currentPlayerIndex === 1, "Should advance to 1");
});

test("advancePlayer wraps at end of player list", () => {
  const game = createGame(["Alice", "Bob", "Charlie", "Diana", "Eve"]);
  game.currentPlayerIndex = 4;
  advancePlayer(game);
  assert(game.currentPlayerIndex === 0, "Should wrap to 0");
});

test("isTheCardPlayedLegal allows card matching lead suit", () => {
  let game = createGame(["Alice", "Bob", "Charlie", "Diana", "Eve"]);
  game = chooseContract(game, 0, DIAMONDS_CONTRACT, false);
  game.leadSuit = HEARTS_SUIT;
  game.hands[game.players[0]] = [{ suit: HEARTS_SUIT, rank: A_RANK }];
  const result = isTheCardPlayedLegal(game, 0, { suit: HEARTS_SUIT, rank: A_RANK });
  assert(result === true, "Should allow matching suit");
});

test("isTheCardPlayedLegal rejects card when player has lead suit", () => {
  let game = createGame(["Alice", "Bob", "Charlie", "Diana", "Eve"]);
  game = chooseContract(game, 0, DIAMONDS_CONTRACT, false);
  game.leadSuit = HEARTS_SUIT;
  game.hands[game.players[0]] = [
    { suit: HEARTS_SUIT, rank: A_RANK },
    { suit: SPADES_SUIT, rank: K_RANK }
  ];
  const result = isTheCardPlayedLegal(game, 0, { suit: SPADES_SUIT, rank: K_RANK });
  assert(result === false, "Should reject when player has lead suit card");
});

test("isTheCardPlayedLegal allows any card when no lead suit set", () => {
  let game = createGame(["Alice", "Bob", "Charlie", "Diana", "Eve"]);
  game = chooseContract(game, 0, DIAMONDS_CONTRACT, false);
  game.hands[game.players[0]] = [{ suit: SPADES_SUIT, rank: A_RANK }];
  const result = isTheCardPlayedLegal(game, 0, { suit: SPADES_SUIT, rank: A_RANK });
  assert(result === true, "Should allow any card when no lead suit");
});

test("removeCardFromHandAfterBeingPlayed removes correct card", () => {
  let game = createGame(["Alice", "Bob", "Charlie", "Diana", "Eve"]);
  game = chooseContract(game, 0, DIAMONDS_CONTRACT, false);
  game.hands[game.players[0]] = [
    { suit: HEARTS_SUIT, rank: A_RANK },
    { suit: SPADES_SUIT, rank: K_RANK }
  ];
  removeCardFromHandAfterBeingPlayed(game, 0, { suit: HEARTS_SUIT, rank: A_RANK });
  assert(game.hands[game.players[0]].length === 1, "Should have 1 card left");
  assert(game.hands[game.players[0]][0].rank === K_RANK, "Remaining card should be K");
});

test("findTrickWinner returns player with highest lead suit card", () => {
  const trick = [
    { playerIndex: 0, card: { suit: HEARTS_SUIT, rank: RENTZ_STARTING_RANK } },
    { playerIndex: 1, card: { suit: HEARTS_SUIT, rank: A_RANK } },
    { playerIndex: 2, card: { suit: SPADES_SUIT, rank: K_RANK } },
    { playerIndex: 3, card: { suit: HEARTS_SUIT, rank: "7" } },
    { playerIndex: 4, card: { suit: HEARTS_SUIT, rank: Q_RANK } },
  ];
  const winner = findTrickWinner(trick, HEARTS_SUIT);
  assert(winner === 1, `Expected player 1 to win, got player ${winner}`);
});

test("findTrickWinner ignores cards of wrong suit", () => {
  const trick = [
    { playerIndex: 0, card: { suit: HEARTS_SUIT, rank: "7" } },
    { playerIndex: 1, card: { suit: SPADES_SUIT, rank: A_RANK } },
  ];
  const winner = findTrickWinner(trick, HEARTS_SUIT);
  assert(winner === 0, `Expected player 0 to win, got player ${winner}`);
});

// -------------------------------------------------
console.log("\nSCORING TESTS");
// -------------------------------------------------

test("scoreDiamonds subtracts DIAMOND_PENALTY per diamond taken", () => {
  let game = createGame(["Alice", "Bob", "Charlie", "Diana", "Eve"]);
  game = chooseContract(game, 0, DIAMONDS_CONTRACT, false);
  game.cardsTaken[game.players[0]] = [
    { suit: DIAMONDS_SUIT, rank: A_RANK },
    { suit: DIAMONDS_SUIT, rank: K_RANK },
    { suit: HEARTS_SUIT, rank: A_RANK },
  ];
  game = scoreDiamonds(game);
  assert(
    game.scores[game.players[0]] === -(DIAMOND_PENALTY * 2),
    `Expected ${-(DIAMOND_PENALTY * 2)}, got ${game.scores[game.players[0]]}`
  );
});

test("scoreDiamonds doubles penalty when blind", () => {
  let game = createGame(["Alice", "Bob", "Charlie", "Diana", "Eve"]);
  game = chooseContract(game, 0, DIAMONDS_CONTRACT, true);
  game.cardsTaken[game.players[0]] = [
    { suit: DIAMONDS_SUIT, rank: A_RANK },
  ];
  game = scoreDiamonds(game);
  assert(
    game.scores[game.players[0]] === -(DIAMOND_PENALTY * 2),
    `Expected ${-(DIAMOND_PENALTY * 2)}, got ${game.scores[game.players[0]]}`
  );
});

test("scoreRedPope subtracts RED_POPE_PENALTY for King of Hearts", () => {
  let game = createGame(["Alice", "Bob", "Charlie", "Diana", "Eve"]);
  game = chooseContract(game, 0, RED_POPE_CONTRACT, false);
  game.cardsTaken[game.players[0]] = [
    { suit: HEARTS_SUIT, rank: K_RANK },
  ];
  game = scoreRedPope(game);
  assert(
    game.scores[game.players[0]] === -RED_POPE_PENALTY,
    `Expected ${-RED_POPE_PENALTY}, got ${game.scores[game.players[0]]}`
  );
});

test("scoreRedPope doubles penalty when blind", () => {
  let game = createGame(["Alice", "Bob", "Charlie", "Diana", "Eve"]);
  game = chooseContract(game, 0, RED_POPE_CONTRACT, true);
  game.cardsTaken[game.players[0]] = [
    { suit: HEARTS_SUIT, rank: K_RANK },
  ];
  game = scoreRedPope(game);
  assert(
    game.scores[game.players[0]] === -(RED_POPE_PENALTY * 2),
    `Expected ${-(RED_POPE_PENALTY * 2)}, got ${game.scores[game.players[0]]}`
  );
});

test("scoreTotals applies all penalty rules correctly", () => {
  let game = createGame(["Alice", "Bob", "Charlie", "Diana", "Eve"]);
  game = chooseContract(game, 0, TOTALS_CONTRACT, false);
  const p = game.players[0];
  game.tricksTaken[p] = 2;
  game.cardsTaken[p] = [
    { suit: HEARTS_SUIT, rank: K_RANK },   // -RED_POPE_PENALTY
    { suit: DIAMONDS_SUIT, rank: A_RANK }, // -DIAMOND_PENALTY
    { suit: SPADES_SUIT, rank: Q_RANK },   // -QUEEN_PENALTY
    { suit: DIAMONDS_SUIT, rank: Q_RANK }, // -QUEEN_PENALTY -DIAMOND_PENALTY
  ];
  game = scoreTotals(game);
  const expected = -(
    TOTALS_TRICK_PENALTY * 2 +
    RED_POPE_PENALTY +
    DIAMOND_PENALTY +
    QUEEN_PENALTY +
    QUEEN_PENALTY + DIAMOND_PENALTY
  );
  assert(game.scores[p] === expected, `Expected ${expected}, got ${game.scores[p]}`);
});

test("scoreTotals doubles all penalties when blind", () => {
  let game = createGame(["Alice", "Bob", "Charlie", "Diana", "Eve"]);
  game = chooseContract(game, 0, TOTALS_CONTRACT, true);
  const p = game.players[0];
  game.tricksTaken[p] = 1;
  game.cardsTaken[p] = [
    { suit: DIAMONDS_SUIT, rank: A_RANK },
  ];
  game = scoreTotals(game);
  const expected = -((TOTALS_TRICK_PENALTY + DIAMOND_PENALTY) * 2);
  assert(game.scores[p] === expected, `Expected ${expected}, got ${game.scores[p]}`);
});

test("scoreRentz assigns correct points by finish order", () => {
  let game = createGame(["Alice", "Bob", "Charlie", "Diana", "Eve"]);
  game = chooseContract(game, 0, RENTZ_CONTRACT, false);
  game.rentzFinishOrder = [2, 0, 4, 1, 3];
  game = scoreRentz(game);
  assert(game.scores[game.players[2]] === RENTZ_STARTING_GAIN, `1st should get ${RENTZ_STARTING_GAIN}`);
  assert(game.scores[game.players[0]] === RENTZ_STARTING_GAIN - RENTZ_TAX, `2nd should get ${RENTZ_STARTING_GAIN - RENTZ_TAX}`);
  assert(game.scores[game.players[4]] === RENTZ_STARTING_GAIN - RENTZ_TAX * 2, `3rd should get ${RENTZ_STARTING_GAIN - RENTZ_TAX * 2}`);
});

test("scoreRentz doubles points when blind", () => {
  let game = createGame(["Alice", "Bob", "Charlie", "Diana", "Eve"]);
  game = chooseContract(game, 0, RENTZ_CONTRACT, true);
  game.rentzFinishOrder = [0, 1, 2, 3, 4];
  game = scoreRentz(game);
  assert(
    game.scores[game.players[0]] === RENTZ_STARTING_GAIN * 2,
    `1st should get ${RENTZ_STARTING_GAIN * 2} when blind`
  );
  assert(
    game.scores[game.players[1]] === (RENTZ_STARTING_GAIN - RENTZ_TAX) * 2,
    `2nd should get ${(RENTZ_STARTING_GAIN - RENTZ_TAX) * 2} when blind`
  );
});

// -------------------------------------------------
console.log("\nRENTZ GAMEPLAY TESTS");
// -------------------------------------------------

test("updateRentzTable rejects non-10 as first card", () => {
  let threw = false;
  let game = createGame(["Alice", "Bob", "Charlie", "Diana", "Eve"]);
  game = chooseContract(game, 0, RENTZ_CONTRACT, false);
  try { updateRentzTable(game, { suit: SPADES_SUIT, rank: A_RANK }); } catch (e) { threw = true; }
  assert(threw, "Should throw if first card is not a 10");
});

test("updateRentzTable initializes row when 10 is played", () => {
  let game = createGame(["Alice", "Bob", "Charlie", "Diana", "Eve"]);
  game = chooseContract(game, 0, RENTZ_CONTRACT, false);
  updateRentzTable(game, { suit: SPADES_SUIT, rank: RENTZ_STARTING_RANK });
  assert(game.rentzTable[SPADES_SUIT] !== null, "Spades row should be initialized");
  assert(game.rentzTable[SPADES_SUIT].low === RENTZ_STARTING_RANK, "Low should be 10");
  assert(game.rentzTable[SPADES_SUIT].high === RENTZ_STARTING_RANK, "High should be 10");
});

test("updateRentzTable extends row upward correctly", () => {
  let game = createGame(["Alice", "Bob", "Charlie", "Diana", "Eve"]);
  game = chooseContract(game, 0, RENTZ_CONTRACT, false);
  game.rentzTable[SPADES_SUIT] = { low: RENTZ_STARTING_RANK, high: RENTZ_STARTING_RANK };
  updateRentzTable(game, { suit: SPADES_SUIT, rank: "J" });
  assert(game.rentzTable[SPADES_SUIT].high === "J", "High should extend to J");
});

test("updateRentzTable extends row downward correctly", () => {
  let game = createGame(["Alice", "Bob", "Charlie", "Diana", "Eve"]);
  game = chooseContract(game, 0, RENTZ_CONTRACT, false);
  game.rentzTable[SPADES_SUIT] = { low: RENTZ_STARTING_RANK, high: RENTZ_STARTING_RANK };
  updateRentzTable(game, { suit: SPADES_SUIT, rank: "9" });
  assert(game.rentzTable[SPADES_SUIT].low === "9", "Low should extend to 9");
});

test("updateRentzTable rejects card that does not extend row", () => {
  let threw = false;
  let game = createGame(["Alice", "Bob", "Charlie", "Diana", "Eve"]);
  game = chooseContract(game, 0, RENTZ_CONTRACT, false);
  game.rentzTable[SPADES_SUIT] = { low: RENTZ_STARTING_RANK, high: RENTZ_STARTING_RANK };
  try { updateRentzTable(game, { suit: SPADES_SUIT, rank: "8" }); } catch (e) { threw = true; }
  assert(threw, "Should throw for non-consecutive card");
});

test("skipTurnRentz rejects skip when valid card exists", () => {
  let threw = false;
  let game = createGame(["Alice", "Bob", "Charlie", "Diana", "Eve"]);
  game = chooseContract(game, 0, RENTZ_CONTRACT, false);
  game.currentPlayerIndex = 0;
  game.rentzTable[SPADES_SUIT] = { low: RENTZ_STARTING_RANK, high: RENTZ_STARTING_RANK };
  game.hands[game.players[0]] = [{ suit: SPADES_SUIT, rank: "J" }];
  try { skipTurnRentz(game, 0); } catch (e) { threw = true; }
  assert(threw, "Should throw if player has a valid card");
});

test("skipTurnRentz allows skip when no valid card exists", () => {
  let game = createGame(["Alice", "Bob", "Charlie", "Diana", "Eve"]);
  game = chooseContract(game, 0, RENTZ_CONTRACT, false);
  game.currentPlayerIndex = 0;
  game.rentzTable[SPADES_SUIT] = { low: LOWEST_RANK_MIN_PLAYERS, high: A_RANK };
  game.rentzTable[HEARTS_SUIT] = { low: LOWEST_RANK_MIN_PLAYERS, high: A_RANK };
  game.rentzTable[DIAMONDS_SUIT] = { low: LOWEST_RANK_MIN_PLAYERS, high: A_RANK };
  game.rentzTable[CLOVER_SUIT] = { low: LOWEST_RANK_MIN_PLAYERS, high: A_RANK };
  game.hands[game.players[0]] = [{ suit: SPADES_SUIT, rank: LOWEST_RANK_MIN_PLAYERS }];
  game = skipTurnRentz(game, 0);
  assert(game.currentPlayerIndex === 1, "Should advance to next player");
});

test("skipTurnRentz rejects wrong player turn", () => {
  let threw = false;
  let game = createGame(["Alice", "Bob", "Charlie", "Diana", "Eve"]);
  game = chooseContract(game, 0, RENTZ_CONTRACT, false);
  try { skipTurnRentz(game, 0); } catch (e) { threw = true; }
  assert(threw, "Should throw when wrong player tries to skip");
});

// -------------------------------------------------
console.log("\n-------------------------------------------------");
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log("-------------------------------------------------\n");