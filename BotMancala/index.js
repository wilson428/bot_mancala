// return an array of clones of possible moves for the active player
const Simulation = function(game) {
	this.game = game;
	this.nextMoves = [];
}

// try every available move for the Simulation's game
Simulation.prototype.simulateTurn() {
	depth = depth || 0;

	let possibleMoves = this.game.getAvailableMoves(game.turn);

	game.announce(`Possible moves for player ${ g.turn } in game ${ g.settings.name }: ${ possibleMoves.join(", ")}`, 1);

	possibleMoves.forEach(possibleMove => {
		clones = clones.concat(simulateMove(g, possibleMove, depth));
	});

	if (depth == 0) {
		console.log(`Games after ${ clones[0].turnCount } turn(s): ${ clones.length }`);
	}
	return clones;
}



// simulation a given move
Simulation.prototype.move = function(g, bin_id, depth) {
	let clone = g.clone();
	clone.move(bin_id);

	// if we ended in a basin, keep going
	if (clone.turn == g.turn) {
		let nextPossibleMoves = clone.getAvailableMoves(clone.turn);
		nextPossibleMoves.forEach(bin_id => {
			
		})
		return this.move(clone, depth + 1);
	}

	this.nextMoves.push([bin_id, clone]);
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

export { }