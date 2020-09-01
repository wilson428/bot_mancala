const Board = require("./Board.js");
const shortid = require('shortid');
const colors = require('colors');

const Game = function(options) {
	let default_settings = {
		id: null,
		name: null,
		LOG_LEVEL: 0, // 0: debug, 1: warn, 2: important
		playUntilEnd: true,
		firstTurn: "A",
	}

	options = options || {};
	this.settings = Object.assign(default_settings, options);

	// non-settable settings
	let uid = shortid.generate();

	this.settings.id = uid;
	if (!this.settings.name) {
		this.settings.name = "Game " + uid;
	}

	this.settings.time_start = (new Date()).getTime();
	this.settings.time_end = null;

	this.turn = this.settings.firstTurn;

	this.turnCount = 0;
	this.moves = [];
	this.active = true;
	this.scoreboard = null;
	this.timesCloned = 0; // useful for unique names of clones


	this.board = new Board();
}

// control console outlet
Game.prototype.announce = function(msg, log_level, dontIndent) {
	if (log_level < this.settings.LOG_LEVEL) {
		return;
	}

	if (/1 .*\(s\)/.test(msg)) {
		msg = msg.replace("(s)", "");
	} else {
		msg = msg.replace("(s)", "s");
	}

	if (log_level === 0) {
		msg = this.settings.name.bold + ": " + msg;
	}

	if (!dontIndent) {
		msg = " ".repeat(this.timesCloned * 4) + msg;
	}

	if (log_level == 0) {
		console.log(msg.gray);
	} else if (log_level == 1) {
		console.log(msg.magenta);
	} else {
		console.log(msg.bold);
	}
}

Game.prototype.print = function(shouldIndent, printTitle) {
	this.board.print(printTitle || this.settings.name, shouldIndent ? 0 : this.timesCloned);
}

Game.prototype.getAvailableMoves = function() {
	let availableMoves = this.board.getAvailableMoves(this.turn);
	if (availableMoves.length === 0) {
		this.announce(`${ this.settings.name.bold }: Player ${ this.turn } has no moves left!`, 1);
		return availableMoves;
	}
	this.announce(`${ this.settings.name.bold }: Player ${ this.turn } can move in bins ${ availableMoves.join(", ").bold }`, 1);

	return availableMoves;
}

Game.prototype.move = function(bin_id) {
	if (bin_id.length == 2) {
		bin_id = "bin_" + bin_id;
	}

	let player_id = bin_id[4];

	// check for various illegal plays
	if (!this.active) {
		this.announce(`Player ${ player_id } tried to move ${ bin_id }, but the game is over.`, 1);
		return false;
	}

	if (player_id != this.turn) {
		this.announce(`Player ${ player_id } tried to move ${ bin_id } when it is Player ${ this.turn }'s turn`, 1);
		return false;
	}

	let currentBin = this.board.bins[bin_id];
	let stoneCount = currentBin.stones;

	if (stoneCount === 0) {
		this.announce(`Player ${ player_id } tried to move ${ bin_id }, but it had no stones`, 1);
		return false;
	}

	this.announce(`Player ${ this.turn } selected ${ bin_id.bold } (${ String(this.board.bins[bin_id].stones).bold } stone(s))`, 0);

	this.moves.push(bin_id);
	let result = this.board.move(bin_id);

	this.scoreboard = this.evaluateGame();

	if (this.scoreboard.winner !== null) {
		this.active = false;
		this.turnCount += 1;

		if (this.scoreboard.winner === "tie") {
			this.announce(`It's a tie after ${ this.turnCount } turns, ${ this.scoreboard.basin_A } to ${ this.scoreboard.basin_B }!`, 2);
			this.print();
			return false;
		}
		this.print();
		this.announce(`Player ${ this.scoreboard.winner } wins in ${ this.turnCount } turns, ${ this.scoreboard.basin_A } to ${ this.scoreboard.basin_B }!`, 2);
 		return false;
 	}

	if (result.player_flip) {
		if (result.stones_captured > 0) {
			this.print();
			this.announce(`Player ${ this.turn } captured ${ result.stones_captured } stones by landing in ${ result.bin_end_id }. It is Player ${ this.turn === "A" ? "B" : "A" }'s turn.`, 0);
		} else {
			this.print();
			this.announce(`Player ${ this.turn } finished in ${ result.bin_end_id }, storing ${ result.stones_scored } stone${ result.stones_scored === 1 ? "" : "s" }. It is Player ${ this.turn === "A" ? "B" : "A" }'s turn.`, 0);
		}

		this.turn = this.turn === "A" ? "B" : "A";
		this.turnCount += 1;
		return true;
	} else {
		this.print();
		this.announce(`Player ${ this.turn } finished in her basin, storing ${ result.stones_scored } stone(s)" }. It is still her turn.`, 0);
		return true;
	}
}

Game.prototype.evaluateGame = function() {
	let that = this;

	let outcome = {
		winner: null,
		basin_A: this.board.bins.basin_A.stones,
		bins_A: Array.from(Array(7).keys()).slice(1).map(c => this.board.bins["bin_A" + c].stones).reduce((acc, c) => acc + c, 0),
		basin_B: this.board.bins.basin_B.stones,
		bins_B: Array.from(Array(7).keys()).slice(1).map(c => this.board.bins["bin_B" + c].stones).reduce((acc, c) => acc + c, 0)
	}

	function storeRemainingStones(player_id) {
		for (let c = 1; c <= 6; c += 1) {
			let bin_id = "bin_" + player_id + c;
			that.board.bins["basin_" + player_id].stones += that.board.bins[bin_id].stones;
			that.board.bins[bin_id].stones = 0;
			outcome["basin_" + player_id] = that.board.bins["basin_" + player_id].stones;
			outcome["bins_" + player_id] = 0;
		}		
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
			storeRemainingStones("B");
		} else if (outcome.bins_B === 0) {
			this.announce("Player B is out of moves!", 0);

			// put all of A's remaining stones in her basin
			storeRemainingStones("A");
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

Game.prototype.loadScenario = function(scenario) {
	this.board.loadScenario(scenario);

	if (scenario.hasOwnProperty("settings")) {
		this.settings = Object.assign(this.settings, scenario.settings);
	}

	if (scenario.hasOwnProperty("previousMoves")) {
		this.moves = scenario.previousMoves;
	}
}

Game.prototype.runScenario = function(scenario, scenarioName) {
	this.loadScenario(scenario);

	if (scenario.hasOwnProperty("settings")) {
		this.settings = Object.assign(this.settings, scenario.settings);
	}

	if (scenario.hasOwnProperty("previousMoves")) {
		this.moves = scenario.previousMoves;
	}

	this.announce(`Scenario "${ scenarioName }", with move to player ${ this.turn }:`, 2);

	if (scenario.comment) {
		this.announce(scenario.comment, 1);
	}

	this.print();

	if (!scenario.moves) {
		return;
	}

	for (let c = 0; c < scenario.moves.length; c += 1) {
		let m = this.move(scenario.moves[c]);
		if (m) {
			this.print();
		}
	}

}

// this is sloppy, but we need granular control over what gets cloned
Game.prototype.clone = function(bin_id) {
	let cloneSettings = Object.assign({}, this.settings);

	// cloneSettings.name += "." + this.timesCloned;
	cloneSettings.name = this.name;

	let clone = new Game(cloneSettings);

	clone.board.loadScenario(this.board.serialize());
	clone.turn = this.turn;
	clone.moves = this.moves.slice(0);
	clone.turnCount = this.turnCount;
	clone.timesCloned = this.timesCloned + 1;

	if (bin_id) {
		clone.settings.name = this.settings.name + "." + bin_id.replace("bin_", "");
	} else {
		clone.settings.name = this.settings.name + "." + this.turnCount;
	}

	clone.announce(`Cloning game ${ this.settings.name } as ${ clone.settings.name } (id: ${ clone.settings.id })`, 0)
	// clone.print();

	return clone;
}

module.exports = Game;