var _ = require('underscore');

module.exports = function(app, passport, dbQueries, config) {

  app.get('/api', function (req, res, next) {
    
  });


  app.get('/404', function(req, res) {
        res.send("error");
  });

  app.post('/api/signup', function(req, res) {
    if (!req.body.username || !req.body.password) {
      res.json({success: false, msg: 'Please pass name and password.'});
    } else {
      dbQueries.createUser(req.body.username, req.body.password, req.body.nick, function (user) {
        var token = jwt.encode(user, config.secret);
        if(user) {
          res.json({success: true, msg: 'Successful created new user.', token: 'JWT ' + token, user: user});
        } else {
          res.json({success: false, msg: 'Username already exists.'});
        }
      });
    }
  });


  app.post('/api/authenticate', function(req, res) {
    dbQueries.getUserFromUsername(req.body.username, function (user) {
      if(user) {
        user.comparePassword(req.body.password, function (err, isMatch) {
          if (isMatch && !err) {
            // if user is found and password is right create a token
            var token = jwt.encode(user, config.secret);
            // return the information including token as JSON
            res.json({success: true, token: 'JWT ' + token, user: user});
          } else {
            res.send({success: false, msg: 'Authentication failed. Wrong password.'});
          }
        });
      } else {
        res.send({success: false, msg: 'Authentication failed. User not found.'});
      }
    });
  });


  app.post('/api/jwt/update/user', passport.authenticate('jwt', { session: false}), function(req, res) {
    var user = req.body;
    dbQueries.updateUser(user, function (user) {
      res.json(user);
    });
  });


  app.get('/api/events/:eventId/games', function (req, res) {
    var eventId = req.params.eventId;
    dbQueries.getEventById(eventId, function (event) {
      if(event) {
        var currentEvent = event;
        var gameIds = [];


        currentEvent.games.forEach(function (game) {
          gameIds.push(game.gameId);
        });


        dbQueries.getGamesByIds(gameIds, function (games) {
          if(games) {
            res.json(games);
          } else {
            res.json(false);
          }
        });

      } else {
        res.json(false);
      }

    })
  });

  // returns highscore for entire event
  app.get('/api/events/:eventId/highscore', function (req, res) {
    var playerLookup = {};
    var gameLookup = {};
    var eventGameLookup = {};
    var playersArray = [];
    var sortedPlayersArray = [];

    dbQueries.getPlayers(function (players) {
      _.each(players, function (player) {
        playerLookup[player._id] = {
          playerId: player._id,
          fullName: player.fullName,
          email: player.email,
          player: player.created,
          scores: []
        };
      });
      dbQueries.getEventById(req.params.eventId, function (event) {
          _.each(event.games, function (game) {
              eventGameLookup[game.gameId] = game.factor;
          });
          dbQueries.getGames(function (games) {
            _.each(games, function (game) {
                gameLookup[game._id] = {
                  _id: game._id,
                  gameName: game.gameName,
                  console: game.console
                };
            });
            dbQueries.getScoresForEventByEventId(req.params.eventId, function (scores) {
                _.each(scores, function(score) {

                  var newScore = {
                    originalScore : score.score,
                    calculatedScore: score.score * eventGameLookup[score.gameId],
                    game: gameLookup[score.gameId]
                  };
                  if(playerLookup[score.playerId])
                    playerLookup[score.playerId].scores.push(newScore);


                });

                _.each(playerLookup, function (player) {
                  var totalScore = 0;
                  var scoresLookup = {};
                  _.each(player.scores, function (score) {
                    if(!scoresLookup[score.game._id]) {
                      scoresLookup[score.game._id] = score.calculatedScore
                    } else {
                      if(scoresLookup[score.game._id] < score.calculatedScore) {
                          scoresLookup[score.game._id] = score.calculatedScore;
                      }
                    }
                  });
                  _.each(scoresLookup, function (score) {
                    totalScore += score;
                  });

                  player.totalScore = totalScore;
                  player.scoresLookup = scoresLookup;
                  playersArray.push(player);

                });

                var sortedPlayersArray = _.sortBy(playersArray, function (player) {
                  return player.totalScore;
                });

                sortedPlayersArray.reverse();


                _.each(gameLookup, function (game) {
                  game.scores = [];
                  _.each(sortedPlayersArray, function (player) {
                    if(player.scoresLookup[game._id]) {
                      game.scores.push({
                          fullName: player.fullName,
                          playerId: player.playerId,
                          score: player.scoresLookup[game._id]
                      });
                    }
                  });
                  game.scores = _.sortBy(game.scores, function (score) {
                    return score.score;
                  });

                  game.scores = game.scores.reverse();
                });

                res.json({
                    sorted: sortedPlayersArray,
                    perGame: gameLookup
                });


            });


          });

      });

    });
  });

  app.get('/api/player/:playerId', function (req, res) {
    dbQueries.getPlayer(req.params.playerId, function (player) {
      res.json(player);
    });
  });

  app.get('/api/events/:eventId/scores/:playerId', function (req, res) {
    var eventId = req.params.eventId;
    var playerId = req.params.playerId;
    dbQueries.getEventById(eventId, function (event) {
      if(event) {
        var currentEvent = event;
        var gameIds = [];

        currentEvent.games.forEach(function (game) {
          gameIds.push(game.gameId);
        });

        dbQueries.getScoresForPlayerInEventByGameIdsAndPlayerIdAndEventId(gameIds, eventId, playerId, function (scores) {
          if(scores) {
            res.json(scores);
          } else {
            res.json(false);
          }
        });

      } else {
        res.json(false);
      }

    })
  });

  app.post('/api/player/update', function (req, res, next) {
    dbQueries.updatePlayer(req.body, function (player) {
      res.json(player);
    });
  });

  app.post('/api/player/add', function (req, res, next) {
      dbQueries.addPlayer(req.body, function (player) {
          res.json(player);
      });
  });

    app.post('/api/score/update', function (req, res, next) {
        dbQueries.updateScore(req.body, function (score) {
            res.json(score);
        });
    });

    app.post('/api/score/add', function (req, res, next) {
        dbQueries.addScore(req.body, function (score) {
            res.json(score);
        });
    });

  app.post('/api/player/:eventId/', function(req, res, next) {
    if(req.body.user._id) {
      _.each(req.body.scores, function (score) {
          dbQueries.addScore(score, req.body.user, function () {
          });
      });
    } else {
      dbQueries.addPlayer(req.body.user, function (user) {
          _.each(req.body.scores, function (score) {
              dbQueries.addScore(score, user, function () {
              });
          });
      });
    }
    res.json("Updated");
  });


  app.get('/api/players/', function (req, res, next) {
    dbQueries.getPlayers(function (players) {
      res.json(players);
    });
  });

  app.get('/api/events/', function (req, res, next) {
    dbQueries.getEvents(function (events) {
      res.json(events);
    });
  });

    app.get('/api/events/:eventId', function (req, res, next) {
    if(req.params.eventId) {
      var eventId = req.params.eventId;
      dbQueries.getEventById(eventId, function (event) {
        if(event) {
          res.json(event);
        } else {
          res.json(false);
        }
      });
    } else {
      res.json(false);
    }
    
  });

  app.get('/api/events/:eventId/scores', function (req, res, next) {
    if(req.params.eventId) {
      dbQueries.getEventScores(req.params.eventId, function (scores) {
        res.json(getEventScores);
      });  
    } else {
      res.json(false);
    }
    
  });


  app.get('/*', function (req, res) {
    res.render('index');
  });

}