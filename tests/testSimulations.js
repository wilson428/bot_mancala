/*

BOT MANCALA

-----------------------------------------
|    | 04 | 04 | 04 | 04 | 04 | 04 |    |
| 00 | --------------------------- | 00 |
|    | 04 | 04 | 04 | 04 | 04 | 04 |    |
-----------------------------------------

*/


const path = require("path");
const Game = require(path.resolve(__dirname, "../Game"))
const Simulation = require(path.resolve(__dirname, "../Simulation"))

const scenarios = {
	boards: require(path.resolve(__dirname, "scenarios/boards.json"))
}

function testSimulation(scenario_id) {
	let game = new Game({
		LOG_LEVEL: 1,
		playUntilEnd: true
	});

	if (scenarios.boards[scenario_id].hasOwnProperty("moves")) {
		game.runScenario(scenarios.boards[scenario_id]);
	} else {
		game.loadScenario(scenarios.boards[scenario_id]);
	}


	let s = new Simulation(game);

	let moves = s.tryEveryMove();
	console.log(moves);

	// s.lookAhead(2);
}

testSimulation("default");
// testSimulation("multistep");
// testSimulation("simple_lookahead");
// testSimulation("opening_gambit_4_1")