/*

BOT MANCALA

-----------------------------------------
|    | 04 | 04 | 04 | 04 | 04 | 04 |    |
| 00 | --------------------------- | 00 |
|    | 04 | 04 | 04 | 04 | 04 | 04 |    |
-----------------------------------------

*/

const colors = require('colors');
const shortid = require('shortid');

const Bin = function(player, number, stoneCount) {	
	if (stoneCount === 0) {
		this.id = "basin_" + player;
	} else {
		this.id = "bin_" + player + number;
	}

	this.stones = stoneCount;
	this.opposite = null;	// the opposing bin, for possible captures
	this.next = {			// the bin to move to next, which is dependent on whose turn it is
		A: null,
		B: null
	}
}

Bin.prototype.stringify = function() {
	if (this.stones < 10) {
		return " " + this.stones;
	}
	return String(this.stones);
}

const Board = function(options) {
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
	this.moves = [];
	this.active = true;
	this.scoreboard = null;
	this.timesCloned = 0; // useful for unique names of clones

	// set up the bins
	this.bins = {
		basin_A: new Bin("A", null, 0),
		basin_B: new Bin("B", null, 0)
	};

	for (let c = 6; c >= 1; c -= 1) {
		let bin = new Bin("A", c, 4);
		this.bins[bin.id] = bin;
	}

	for (let c = 6; c >= 1; c -= 1) {
		let bin = new Bin("B", c, 4);
		this.bins[bin.id] = bin;
	}

	this.bins.basin_A.next.A = this.bins.bin_B6;
	this.bins.basin_B.next.B = this.bins.bin_A6;

	for (let c = 6; c >= 1; c -= 1) {
		let binA = this.bins["bin_A" + c];
		binA.opposite = this.bins["bin_B" + (7 - c)];

		let binB = this.bins["bin_B" + c];
		binB.opposite = this.bins["bin_A" + (7 - c)];

		if (c > 1) {
			binA.next.A = this.bins["bin_A" + (c - 1)];
			binA.next.B = this.bins["bin_A" + (c - 1)];
		
			binB.next.A = this.bins["bin_B" + (c - 1)];
			binB.next.B = this.bins["bin_B" + (c - 1)];
		} else {
			binA.next.A = this.bins["basin_A"];
			binA.next.B = this.bins["bin_B6"];
		
			binB.next.B = this.bins["basin_B"];
			binB.next.A = this.bins["bin_A6"];
		}
	}
}

// control console outlet
Board.prototype.announce = function(msg, log_level) {
	if (log_level < this.settings.LOG_LEVEL) {
		return;
	}

	if (log_level == 0) {
		console.log(msg.gray);
	} else if (log_level == 1) {
		console.log(msg.magenta);
	} else {
		console.log(msg.bold);
	}
}

Board.prototype.print = function() {

	let l = this.settings.name.length;
	let right = Math.max(0, Math.floor((41 - l) / 2));
	let left = Math.max(0, Math.ceil((41 - l) / 2));

	console.log(`${ '-'.repeat(right)}${ this.settings.name }${ '_'.repeat(left) }`);
	console.log(`-----------------------------------------`.gray);
	console.log(
		`|    `.gray +
		`| ${ this.bins.bin_B1.stringify().red } `.gray +
		`| ${ this.bins.bin_B2.stringify().red } `.gray + 
		`| ${ this.bins.bin_B3.stringify().red } `.gray + 
		`| ${ this.bins.bin_B4.stringify().red } `.gray + 
		`| ${ this.bins.bin_B5.stringify().red } `.gray + 
		`| ${ this.bins.bin_B6.stringify().red } `.gray + 
		`|    |`.gray
	);
	console.log(`| ${ this.bins.basin_B.stringify().bold.red } | --------------------------- | ${ this.bins.basin_A.stringify().bold.green } |`);
	console.log(
		`|    `.gray +
		`| ${ this.bins.bin_A6.stringify().green } `.gray +
		`| ${ this.bins.bin_A5.stringify().green } `.gray + 
		`| ${ this.bins.bin_A4.stringify().green } `.gray + 
		`| ${ this.bins.bin_A3.stringify().green } `.gray + 
		`| ${ this.bins.bin_A2.stringify().green } `.gray + 
		`| ${ this.bins.bin_A1.stringify().green } `.gray + 
		`|    |`.gray
	);
	console.log(`-----------------------------------------`.gray);
}

Board.prototype.serialize = function() {
	let json = {
		A: {
			basin: this.bins.basin_A.stones,
			bins: []
		},
		B: {
			basin: this.bins.basin_B.stones,
			bins: []
		},
		moves: this.moves
	}

	for (let c = 6; c >= 1; c -= 1) {
		json.A.bins.push(this.bins["bin_A" + c].stones);
		json.B.bins.push(this.bins["bin_B" + c].stones);
	}

	return json;
}

Board.prototype.loadScenario = function(scenario) {
	this.bins.basin_A.stones = scenario.A.basin;
	this.bins.basin_B.stones = scenario.B.basin;

	for (let c = 0; c < 6; c += 1) {
		this.bins["bin_A" + (6 - c)].stones = scenario.A.bins[c];
		this.bins["bin_B" + (6 - c)].stones = scenario.B.bins[c];
	}

	this.moves = scenario.moves;
}

// this is sloppy, but we need granular control over what gets cloned
Board.prototype.clone = function() {
	this.timesCloned += 1;

	let cloneSettings = Object.assign({}, this.settings);

	cloneSettings.name += " c" + this.timesCloned;

	let clone = new Board(cloneSettings);

	clone.loadScenario(this.serialize());
	clone.turn = this.turn;
	clone.moves = this.moves.slice(0);

	return clone;
}

module.exports = Board;

// console.log(game.bins);