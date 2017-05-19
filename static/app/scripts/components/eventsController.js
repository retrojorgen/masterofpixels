/**
 * Created by jorjacob on 20.10.2016.
 */

masterOfPixels.component('events', {
    templateUrl: '/static/app/scripts/views/events.html',
    controller: function ($scope, $http, $timeout, $rootScope, appConst) {


        $http.get(appConst.apiUrl + 'events')
            .then(function (events) {
                $scope.events = events.data;
                $scope.currentEvent = $scope.events[0];
                console.log($scope.currentEvent);
            });
    }});