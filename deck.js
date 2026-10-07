const {MIN_PLAYERS, MAX_PLAYERS, CARDS_PER_PLAYER, RANKS_MIN_PLAYERS, RANKS_MAX_PLAYERS, SUITS
    , ERR_INVALID_CARDS_5P, ERR_INVALID_CARDS_6P, ERR_INVALID_PLAYER_COUNT, ERR_INVALID_DECK
} = require('./constants.js');

function shuffleDeck(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
}

function createDeck(numPlayers, cardsEach) {
    let deck= [];
    let ranks= [];
    if(numPlayers !== MIN_PLAYERS && numPlayers !== MAX_PLAYERS){
        throw new Error(ERR_INVALID_PLAYER_COUNT);
    }
    if(numPlayers === MIN_PLAYERS){
        if(cardsEach !== CARDS_PER_PLAYER)
            throw new Error(ERR_INVALID_CARDS_5P);
        ranks = RANKS_MIN_PLAYERS;
    }
    if(numPlayers === MAX_PLAYERS){
         if(cardsEach !== CARDS_PER_PLAYER){
             throw new Error(ERR_INVALID_CARDS_6P);
    }
    ranks = RANKS_MAX_PLAYERS;
    }
    for(let suit of SUITS){
        for(let rank of ranks){
            deck.push({suit, rank});
        }
    }
    shuffleDeck(deck);
    return {cards: deck, numPlayers};
}

function dealCards(deck, numPlayers){
    if(deck.numPlayers !== numPlayers){
        throw new Error(ERR_INVALID_DECK);
    }
    let hands= [];
    for(let i=0; i<numPlayers; i++){
        hands.push([]);
    }
    for (let i = 0; i < deck.cards.length; i++) {
        let playerIndex = i % numPlayers;
        hands[playerIndex].push(deck.cards[i]);
    }
    return hands;
}

module.exports = { createDeck, dealCards, shuffleDeck};