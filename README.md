# Rentz - Multiplayer Card Game

A real-time multiplayer web implementation of Rentz, a popular Romanian trick-taking card game. 
Built with Node.js, Express, and Socket.io.

## Project Status

- ✅ Game logic (deck, contracts, scoring, turn management)
- ✅ Server setup and room management
- 🔄 Frontend UI (in progress)
- 🔄 Real-time multiplayer connection (in progress)

## Game Rules

Rentz is played with 5 or 6 players using a shortened deck of cards.
Each player takes turns choosing a contract to play for that round.
There are 4 contracts, and each player must play each contract exactly once.
A contract can be chosen **blindly** (without looking at your cards) for double points.
The game ends when all players have played all 4 contracts.

### Contracts

**Rentz**
Players build sequences up and down from a starting 10.
The first player to empty their hand wins 300 points, 
descending by 50 for each subsequent player.

**Red Pope**
A trick-taking round where the player who takes 
the King of Hearts loses 150 points. 
The round ends immediately when the King of Hearts is taken.

**Diamonds**
A trick-taking round where every diamond card taken 
costs the player 20 points.

**Totals**
A combination contract — players lose points for every trick taken (-10), 
every diamond (-20), every queen (-40), and the King of Hearts (-150).
The Queen of Diamonds costs -60 since both the diamond and queen rules apply.

## Tech Stack
- **Backend:** Node.js, Express, Socket.io
- **Frontend:** HTML, CSS, Vanilla JavaScript (in progress)

## How to Run
1. Clone the repo
2. Run `npm install`
3. Run `node server.js`
4. Open `http://localhost:3000` in your browser

## Player Configurations
| Players | Cards Each | Ranks Used |
|---------|-----------|------------|
| 5       | 8         | 5 to Ace   |
| 6       | 8         | 3 to Ace   |
