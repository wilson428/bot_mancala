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

// test a give move
function simulateMove(g, bin_id) {
	let clone = g.clone();
	clone.move(bin_id);
	clone.print();

	if (clone.turn == "A") {
		return simulateTurn(clone, "A");
	}

	return clone;
}

function simulateTurn(g, player_id) {
	let clones = [];

	let possibleMoves = g.getAvailableMoves(player_id);

	console.log("Possible Moves for game", g.settings.id + ": " + possibleMoves)

	possibleMoves.forEach(possibleMove => {
		clones = clones.concat(simulateMove(g, possibleMove));
	});

	console.log(clones.map(d => { return [ d.settings.id, d.settings.name, d.moves ] }));

	return clones;
}

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

let clones = simulateMove(game, "A4")

console.log(clones.length);

// game.print();
// testScenario(scenarios.tests.endGame3);
