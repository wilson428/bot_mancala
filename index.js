/*

BOT MANCALA

-----------------------------------------
|    | 04 | 04 | 04 | 04 | 04 | 04 |    |
| 00 | --------------------------- | 00 |
|    | 04 | 04 | 04 | 04 | 04 | 04 |    |
-----------------------------------------

*/

const Game = require("./Game")


const scenarios = {
	tests: require("./scenarios/tests.json")
}

let game = new Game({
	LOG_LEVEL: 0,
	playUntilEnd: true
});

function testScenario(scenario) {
	game.loadScenario(scenario);
	game.print();

	if (!scenario.moves) {
		return;
	}

	for (let c = 0; c < scenario.moves.length; c += 1) {
		game.move(scenario.moves[c])
		game.print();
	}
}

// testScenario(scenarios.tests.wrap);
// testScenario(scenarios.tests.capture2);
testScenario(scenarios.tests.endGame3);


// game.move("bin_A6");
// game.move("bin_B3");
// game.print();

// console.log(game.evaluateGame());


// console.log(game.getAvailableMoves("A"));
// console.log(game.getAvailableMoves("B"));

// let json = game.serialize();
// console.log(JSON.stringify(json, null, 2));