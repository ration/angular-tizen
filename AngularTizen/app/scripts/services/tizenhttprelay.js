'use strict';

/**
 * @ngdoc service
 * @name consumerApp.TizenHttpRelay
 * @description
 * # TizenHttpRelay
 * Factory in the consumerApp.
 */
angular.module('TizenHttp')
    .factory('TizenHttpRelay', ['$log', '$injector', 'androidService', '$q', '$document',
        function ($log, $injector, androidService, $q, $document) {
            var self = this;
            self.relay = "js/sample2.json";
            self.counter = 1;
            self.relayId = "/httprelay/http";
            self.relayChannel = 188;
            self.connected = false;
            self.httpService = $injector.get("$http");
            self.text = [];
            self.toAndroidApiRequest = function (method, url, data, headers) {
                var req = "";
                var parser = document.createElement("a");
                parser.href = url;

                if (method == "JSONP") {
                    method = "GET";
                }
                var host = parser.host +"\n";

                var port = "80";
                if (parser.port) {
                    port = ""+parser.port
                }
                port += "\n";
                /*var req = {
                 method:method,
                 url:url,
                 data:data,
                 headers:headers
                 };
                 $log.debug(req);
                 androidService.fetch(self.relayId,)*/
                req += host;
                req += port;
                req += method + " " + url + " HTTP/1.1\r\n"
                angular.forEach(headers, function (value, key) {
                    req += key + ": " + value + "\r\n";
                });
                req += "\r\n";
                if (data) {
                    req += data;
                }


                $log.debug(req);
                return req;
            };

            androidService.listen(self.relayId, function (data) {
                $log.debug("Got response from android service");
                $log.debug("data: " + data);
            });
            self.connect = function() {
                $log.debug("Connecting to backend");
                androidService.connect(self.relayId).then(function (response) {
                    $log.info("Service connected " + androidService.isConnected(self.relayId));
                    self.connected = true;
                    $log.info(response);
                }, function (response) {
                    $log.error("Received error from android service");
                    $log.error(response);
                });
            }
            return {
                text: self.text,
                connect: function () {
                    self.connect();
                },
                relay: function (method, url, data, headers) {
                    var data = self.toAndroidApiRequest(method, url, data, headers);
                    return androidService.fetch(self.relayId, self.relayChannel, data);
                },
                convertToRawHttpRequest: function (method, url, data, headers) {
                    return self.toAndroidApiRequest(method, url, data, headers);
                },
                addText: function (text) {
                    self.text.push(text);
                }
            };
        }]
    ).factory('$xhrFactory', function () {
    //  $log.debug("factory replace!");
    return function createXhr(method, url) {
        $log.debug("fetching fake");
        var base = new TizenRelay();

        //return base;
        return new window.XMLHttpRequest();

    };
}).config(function ($provide) {

    $provide.decorator('$log', ['$delegate', '$injector', function ($delegate, $injector) {
        // Keep track of the original debug method, we'll need it later.
        var origDebug = $delegate.debug;
        var origInfo = $delegate.info;
        var origError = $delegate.error;

        /*
         * Intercept the call to $log.debug() so we can add on
         * our enhancement. We're going to add on a date and
         * time stamp to the message that will be logged.
         */
        $delegate.debug = function () {
            var tizenRelay = $injector.get("TizenHttpRelay");

            var args = [].slice.call(arguments);
        //    args[0] = [new Date().toString(), ': ', args[0]].join('');
            tizenRelay.addText(args);
            // Send on our enhanced message to the original debug method.
            origDebug.apply(null, args)
        };

        $delegate.info = function () {
            var tizenRelay = $injector.get("TizenHttpRelay");

            var args = [].slice.call(arguments);
            //    args[0] = [new Date().toString(), ': ', args[0]].join('');
            tizenRelay.addText(args);
            // Send on our enhanced message to the original debug method.
            origInfo.apply(null, args)
        };

        $delegate.error = function () {
            var tizenRelay = $injector.get("TizenHttpRelay");

            var args = [].slice.call(arguments);
            //    args[0] = [new Date().toString(), ': ', args[0]].join('');
            tizenRelay.addText(args);
            // Send on our enhanced message to the original debug method.
            origError.apply(null, args)
        };
        return $delegate;
    }]);


    $provide.decorator('$httpBackend', function ($delegate, $injector) {
        var oldHttpBackend = $delegate;
        var asincDefinitions = [];
        var $log = $injector.get("$log");

        var httpBackend = function (method, url, data, callback, headers, timeout, withCredentials) {
            var tizenRelay = $injector.get("TizenHttpRelay");

            /*
             var match = matchRequest()
             if (match) {
             $log.debug("Match");
             match.response.promise
             //promise resolution: success
             .then(function (promiseResolvedObject) {

             callback(200, promiseResolvedObject, match.response.headers, match.response.status)
             })
             //promise.resolution: fail
             .then(null, function (error) {
             callback(404, error, match.response.headers, match.response.status)
             })

             }
             */
            if (method == "JSONP") {
                var req = tizenRelay.relay(method, url, data, headers).then(function (response) {
                    $log.debug("Got response!");
                    $log.debug(response);
                }, function (error) {
                    $log.debug("got error");
                    $log.error(error);
                })
                $log.debug(req);
                //} else {
                oldHttpBackend(method, url, data, callback, headers, timeout, withCredentials);
            }
            function matchRequest() {
                var matches = asincDefinitions
                    .filter(function (definition) {
                        return (definition.url === url) ? true : false
                    })
                    .filter(function (definition) {
                        return (definition.method === method) ? true : false
                    })

                return matches.length ? matches[0] : false;
            }

        }
        httpBackend.whenAsync = function (method, url, data, headers) {
            $log.debug("When async..");
            var definition = {method: method, url: url, data: data, headers: headers},
                chain = {
                    respond: function (promise, headers, status) {
                        definition.response = {promise: promise, headers: headers, status: status};
                        return chain;
                    }
                };
            asincDefinitions.push(definition);
            return chain;
        }

        for (var key in oldHttpBackend) {
            httpBackend[key] = oldHttpBackend[key];
        }
        return httpBackend;

    })
})
;
