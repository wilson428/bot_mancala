// return an array of clones of possible moves for the active player
const Simulation = function(game) {
	this.game = game;
	this.clones = [];
}

// try every available move for the Simulation's game
Simulation.prototype.tryEveryMove = function() {
	let possibleMoves = this.game.getAvailableMoves(game.turn);

	game.announce(`Possible moves for player ${ g.turn } in game ${ g.settings.name }: ${ possibleMoves.join(", ")}`, 1);

	possibleMoves.forEach(possibleMove => {
		this.game.tryMove(possibleMove);
	});

	console.log(`Games after ${ this.game.turnCount } turn(s): ${ this.clones.length }`);
}

// simulation a given move
Simulation.prototype.tryMove = function(bin_id) {
	let clone = g.clone();
	clone.move(bin_id);

	// if we didn't end in a basin, add to clones and return;
	if (clone.turn !== g.turn) {
		this.clones.push(clone);
		return;
	}

	// // else if we ended in a basin, keep going
	// let nextPossibleMoves = clone.getAvailableMoves(clone.turn);
	// 	nextPossibleMoves.forEach(bin_id => {
			
	// 	})
	// 	return this.move(clone, depth + 1);
	// }

	// this.nextMoves.push([bin_id, clone]);
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