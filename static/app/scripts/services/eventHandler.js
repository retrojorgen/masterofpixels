/**
 * Created by jorjacob on 18/12/16.
 */
spilldb.factory('eventService', function($http, authService, appConst) {

    var postEvent = function (eventObject, callback) {
        authService.signedPost(appConst.apiUrl + "/api/jwt/event", {event: eventObject})
            .then(function () {
                if(callback) {
                    callback();
                }
            });
    };

    return {
        postEvent : postEvent
    }
});

