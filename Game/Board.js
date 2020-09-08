/*

BOT MANCALA

-----------------------------------------
|    | 04 | 04 | 04 | 04 | 04 | 04 |    |
| 00 | --------------------------- | 00 |
|    | 04 | 04 | 04 | 04 | 04 | 04 |    |
-----------------------------------------

*/

const INDENT_SPACING = 2;

const Bin = function(player, number, stoneCount) {	
	if (stoneCount === 0) {
		this.id = "basin_" + player;
	} else {
		this.id = player + number;
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

const Board = function() {
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

	this.bins.basin_A.next.A = this.bins.B6;
	this.bins.basin_B.next.B = this.bins.A6;

	for (let c = 6; c >= 1; c -= 1) {
		let binA = this.bins["A" + c];
		binA.opposite = this.bins["B" + (7 - c)];

		let binB = this.bins["B" + c];
		binB.opposite = this.bins["A" + (7 - c)];

		if (c > 1) {
			binA.next.A = this.bins["A" + (c - 1)];
			binA.next.B = this.bins["A" + (c - 1)];
		
			binB.next.A = this.bins["B" + (c - 1)];
			binB.next.B = this.bins["B" + (c - 1)];
		} else {
			binA.next.A = this.bins["basin_A"];
			binA.next.B = this.bins["B6"];
		
			binB.next.B = this.bins["basin_B"];
			binB.next.A = this.bins["A6"];
		}
	}
}

Board.prototype.print = function(name, indent) {
	name = name || "Current Game";
	indent = indent || 0;
	indent = " ".repeat(indent * INDENT_SPACING);


	let l = name.length;
	let right = Math.max(0, Math.floor((41 - l) / 2));
	let left = Math.max(0, Math.ceil((41 - l) / 2));

	console.log(indent + `${ '-'.repeat(right)}${ name }${ '-'.repeat(left) }`);
	console.log(indent + `-----------------------------------------`.gray);
	console.log(indent + 
		`|    `.gray +
		`| ${ this.bins.B1.stringify().red } `.gray +
		`| ${ this.bins.B2.stringify().red } `.gray + 
		`| ${ this.bins.B3.stringify().red } `.gray + 
		`| ${ this.bins.B4.stringify().red } `.gray + 
		`| ${ this.bins.B5.stringify().red } `.gray + 
		`| ${ this.bins.B6.stringify().red } `.gray + 
		`|    |`.gray
	);
	console.log(indent + `| ${ this.bins.basin_B.stringify().bold.red } | --------------------------- | ${ this.bins.basin_A.stringify().bold.green } |`);
	console.log(indent + 
		`|    `.gray +
		`| ${ this.bins.A6.stringify().green } `.gray +
		`| ${ this.bins.A5.stringify().green } `.gray + 
		`| ${ this.bins.A4.stringify().green } `.gray + 
		`| ${ this.bins.A3.stringify().green } `.gray + 
		`| ${ this.bins.A2.stringify().green } `.gray + 
		`| ${ this.bins.A1.stringify().green } `.gray + 
		`|    |`.gray
	);
	console.log(indent + `-----------------------------------------`.gray);
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
		}
	}

	for (let c = 6; c >= 1; c -= 1) {
		json.A.bins.push(this.bins["A" + c].stones);
		json.B.bins.push(this.bins["B" + c].stones);
	}

	return json;
}

// returns the info on the bin the last stone landed, whether the turn flips, and stones captured
Board.prototype.move = function(bin_id) {
	let player_id = bin_id[0]; // we need to know the player so as to know which basin to skip
	let currentBin = this.bins[bin_id];
	let stoneCount = currentBin.stones;

	let response = {
		player_id: player_id,
		bin_id_start: bin_id,
		bin_id_end: null,
		player_flip: true,
		stones_scored: 0,
		stones_captured: 0
	};

	currentBin.stones = 0;

	// loop around the linked list of bins, with currentBin ending as the final bin
	while (stoneCount > 0) {
		currentBin = currentBin.next[player_id];
		currentBin.stones += 1;
		stoneCount -= 1;

		if (/basin/.test(currentBin.id)) {
			response.stones_scored += 1;
		}
	}

	response.bin_id_end = currentBin.id;

	// check if we ended in a basin
	if (/basin/.test(currentBin.id)) {
		response.player_flip = false;
		return response;
	}

	// check for capture
	if (player_id == currentBin.id[0] && currentBin.stones == 1 && currentBin.opposite.stones > 0) {
		this.bins["basin_" + player_id].stones += currentBin.opposite.stones;
		this.bins["basin_" + player_id].stones += 1; // account for the capturing stone also going to the basin

		response.stones_scored += currentBin.opposite.stones;
		response.stones_captured += currentBin.opposite.stones;

		currentBin.opposite.stones = 0;
		currentBin.stones = 0;
	}

	return response;
}

Board.prototype.loadScenario = function(scenario) {
	this.bins.basin_A.stones = scenario.A.basin;
	this.bins.basin_B.stones = scenario.B.basin;

	for (let c = 0; c < 6; c += 1) {
		this.bins["A" + (6 - c)].stones = scenario.A.bins[c];
		this.bins["B" + (6 - c)].stones = scenario.B.bins[c];
	}
}

Board.prototype.getAvailableMoves = function(player_id) {
	let availableBins = [];

	for (let c = 6; c >= 1; c -= 1) {
		let bin_id = player_id + c;
		if (this.bins[bin_id].stones > 0) {
			availableBins.push(bin_id);
		}
	}
	return availableBins;
}

module.exports = Board;