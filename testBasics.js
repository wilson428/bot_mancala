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

	if (scenario.comment) {
		console.log(scenario.comment);
	}

	for (let c = 0; c < scenario.moves.length; c += 1) {
		game.move(scenario.moves[c])
		game.print();
	}
}

// a few 
testScenario(scenarios.tests.wrap); // test wrapping to correct basin's
testScenario(scenarios.tests.capture2); // test captures
testScenario(scenarios.tests.endGame3); // simulated tie


// test cloning to make sure a move in the clone doesn't mutate the parent
game.move("bin_A3");
game.print();

let game1 = game.clone();

game1.move("bin_B4");
game1.print();

game.print();