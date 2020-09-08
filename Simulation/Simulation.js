const colors = require('colors');

// return an array of clones of possible moves for the active player
// each array is a complete turn, even if the turn involved multiple moves
const Simulation = function(game) {
	this.game = game;
	this.game.timesCloned = 0;
	this.clones = [];

	game.announce(colors.bold( "Starting new scenario: " ) + colors.red(game.settings.name) + ".", 2);
	this.game.print({ log_level: 2 });
}

// simulation a given move
// if the move ends in a basin, try every subsequent move
Simulation.prototype.tryMove = function(bin_id, game) {
	let g = game || this.game;
	clone = g.clone(bin_id);		

	clone.move(bin_id);

	// if we didn't end in a basin, add to clones and return;
	if (clone.turn !== g.turn) {
		this.clones.push(clone);
		if (clone.scoreboard.winner === null) {
			clone.announce("End of turn for game " + clone.settings.name.bold + "\n", 1);
		}
		return;
	}

	this.tryEveryMove(clone);
}

// try every available move for the Simulation's game
// this returns only the conculsion of a turn, including a loss, victory or tie
Simulation.prototype.tryEveryMove = function(game) {
	let g = game || this.game;

	let possibleMoves = g.getAvailableMoves(this.game.turn);

	possibleMoves.forEach(possibleMove => {
		this.tryMove(possibleMove, g);
	});

	if (!game) {
		g.announce(`Games after ${ this.game.turnCount + 1 } turn(s): ${ this.clones.length }`, 1);
	}

	return this.clones;
}


// internal function for simulating one turn for each of an array of games
Simulation.prototype.lookAheadOneTurn = function(games) {

	let nextTurn = [];

	games.forEach(game => {
		let s = new Simulation(game);
		nextTurn = nextTurn.concat(s.tryEveryMove());
	});

	nextTurn.forEach(g => {
		if (g.scoreboard.winner !== null) {
			this.resolutions.push(g);
		} else {
			this.outcomes.push(g);
		}
	});



}

// simulation through `depth` turns.
Simulation.prototype.lookAhead = function(depth, games) {
	this.outcomes = {};

	if (typeof depth == "undefined") {
		depth = 1;
	}

	if (!games) {
		this.lookAheadOneTurn(depth, [ this.game ]);
		depth -= 1;
	}

	while (depth > 0) {
		this.lookAheadOneTurn(depth, [ this.game ]);
		depth -= 1;
		this.game.announce(`Games after ${ results[0].turnCount } turn(s): ${ results.length }`, 3);
	}

	this.game.announce(`Simulated ${ this.outcomes.length + this.resolutions.length } game(s) for "${ this.game.settings.name }" through turn ${ results[0].turnCount }.`, 3);
	console.log("ALL DONE");
}

module.exports = Simulation;