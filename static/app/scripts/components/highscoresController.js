/**
 * Created by jorjacob on 20.10.2016.
 */

masterOfPixels.component('highscores', {
    templateUrl: '/static/app/scripts/views/highscores.html',
    controller: function ($scope, $http, $timeout, $rootScope, appConst, $interval) {

        $scope.events = [];
        $scope.scores = {};
        $scope.currentEvent = {};

        var getScores = function (eventId) {
            $http.get(appConst.apiUrl + 'events/' + eventId + '/highscore')
                .then(function (scores) {
                    $scope.scores = scores.data;
                    console.log('scores', $scope.scores);
                });
        };


        $interval(function () {
            getScores();
        }, 2000);


        $http.get(appConst.apiUrl + 'events')
            .then(function (events) {
                $scope.events = events.data;
                $scope.currentEvent = $scope.events[0];
                console.log($scope.currentEvent);
                getScores($scope.events[0]._id);
            });
    }});