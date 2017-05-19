var mobileThreshold = (window.innerWidth < 800);

var masterOfPixels = angular
	.module('masterOfPixels', ['ngRoute', 'ngAnimate', 'underscore', 'ngSanitize', 'puElasticInput', 'angular-storage', 'angularMoment', 'angular-click-outside', 'datePicker'])
	.constant("appConst", {
		"apiUrl": "http://localhost:4444/api/"
	})
	.run(function(amMoment, $rootScope) {
		amMoment.changeLocale('no');
	})
	.config(['$locationProvider', '$routeProvider', function ($locationProvider, $routeProvider) {
		$locationProvider.html5Mode(true).hashPrefix('!');
		$routeProvider.
		when('/highscores', {
			'template': '<highscores></highscores>'
		}).
        when('/events', {
            'template': '<events></events>'
        }).
        when('/event/:eventId', {
            'template': '<players></players>'
        }).
        when('/event/:eventId/edit-existing-player/:playerId', {
            'template': '<edit-existing-player></edit-existing-player>'
        }).
        when('/event/:eventId/edit-existing-player', {
            'template': '<edit-existing-player></edit-existing-player>'
        }).
		otherwise('/events');
	}]);


// file upload button
// http://jsfiddle.net/johnwun/U47tM/