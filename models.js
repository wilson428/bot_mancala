// options
/*
	let defaults = {
		stoneCount: 4,
		colorSchemeA: "uniform|monochrome|rainbow",
		colorSchemeB: "uniform|monochrome|rainbow",
		colorA: "blue",
		colorB: "yellow"
	};
*/

const defaults = {
	stoneCount: 4,
	colorSchemeA: "monochrome",
	colorSchemeB: "monochrome",
	colorA: "blue",
	colorB: "yellow"
};

function Game(options) { 
	this.options = Object.assign(options || {}, defaults);


}