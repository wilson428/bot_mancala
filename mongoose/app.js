const express = require('express');
const bodyParser = require('body-parser');

const game = require('./routes/game.route');
const app = express();

const mongoose = require('mongoose');
let dev_db_url = 'mongodb://localhost:27017/bot_mancala';
let mongoDB = process.env.MONGODB_URI || dev_db_url;
mongoose.connect(mongoDB, { useNewUrlParser: true });
mongoose.Promise = global.Promise;
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use('/games', game);

let port = 8082;
app.listen(port, () => {
	console.log('Server is up and running on port numner ' + port);
});

