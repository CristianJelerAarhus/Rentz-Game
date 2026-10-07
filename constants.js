const MIN_PLAYERS = 5;
const MAX_PLAYERS = 6;
const CARDS_PER_PLAYER = 8;

const RANK_ORDER = ["2","3","4","5","6","7","8","9","10","J","Q","K","A",];
const RANKS_MIN_PLAYERS = ['5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const RANKS_MAX_PLAYERS = ['3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const LOWEST_RANK_MIN_PLAYERS = "5";
const LOWEST_RANK_MAX_PLAYERS = "3";
const HIGHEST_RANK = "A";
const TWO_RANK = "2";
const THREE_RANK = "3";
const FOUR_RANK = "4";
const FIVE_RANK = "5";
const SIX_RANK = "6";
const SEVEN_RANK = "7";
const EIGHT_RANK = "8";
const NINE_RANK = "9";
const TEN_RANK = "10";
const J_RANK = "J";
const Q_RANK = "Q";
const K_RANK = "K";
const A_RANK = "A";

const HEARTS_SUIT = "Hearts";
const DIAMONDS_SUIT = "Diamonds";
const SPADES_SUIT = "Spades";
const CLOVER_SUIT = "Clovers"
const SUITS = [HEARTS_SUIT, DIAMONDS_SUIT, SPADES_SUIT, CLOVER_SUIT];

const RED_POPE_CONTRACT = "Red Pope";
const DIAMONDS_CONTRACT = "Diamonds";
const TOTALS_CONTRACT = "Totals";
const RENTZ_CONTRACT = "Rentz"
const CONTRACTS = [RED_POPE_CONTRACT, DIAMONDS_CONTRACT, TOTALS_CONTRACT, RENTZ_CONTRACT];

const RED_POPE_PENALTY = 150;
const DIAMOND_PENALTY = 20;
const TOTALS_TRICK_PENALTY = 10;
const QUEEN_PENALTY = 40
const RENTZ_STARTING_GAIN = 300;
const RENTZ_TAX = 50;
const RENTZ_STARTING_RANK = "10";

const ERR_INVALID_PLAYER_COUNT = "The game of Rentz can only start with either 5 or 6 players";
const ERR_INVALID_CARDS_5P = "In the 5-player setting each player has to get exactly 8 cards";
const ERR_INVALID_CARDS_6P = "In the 6-player setting each player has to get exactly 8 cards";
const ERR_INVALID_DECK = "This deck was not created for this number of players";
const ERR_INVALID_PLAYER_TURN = "It is not this player's turn to choose a contract";
const ERR_UNAVAILABLE_CONTRACT = "This contract is not available for this player";
const ERR_INVALID_CARD_PLAYED = "The player could've picked a card that matched the suit";
const ERR_INVALID_RENTZ_START_RANK = "Rentz has to start with a 10";
const ERR_INVALID_RENTZ_CARD = "This card cannot be played here";
const ERR_INVALID_RENTZ_SKIP = "This player can play a card"

module.exports = {
    MIN_PLAYERS,
    MAX_PLAYERS,
    RANK_ORDER,
    RANKS_MIN_PLAYERS,
    RANKS_MAX_PLAYERS,
    LOWEST_RANK_MIN_PLAYERS,
    LOWEST_RANK_MAX_PLAYERS,
    HIGHEST_RANK,
    TWO_RANK,
    THREE_RANK,
    FOUR_RANK,
    FIVE_RANK, 
    SIX_RANK,
    SEVEN_RANK,
    EIGHT_RANK,
    NINE_RANK,
    TEN_RANK,
    J_RANK,
    Q_RANK,
    K_RANK,
    A_RANK,
    HEARTS_SUIT,
    DIAMONDS_SUIT,
    SPADES_SUIT,
    CLOVER_SUIT,
    SUITS,
    RED_POPE_CONTRACT,
    DIAMONDS_CONTRACT,
    TOTALS_CONTRACT,
    RENTZ_CONTRACT,
    CONTRACTS,
    RED_POPE_PENALTY,
    DIAMOND_PENALTY,
    TOTALS_TRICK_PENALTY,
    QUEEN_PENALTY,
    CARDS_PER_PLAYER,
    RENTZ_STARTING_GAIN,
    RENTZ_TAX,
    RENTZ_STARTING_RANK,
    ERR_INVALID_PLAYER_COUNT,
    ERR_INVALID_CARDS_5P,
    ERR_INVALID_CARDS_6P,
    ERR_INVALID_DECK,
    ERR_INVALID_PLAYER_TURN,
    ERR_UNAVAILABLE_CONTRACT,
    ERR_INVALID_CARD_PLAYED,
    ERR_INVALID_RENTZ_START_RANK,
    ERR_INVALID_RENTZ_CARD,
    ERR_INVALID_RENTZ_SKIP
};
