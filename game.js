const { createDeck, dealCards } = require("./deck.js");
const { scoreDiamonds, scoreRedPope, scoreTotals, scoreRentz } = require("./scoring.js");
const {MIN_PLAYERS, MAX_PLAYERS, CARDS_PER_PLAYER, SUITS, ERR_INVALID_PLAYER_COUNT, 
    SPADES_SUIT, HEARTS_SUIT, DIAMONDS_SUIT, CLOVER_SUIT, CONTRACTS,
    ERR_INVALID_PLAYER_TURN,
    ERR_UNAVAILABLE_CONTRACT,
    ERR_INVALID_CARD_PLAYED,
    RED_POPE_CONTRACT,
    DIAMONDS_CONTRACT,
    TOTALS_CONTRACT,
    K_RANK,
    RANK_ORDER,
    LOWEST_RANK_MIN_PLAYERS,
    LOWEST_RANK_MAX_PLAYERS,
    RENTZ_STARTING_RANK,
    ERR_INVALID_RENTZ_START_RANK,
    ERR_INVALID_RENTZ_CARD,
    A_RANK,
    ERR_INVALID_RENTZ_SKIP
} = require('./constants.js');

function shufflePlayers(players){
  for (let i = players.length - 1; i > 0; i--) {    // shuffle players
    const j = Math.floor(Math.random() * (i + 1));
    [players[i], players[j]] = [players[j], players[i]];
  }
}

function initializePlayers(players){
  let contractsAvailable = {};
  let scores = {};
  let hands = {};
  let tricksTaken = {};
  let cardsTaken = {};
  
  for (let player of players) { 
    contractsAvailable[player] = [...CONTRACTS];
    scores[player] = 0;
    hands[player] = [];
    tricksTaken[player] = 0;
    cardsTaken[player] = [];
  }

  return { contractsAvailable, scores, hands, tricksTaken, cardsTaken };
}

function createRentzTable(){
  return {
    [SPADES_SUIT]: null,
    [HEARTS_SUIT]: null,
    [DIAMONDS_SUIT]: null,
    [CLOVER_SUIT]: null
  };
}

function createGame(players) {
  if (players.length !== MIN_PLAYERS && players.length !== MAX_PLAYERS) {
    throw Error(ERR_INVALID_PLAYER_COUNT);
  }
  shufflePlayers(players);

  const { contractsAvailable, scores, hands, tricksTaken, cardsTaken } = initializePlayers(players);
  
  let currentPlayerIndex = 0;
  let currentTrick = [];
  let leadSuit = null;

  let rentzFinishOrder = [];
  let rentzTable = createRentzTable();

  let currentContract = {
    name: null,
    isBlind: false,
  };

  return {
    players,
    scores,
    currentPlayerIndex,
    contractsAvailable,
    currentContract,
    hands,
    leadSuit,
    currentTrick,
    tricksTaken,
    cardsTaken,
    rentzFinishOrder,
    rentzTable
  };
}

function resetForNewContract(game){
   for (let player of game.players) {
    game.tricksTaken[player] = 0;
    game.cardsTaken[player] = [];
  }
   game.rentzFinishOrder = [];
   game.rentzTable = createRentzTable();
}

function advancePlayer(game){
  if (game.currentPlayerIndex === game.players.length - 1) {
     game.currentPlayerIndex = 0;
  } else {
     game.currentPlayerIndex++;
  }
}

function dealToPlayers(game){
  const deck = createDeck(game.players.length, CARDS_PER_PLAYER);
  const dealtHands = dealCards(deck, game.players.length);
  for (let i = 0; i < game.players.length; i++) {
    game.hands[game.players[i]] = dealtHands[i];
  }
}

function chooseContract(game, playerIndex, contractName, isBlind) {
  if (game.currentPlayerIndex !== playerIndex) {
    throw new Error(ERR_INVALID_PLAYER_TURN);
  }
  let contractIndex = game.contractsAvailable[game.players[playerIndex]].indexOf(contractName);
  if (contractIndex === -1) {
    throw new Error(ERR_UNAVAILABLE_CONTRACT);
  }

  resetForNewContract(game);
  game.contractsAvailable[game.players[playerIndex]].splice(contractIndex, 1);
  advancePlayer(game);
  game.currentContract.name = contractName;
  game.currentContract.isBlind = isBlind;
  dealToPlayers(game);

  return game;
}

function isTheCardPlayedLegal(game, playerIndex, card){
  if (game.leadSuit !== card.suit && game.leadSuit !== null) {
    for (let i = 0; i < game.hands[game.players[playerIndex]].length; i++) {
      if (game.hands[game.players[playerIndex]][i].suit === game.leadSuit) {
          return false
      }
    }
  }
  return true;
}

function removeCardFromHandAfterBeingPlayed(game, playerIndex, card){
  let cardIndex = game.hands[game.players[playerIndex]].findIndex(
    (c) => c.suit === card.suit && c.rank === card.rank,
  );
  game.hands[game.players[playerIndex]].splice(cardIndex, 1);
}

function handleTrickCompletion(game){
  let winner = findTrickWinner(game.currentTrick, game.leadSuit);
  for (let trickCard of game.currentTrick) {
   game.cardsTaken[game.players[winner]].push(trickCard.card);
  }
  game.tricksTaken[game.players[winner]]++;
  game.currentPlayerIndex = winner;
  game.currentTrick = [];
  game.leadSuit = null;
  if (game.currentContract.name === RED_POPE_CONTRACT) {
    let hasRedPope = game.cardsTaken[game.players[winner]].some(
      (c) => c.suit === HEARTS_SUIT && c.rank === K_RANK,
    );
   if (hasRedPope) {
      game = scoreRedPope(game);
    }
  }
  let handsEmpty = game.players.every((p) => game.hands[p].length === 0);
  if (handsEmpty) {
    if (game.currentContract.name === DIAMONDS_CONTRACT) {
      game = scoreDiamonds(game);
    }
    if (game.currentContract.name === TOTALS_CONTRACT) {
      game = scoreTotals(game);
    }
  }
  return game;
}

function playCardTricks(game, playerIndex, card) {
  if(isTheCardPlayedLegal(game, playerIndex, card) === false){
    throw new Error(ERR_INVALID_CARD_PLAYED);
  }

  if (game.leadSuit === null) {
    game.leadSuit = card.suit;
  }
  game.currentTrick.push({ playerIndex, card });
  removeCardFromHandAfterBeingPlayed(game, playerIndex, card);
  if (game.currentTrick.length === game.players.length) {
    game = handleTrickCompletion(game);
  } else {
    advancePlayer(game);
  }
  return game;
}

function findTrickWinner(currentTrick, leadSuit) {
  let trickWinnerIndex = null;
  let winnerRank = null;
  for (let trick of currentTrick) {
    if (trick.card.suit === leadSuit) {
      const cardRankIndex = RANK_ORDER.indexOf(trick.card.rank);
      if (trickWinnerIndex === null || cardRankIndex > winnerRank) {
        trickWinnerIndex = trick.playerIndex;
        winnerRank = cardRankIndex;
      }
    }
  }
  return trickWinnerIndex;
}

function updateRentzTable(game, card){
    const gameNotBegun = Object.values(game.rentzTable).every(row => row === null);
    if(gameNotBegun && card.rank !== RENTZ_STARTING_RANK){
        throw new Error(ERR_INVALID_RENTZ_START_RANK);
    }
    if(game.rentzTable[card.suit] === null){
        game.rentzTable[card.suit] = { low: RENTZ_STARTING_RANK, high: RENTZ_STARTING_RANK };
    } else {
        const highIndex = RANK_ORDER.indexOf(game.rentzTable[card.suit].high);
        const lowIndex = RANK_ORDER.indexOf(game.rentzTable[card.suit].low);
        const cardIndex = RANK_ORDER.indexOf(card.rank);
        if(cardIndex === highIndex + 1){
            game.rentzTable[card.suit].high = card.rank;
        } else if(cardIndex === lowIndex - 1){
            game.rentzTable[card.suit].low = card.rank;
        } else {
            throw new Error(ERR_INVALID_RENTZ_CARD);
        }
    }
}

function checkRentzFinish(game, playerIndex){
    if(game.hands[game.players[playerIndex]].length === 0){
        game.rentzFinishOrder.push(playerIndex);
    }
    if(game.rentzFinishOrder.length === game.players.length){
        game = scoreRentz(game);
    }
    return game;
}

function advanceRentzTurn(game, card, lowestRank){
    if(card.rank === A_RANK){
        return;
    }
    if(card.rank === lowestRank){
        if(game.currentPlayerIndex === game.players.length - 1){
            game.currentPlayerIndex = 1;
        } else if(game.currentPlayerIndex === game.players.length - 2){
            game.currentPlayerIndex = 0;
        } else {
            game.currentPlayerIndex += 2;
        }
    } else {
        advancePlayer(game);
    }
}

function playCardRentz(game, playerIndex, card){
    const lowestRank = game.players.length === MIN_PLAYERS ? LOWEST_RANK_MIN_PLAYERS : LOWEST_RANK_MAX_PLAYERS;
    updateRentzTable(game, card);
    removeCardFromHandAfterBeingPlayed(game, playerIndex, card);
    game = checkRentzFinish(game, playerIndex);
    advanceRentzTurn(game, card, lowestRank);
    return game;
}

function skipTurnRentz(game, playerIndex){
  if(game.currentPlayerIndex !== playerIndex){
    throw new Error(ERR_INVALID_PLAYER_TURN);
  }
  for(let card of game.hands[game.players[playerIndex]]){
    if(canPlayCard(game,card) === true){
      throw new Error(ERR_INVALID_RENTZ_SKIP);
    }
  }
  if(game.currentPlayerIndex === game.players.length - 1){
    game.currentPlayerIndex = 0;
  }
  else{
    game.currentPlayerIndex++;
  }
  return game;
}

function canPlayCard(game, card){
    let gameNotBegun = Object.values(game.rentzTable).every(row => row === null);
    if(gameNotBegun){
        return card.rank === RENTZ_STARTING_RANK;
    }
    if(game.rentzTable[card.suit] === null){
        return card.rank === RENTZ_STARTING_RANK;
    }
    let highIndex = RANK_ORDER.indexOf(game.rentzTable[card.suit].high);
    let lowIndex = RANK_ORDER.indexOf(game.rentzTable[card.suit].low);
    let cardIndex = RANK_ORDER.indexOf(card.rank);
    return cardIndex === highIndex + 1 || cardIndex === lowIndex - 1;
}

module.exports = { createGame, chooseContract, playCardTricks, playCardRentz, skipTurnRentz, findTrickWinner, updateRentzTable,
  checkRentzFinish, advancePlayer, isTheCardPlayedLegal, removeCardFromHandAfterBeingPlayed
 };
 