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

// test a given move
function simulateMove(g, bin_id, depth) {
	let clone = g.clone();
	clone.move(bin_id);
	clone.print();

	// if we ended in a basin, keep going
	if (clone.turn == g.turn) {
		return simulateTurn(clone, depth + 1);
	}

	return clone;
}

function simulateTurn(g, depth) {
	let clones = [];

	depth = depth || 0;

	let possibleMoves = g.getAvailableMoves(g.turn);

	console.log(`Possible moves for player ${ g.turn } in game ${ g.settings.name }: ${ possibleMoves.join(", ")}`)

	possibleMoves.forEach(possibleMove => {
		clones = clones.concat(simulateMove(g, possibleMove, depth));
	});

	if (depth == 0) {
		console.log(`Games after ${ clones[0].turnCount } turn(s): ${ clones.length }`);
	}
	return clones;
}

function lookAhead(games, moves) {
	if (!Array.isArray(games)) {
		games = [ games ];
	}

	if (typeof moves == "undefined") {
		moves = 1;
	}

	let nextTurn = [];

	games.forEach(game => {
		nextTurn = nextTurn.concat(simulateTurn(game))
	});

	moves -= 1;

	if (moves == 0) {
		return nextTurn;
	}

	lookAhead(nextTurn, moves);
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

let outcomes = lookAhead(game, 2);

console.log(outcomes.length);

// console.log(outcomes.map(d => { return [ d.settings.id, d.settings.name ] }));


// game.print();
// testScenario(scenarios.tests.endGame3);
