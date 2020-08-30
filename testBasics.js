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
	tests: require("./scenarios/basics.json")
}

let game = new Game({
	LOG_LEVEL: 0,
	playUntilEnd: true
});

function testScenario(scenario_id) {
	game.runScenario(scenarios.tests[scenario_id], scenario_id); 
}

// test cloning to make sure a move in the clone doesn't mutate the parent
function testCloning() {
	game.move("bin_A3");
	game.print();
	console.log(game.moves, game.turn, game.turnCount);

	let game1 = game.clone();

	game1.move("bin_B4");
	game1.print();
	console.log(game1.moves, game1.turn, game1.turnCount); // should include move from parent game

	let game2 = game1.clone();

	game2.move("bin_B3");
	game2.print();
	console.log(game2.moves, game2.turn, game2.turnCount); // should include move from parent game



	game.print(); // should be same as first print, unmodified by the move in the clone
	console.log(game.moves, game.turn, game.turnCount); // should only have the first move
}

// testScenario("basic"); // a simple move
// testScenario("wrap"); // test wrapping to the correct basins
// testScenario("capture"); // test a capture
// testScenario("not_a_capture"); // test a non-capture on opposite side
// testScenario("endGame1"); // A basic finale in which Player A finishes but doesn't have enough points
// testScenario("endGame2"); // A 25-point cutoff finale 
// testScenario("endGame3"); // A basic finale in which Player A finishes but doesn't have enough points

testCloning();