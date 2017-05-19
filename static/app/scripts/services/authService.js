/**
 * Created by jorjacob on 13/12/16.
 */
spilldb.factory('authService', function(store, $q, $http, $rootScope, $location, appConst) {
        var deferred = $q.defer();

        var jwt = store.get("jwt");

        var loggedInUser = false;

        var getUserHTTP = function (callback) {
            $http({
                url: appConst.apiUrl + "/api/jwt/me",
                method: "GET",
                headers: {"Authorization": jwt}
            })
                .then(function (response) {
                    if(response) {
                        loggedInUser = response.data;
                        callback(loggedInUser);
                    } else {
                        callback(false);
                    }
                });
        };

        if(jwt) {
            getUserHTTP(function (response) {
                console.log('getting user');
                if(response) {

                    loggedInUser = response;
                    console.log('logget inn som: ', loggedInUser);
                    $rootScope.user = response;
                    $rootScope.$broadcast("user logged in");
                    deferred.resolve();
                } else {
                    deferred.reject();
                }
            });
        } else {
            deferred.reject();
        };

        var getLoggedInUser = function () {
            return loggedInUser;
        };

        var login = function (username, password, callback) {
            var loginCredentials = {
                username: username,
                password: password
            }

            $http({
                url: appConst.apiUrl + "/api/authenticate",
                method: "POST",
                data: loginCredentials
            })
                .then(function (data) {
                    if(data.status) {
                        store.set("jwt", data.data.token);
                        jwt = data.data.token;
                        loggedInUser = data.data.user;
                        $rootScope.user = getLoggedInUser();

                        console.log('logget inn som: ', $rootScope.user);
                        callback(true);
                        $location.path("/");
                    } else {
                        loggedInUser = false;
                        callback(false);
                    }
                });
        };

        var signedGet = function (url) {
            return $http({
                "method": "GET",
                "headers": {"Authorization": jwt},
                "url": url
            });
        };

        var signedPost = function (url, data) {
            return $http({
                "method": "POST",
                "headers": {"Authorization": jwt},
                "url": url,
                "data": data
            });
        };

        var signup = function (username, password, nick, callback) {
            $http.post(appConst.apiUrl + "/api/signup", {username: username, password: password, nick: nick})
                .then(function (data) {
                    if(data.status) {
                        store.set("jwt", data.data.token);
                        jwt = data.data.token;
                        loggedInUser = data.data.user;
                        $rootScope.user = getLoggedInUser();
                        $rootScope.$broadcast("user logged in");
                        $rootScope.$broadcast("user logged in from form");
                        $location.path("/wizard/avatar");
                        if(callback)
                            callback(true);
                    } else {
                        loggedInUser = false;
                        if(callback)
                            callback(false);
                    }

                });
        };

        var logout = function (callback) {
            store.remove('jwt');
            $http.post("/logout");
            $rootScope.user = undefined;
            loggedInUser = false;
            callback();
        };

        return {
            authReady : deferred.promise,
            getLoggedInUser : getLoggedInUser,
            login : login,
            signup : signup,
            signedPost: signedPost,
            signedGet: signedGet,
            logout: logout
        }
    });