var bcrypt = require('bcrypt-nodejs');
module.exports = function (dbHandler) {

	var Schema = dbHandler.Schema;

	var userSchema = dbHandler.Schema({
	    username: String,
	    password: String,
	    role: String,
	    created: { type: Date, default: Date.now }
	});

	var playerSchema = dbHandler.Schema({
	    fullName: String,
	    email: String,
	    created: { type: Date, default: Date.now }
	});

	var scoreSchema = dbHandler.Schema({
		gameId: Schema.Types.ObjectId,
	    eventId: Schema.Types.ObjectId,
	    playerId: Schema.Types.ObjectId,
	    score: String,
	    created: { type: Date, default: Date.now }
	});

	var gameSchema = dbHandler.Schema({
		eventId: Schema.Types.ObjectId,
		gameName: String,
		gameDescription: String
	});

	var eventSchema = dbHandler.Schema({
	    eventName: String,
	    eventDescription: String,
	    games: [],
	    created: { type: Date, default: Date.now }
	});




	userSchema.pre('save', function (next) {
		var user = this;


		if (this.isModified('password') || this.isNew) {
			user.password = bcrypt.hashSync(user.password);
			next();
		} else {
			return next();
		}
	});

	userSchema.methods.comparePassword = function (passw, cb) {
		bcrypt.compare(passw, this.password, function (err, isMatch) {
			if (err) {
				return cb(err);
			}
			cb(null, isMatch);
		});
	};

	var convertToObjectId = function (idString) {
		return dbHandler.Types.ObjectId(idString);
	};


	return {
		User : dbHandler.model('User', userSchema),
		Player : dbHandler.model('Player', playerSchema),
		Score : dbHandler.model('Score', scoreSchema),
		Game: dbHandler.model('Game', gameSchema),
		Event: dbHandler.model('Event', eventSchema),
		convertToObjectId: convertToObjectId
	}
}