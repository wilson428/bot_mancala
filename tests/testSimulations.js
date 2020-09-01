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
		LOG_LEVEL: 0,
		playUntilEnd: true
	});

	game.loadScenario(scenarios.boards[scenario_id])

	let s = new Simulation(game);

	s.tryEveryMove();
}

// testSimulation("default");
testSimulation("multistep");