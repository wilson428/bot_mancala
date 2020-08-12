const Game = require('../models/game.model');

//Simple version, without validation or sanitation
exports.test = function(req, res) {
    res.send('Greetings from the Test controller!');
};

exports.game_create = function(req, res) {
	console.log(req);

    let game = new Game({
        _id: req.body.id,
        time: {
        	start: new Date()
        }
    });

    game.save(function(err) {
        if (err) {
            res.send(err);
        }
        res.send('Game created successfully')
    });
};