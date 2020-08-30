/*

BOT MANCALA

-----------------------------------------
|    | 04 | 04 | 04 | 04 | 04 | 04 |    |
| 00 | --------------------------- | 00 |
|    | 04 | 04 | 04 | 04 | 04 | 04 |    |
-----------------------------------------

*/


const Game = require("./Game")
const Simulation = require("./BotMancala")

const scenarios = {
	tests: require("./scenarios/tests.json")
}

let game = new Game({
	LOG_LEVEL: 0,
	playUntilEnd: true
});

console.dir(game);

let simulation = new Simulation(game);

simulation.tryEveryMove();

console.log(simulation);

function testScenario(scenario) {
	game.loadScenario(scenario);
	game.moves = [];
	game.print();

	if (!scenario.moves) {
		return;
	}

	for (let c = 0; c < scenario.moves.length; c += 1) {
		game.move(scenario.moves[c])
		game.print();
	}
}

// let clone = Simulation.simulateTurn()
// console.log(clones.clones);

// game.print();
// testScenario(scenarios.tests.endGame3);
