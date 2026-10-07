const { DIAMOND_PENALTY, DIAMONDS_SUIT, HEARTS_SUIT, K_RANK, Q_RANK, RED_POPE_PENALTY, QUEEN_PENALTY, TOTALS_TRICK_PENALTY, RENTZ_STARTING_GAIN, RENTZ_TAX } = require("./constants");

function scoreDiamonds(game){
    for(let player of game.players){
        let pointsLost = 0;
        for(let trickCard of game.cardsTaken[player]){
            if(trickCard.suit === DIAMONDS_SUIT){
                pointsLost = pointsLost - DIAMOND_PENALTY ;
            }
        }
        if(game.currentContract.isBlind === true){
            pointsLost = pointsLost * 2;
        }
        game.scores[player] += pointsLost;
    }
    return game;
}

function scoreRedPope(game){
    for(let player of game.players){
        let pointsLost = 0;
        for(let trickCard of game.cardsTaken[player]){
            if(trickCard.suit === HEARTS_SUIT && trickCard.rank === K_RANK){
                pointsLost = pointsLost - RED_POPE_PENALTY;
            }
        }
        if(game.currentContract.isBlind === true){
            pointsLost = pointsLost * 2;
        }
        game.scores[player] += pointsLost;
    }
    return game;
}

function scoreTotals(game){
    for(let player of game.players){
        let pointsLost = 0;
        for(let trickCard of game.cardsTaken[player]){
            if(trickCard.suit === HEARTS_SUIT && trickCard.rank === K_RANK){
                pointsLost = pointsLost - RED_POPE_PENALTY;
            }
            if(trickCard.rank === Q_RANK){
                pointsLost = pointsLost - QUEEN_PENALTY;
            }
            if(trickCard.suit === DIAMONDS_SUIT){
                pointsLost = pointsLost - DIAMOND_PENALTY;
            }
        }
        pointsLost = pointsLost - TOTALS_TRICK_PENALTY * game.tricksTaken[player];
        if(game.currentContract.isBlind === true){
            pointsLost = pointsLost * 2;
        }
        game.scores[player] += pointsLost;
    }
    return game;
}

function scoreRentz(game){
    let startPoints = RENTZ_STARTING_GAIN;
    let tax = RENTZ_TAX;

    if(game.currentContract.isBlind === true){
        startPoints = startPoints * 2;
        tax = RENTZ_TAX * 2;
    }

    for(let i = 0 ; i < game.rentzFinishOrder.length ; i++){
        game.scores[game.players[game.rentzFinishOrder[i]]] += startPoints;
        startPoints = startPoints - tax;
    }
    return game;
}

module.exports = { scoreRedPope, scoreDiamonds, scoreTotals, scoreRentz };
