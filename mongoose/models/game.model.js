const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let GameSchema = new Schema({
	_id: { type: String, required: true },
	time: {
		start: { type: Date, required: true },
		end: { type: Date }
	}
});

module.exports = mongoose.model('Game', GameSchema);
