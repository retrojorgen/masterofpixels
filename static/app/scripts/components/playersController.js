/**
 * Created by jorjacob on 20.10.2016.
 */

masterOfPixels.component('players', {
    templateUrl: '/static/app/scripts/views/players.html',
    controller: function ($scope, $http, $timeout, $rootScope, appConst, $routeParams) {

        $http.get(appConst.apiUrl + 'players')
            .then(function (players) {
                $scope.players = players.data;
            });
        $http.get(appConst.apiUrl + 'events')
            .then(function (events) {
                $scope.events = events.data;
                $scope.currentEvent = $scope.events[0];

                $scope.currentEvent = _.find($scope.events, function (event) {
                    return event._id == $routeParams.eventId;
                });
                console.log($scope.currentEvent);
            });
    }});