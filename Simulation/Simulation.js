const colors = require('colors');

// return an array of clones of possible moves for the active player
// each array is a complete turn, even if the turn involved multiple moves
const Simulation = function(game) {
	this.game = game;
	this.game.timesCloned = 0;
	this.clones = [];

	game.announce(colors.bold( "Starting new scenario: " ) + colors.red(game.settings.name), 2);
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
		g.announce(`Moves in turn ${ this.game.turnCount + 1 } of ${ this.game.settings.name }: ${ this.clones.length }`, 2);
	}

	return this.clones;
}

// simulation through `depth` turns.
Simulation.prototype.lookAhead = function(depth, games) {
	if (typeof depth == "undefined") {
		depth = 1;
	}

	if (!games) {
		return this.lookAhead(depth, [ this.game ]);
	}

	// simulate every move for every game
	let nextTurn = [];

	games.forEach(game => {
		// check if game is resolved and keep it as is
		if (!game.active) {
			nextTurn.push(game);
			return;
		}
		let s = new Simulation(game);
		nextTurn = nextTurn.concat(s.tryEveryMove());
	});

	this.game.announce(`Games after ${ nextTurn[0].turnCount } turn(s): ${ nextTurn.length }`, 3);

	depth -= 1;

	if (depth > 0) {
		return this.lookAhead(depth, nextTurn);
	} else {
		this.game.announce(`Simulated ${ nextTurn.length } game(s) for "${ this.game.settings.name }" through turn ${ nextTurn[0].turnCount }.`, 4);
	}

}

module.exports = Simulation;