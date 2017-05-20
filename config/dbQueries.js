var crypto = require('crypto');
var _ = require('underscore');
var bcrypt = require('bcrypt-nodejs');

module.exports = function (models, slug) {

	var User = models.User;
	var Player = models.Player;
	var Event = models.Event;
	var Score = models.Score;
	var Game = models.Game;

	var ResetPassword = models.ResetPasswordSchema;

	function generateSecureVal(callback) {
		crypto.randomBytes(3, function(err, buffer) {
			callback(parseInt(buffer.toString('hex'), 16).toString().substr(0,6));
		});
	};


	return {
		createUser: function (username, password, nick, callback) {
			var newUser = new User({
				username: username,
				password: password,
				role: 'user'
			});
			newUser.save(function (err) {
				if(!err) {
					callback(newUser);
				} else {
					callback(false);
				}
			});
		},
		getUserFromUsername: function (username, callback) {
			 User.findOne({ 'username' :  username }, function(err, user) {
			 	if(err)
			 		callback(false);
			 	if(!user)
			 		callback(false);
			 	if(user)
			 		callback(user);
			});
		},

        getScoresForEventByEventId: function (eventId, callback) {
			Score.find({eventId: eventId}, function (err, scores) {
				if(!err) {
					callback(scores);
				} else {
					callback([]);
				}
			});
		},
		

		getPlayers: function (callback) {
			Player.find({}, function (err, players) {
				if(!err) {
					callback(players);
				}
			});
		},

		getGames: function (callback) {
			Game.find({}, function (err, games) {
                if(!err) {
                    callback(games);
                }
			});
		},

		getGamesByIds: function (gameIds, callback) {
			Game.find({_id: {$in: gameIds}}, function (err, games) {
				if(!err) {
					callback(games);
				} else {
					callback(false);
				}
			})
		},

		getScoresForPlayerInEventByGameIdsAndPlayerIdAndEventId: function (gameIds, eventId, playerId, callback) {
			console.log(eventId);
			Score.find({gameId: {$in: gameIds}, playerId: playerId, eventId: eventId}, function (err, scores) {
				if(!err) {
					callback(scores);
				} else {
					callback(false);
				}
			})
		},

		getEventScores: function (eventId, callback) {
			Score.find({eventId: eventId}, function (err, results) {
				if(!err) {
					callback(results);
				}
			});
		},

		getEventById: function (eventId, callback) {
			Event.findById(eventId, function (err, event) {
				if(!err) {
					callback(event);
				} else {
					callback(false);
				}
			});
		},

		getEvents: function (callback) {
			Event.find({}, function (err, events) {
				if(!err) {
					callback(events);
				}
			});
		},


		addPlayer: function (player, callback) {
            console.log('Other side', player);
            var newPlayer = new Player({
                "fullName": player.fullName || '',
                "email": player.email || ''
			});

            newPlayer.save(function (err) {
            	console.log('saving');
            	if(err) {
            		console.log('error happened', err);
				} else {
            		console.log('created player');
                    callback(newPlayer);
				}

            });
		},

        removePlayer: function (playerId, callback) {
			console.log('removing platyer ', playerId);
            Player.findByIdAndRemove(playerId, function (err) {
            	if(!err) {
            		console.log(err);
            		callback(false);
				} else {
            		callback(false);
				}
			})
        },


        updatePlayer: function (player, callback) {
			Player.findByIdAndUpdate(player._id, player, function (err, player) {
				callback(player);
			});
		},

		addScore: function (score, callback) {
			var newScore = new Score(score);
            newScore.save(function (err) {
                callback(newScore);
            });
		},

        updateScore: function (score, callback) {
            Score.findByIdAndUpdate(score._id, score, function (err, score) {
                callback(score);
            });
        },

		getPlayer: function (playerId, callback) {
			Player.findById(playerId, function (err, player) {
				callback(player);
			});
		},



		/**
		getUsers: function (userArray, callback) {
			User.find({_id: {$in: userArray}}, function (err, results) {
				if(!err) {
					callback(results);
				} else {
					callback(false);
				}
			});
		},
		**/


	}
}

