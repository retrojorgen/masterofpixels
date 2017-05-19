/**
 * Created by jorjacob on 20.10.2016.
 */

masterOfPixels.component('editExistingPlayer', {
    templateUrl: '/static/app/scripts/views/editExistingPlayer.html',
    controller: function ($scope, $http, $timeout, $rootScope, appConst, $routeParams) {
        $scope.gameLookup = {};
        $scope.scores = [];
        $scope.player = {
            fullName: "",
            email: ""
        };
        $scope.eventId = $routeParams.eventId;

        if($routeParams.playerId) {
            $http.get(appConst.apiUrl + 'player/' + $routeParams.playerId)
                .then(function (player) {
                    $scope.player = player.data;
                });
        }


        $http.get(appConst.apiUrl + 'events/' + $routeParams.eventId + '/games')
            .then(function (games) {
                $scope.games = games.data;
                _.each($scope.games, function (game) {
                    $scope.gameLookup[game._id] = game;
                });

                $http.get(appConst.apiUrl + 'events/' + $routeParams.eventId + '/scores/' + $routeParams.playerId)
                    .then(function (gameScores) {
                        _.each($scope.games, function (game) {
                            var addedScore = {
                                score: 0,
                                playerId: $routeParams.playerId || 0,
                                eventId: $routeParams.eventId,
                                gameId: game._id
                            };

                            var foundGame = _.find(gameScores.data, function (gameScore) {
                                return gameScore.gameId == game._id
                            });

                            console.log('fant spill', foundGame, game, gameScores.data);

                            if(foundGame) {
                                addedScore.created = foundGame.created;
                                addedScore._id = foundGame._id;
                                addedScore.score = foundGame.score;
                            }

                            $scope.scores.push(addedScore);
                        });
                    });
            });


        $scope.update = function () {
            if($scope.player._id) {
                $http.post(appConst.apiUrl + 'player/update', $scope.player)
                    .then(function () {
                        updateScores();
                    });
            }

            else
                $http.post(appConst.apiUrl + 'player/add', $scope.player)
                    .then(function (player) {
                        $scope.player = player.data;
                        updateScores();
                    });
            
        };
        
        var updateScores = function () {
            _.each($scope.scores, function (score) {
                score.playerId = $scope.player._id;
                if(score._id)
                    $http.post(appConst.apiUrl + 'score/update', score);
                else {
                    $http.post(appConst.apiUrl + 'score/add', score)
                        .then(function (score) {
                            score = score.data;
                        })
                };
            });
        }
    }});