const colors = require('colors');

// return an array of clones of possible moves for the active player
const Simulation = function(game) {
	this.game = game;
	this.clones = [];

	console.log(colors.bold( "Starting new scenario: " ) + colors.red(game.settings.name) + ".");
	this.game.print();
}

// simulation a given move
Simulation.prototype.tryMove = function(bin_id, game) {
	let g = game || this.game;
	clone = g.clone(bin_id);		

	clone.move(bin_id);

	// if we didn't end in a basin, add to clones and return;
	if (clone.turn !== g.turn) {
		this.clones.push(clone);
		clone.announce("End of turn for game " + clone.settings.name.bold + "\n", 1);
		return;
	}

	this.tryEveryMove(clone);
}

// try every available move for the Simulation's game
Simulation.prototype.tryEveryMove = function(game) {
	let g = game || this.game;

	let possibleMoves = g.getAvailableMoves(this.game.turn);

	possibleMoves.forEach(possibleMove => {
		this.tryMove(possibleMove, g);
	});

	if (!game) {
		console.log(`Games after ${ this.game.turnCount + 1 } turn(s): ${ this.clones.length }`);
	}
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

module.exports = Simulation;