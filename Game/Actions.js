const colors = require('colors');
const Board = require("./Core.js");

Board.prototype.evaluateGame = function() {
	let outcome = {
		winner: null,
		basin_A: this.bins.basin_A.stones,
		bins_A: Array.from(Array(7).keys()).slice(1).map(c => this.bins["bin_A" + c].stones).reduce((acc, c) => acc + c, 0),
		basin_B: this.bins.basin_B.stones,
		bins_B: Array.from(Array(7).keys()).slice(1).map(c => this.bins["bin_B" + c].stones).reduce((acc, c) => acc + c, 0)
	}

	if (!this.settings.playUntilEnd) {
		if (outcome.basin_A > 24) {
			outcome.winner = "A";
			return outcome;
		}

		if (outcome.basin_B > 24) {
			outcome.winner = "B";
			return outcome;
		}
		return outcome;
	}

	// see if either player is out of moves
	if (outcome.bins_A === 0 || outcome.bins_B === 0) {
		if (outcome.bins_A === 0) {
			this.announce("Player A is out of moves!", 0);

			// put all of B's remaining stones in her basin
			for (let c = 1; c <= 6; c += 1) {
				let bin_id = "bin_B" + c;
				this.bins.basin_B.stones += this.bins[bin_id].stones;
				this.bins[bin_id].stones = 0;
				outcome.basin_B = this.bins.basin_B.stones;
				outcome.bins_B = 0;
			}
		} else if (outcome.bins_B === 0) {
			this.announce("Player B is out of moves!", 0);

			// put all of A's remaining stones in her basin
			for (let c = 1; c <= 6; c += 1) {
				let bin_id = "bin_A" + c;
				this.bins.basin_A.stones += this.bins[bin_id].stones;
				this.bins[bin_id].stones = 0;
				outcome.basin_A = this.bins.basin_A.stones;
				outcome.bins_A = 0;
			}
		}

		// determine the winner
		
		if (outcome.basin_A > outcome.basin_B) {
			outcome.winner = "A";
			return outcome;
		}

		if (outcome.basin_B > outcome.basin_A) {
			outcome.winner = "B";
			return outcome;
		}

		if (outcome.basin_B === outcome.basin_A) {
			outcome.winner = "tie";
			return outcome;
		}
	}

	return outcome;
}

Board.prototype.move = function(bin_id) {
	if (bin_id.length == 2) {
		bin_id = "bin_" + bin_id;
	}

	if (!this.active) {
		this.announce(`You tried to move ${ bin_id }, but the game is over.`, 1);
		return;
	}

	let player_id = bin_id[4];

	if (player_id != this.turn) {
		this.announce(`You tried to move ${ bin_id } when it is Player ${ this.turn }'s turn`, 1);
		return;
	}

	let currentBin = this.bins[bin_id];
	let stoneCount = currentBin.stones;

	if (stoneCount === 0) {
		this.announce(`You tried to move ${ bin_id }, but it had no stones`, 1);
		return;
	}

	this.announce(`${ this.settings.name }: Player ${ this.turn } selected ${ bin_id }`, 0);

	this.moves.push(bin_id);

	currentBin.stones = 0;

	while (stoneCount > 0) {
		currentBin = currentBin.next[this.turn];
		currentBin.stones += 1;
		stoneCount -= 1;
	}

	// check for capture
	if (this.turn == currentBin.id[4] && currentBin.stones == 1 && currentBin.opposite.stones > 0) {
		this.bins["basin_" + this.turn].stones += currentBin.opposite.stones;
		currentBin.opposite.stones = 0;
		this.bins["basin_" + this.turn].stones += 1;
		currentBin.stones = 0;

		this.announce(`Player ${ this.turn } makes a capture, stealing ${ currentBin.opposite.stones } stones from ${ currentBin.opposite.id }`, 2);
	}

	if (currentBin.id !== "basin_" + this.turn) {
		this.turn = this.turn === "A" ? "B" : "A";
		this.turnCount += 1;
	}

	this.scoreboard = this.evaluateGame();

	// console.log(this.scoreboard);

	if (this.scoreboard.winner !== null) {
		this.active = false;
		if (this.scoreboard.winner === "tie") {
			this.announce(`It's a tie, ${ this.scoreboard.basin_A } to ${ this.scoreboard.basin_B }!`, 2);
			return;
		}
		this.announce(`Player ${ this.scoreboard.winner } wins, ${ this.scoreboard.basin_A } to ${ this.scoreboard.basin_B }!`, 2);
	} else {
		this.announce(`Finished in ${ currentBin.id }. It's Player ${ this.turn }'s turn.`, 0);
	}
}

Board.prototype.getAvailableMoves = function(player_id) {
	let availableBins = [];

	if (this.turn != player_id) {
		this.announce(`${ player_id } has no available moves since it is not her turn`)
		return availableBins;
	}

	for (let c = 1; c <= 6; c += 1) {
		let bin_id = "bin_" + player_id + c;
		if (this.bins[bin_id].stones > 0) {
			availableBins.push(bin_id);
		}
	}
	return availableBins;
}

module.exports = Board;