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
                if (method == "JSONP") {
                    method = "GET";
                }
                if (url.indexOf("//") == 0) {
                    url = "http:" + url;
                }
                var req = {
                    method: method,
                    url: url,
                    headers: headers
                };

                return JSON.stringify(req);
            };

            self.isConnected = function () {
                return androidService.isConnected(self.relayId);
            }

            androidService.listen(self.relayId, function (data) {
                $log.debug("Got response from android service");

                $log.debug("data: " + data);
            });
            self.connect = function () {
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
                isConnected: function () {
                    return self.isConnected();
                },
                connect: function () {
                    self.connect();
                },
                relay: function (method, url, data, headers) {
                    var data = self.toAndroidApiRequest(method, url, data, headers);
                    $log.debug("sending " + data);
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
       // $log.debug("fetching fake");
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

        var addLogToText = function (arg) {
            var tizenRelay = $injector.get("TizenHttpRelay");

            var args = [].slice.call(arg);
            //    args[0] = [new Date().toString(), ': ', args[0]].join('');
            tizenRelay.addText(args);
            return args;
        }

        /*
         * Intercept the call to $log.debug() so we can add on
         * our enhancement. We're going to add on a date and
         * time stamp to the message that will be logged.
         */
        $delegate.debug = function () {
            origDebug.apply(null, addLogToText(arguments));
        };

        $delegate.info = function () {
            origInfo.apply(null, addLogToText(arguments));
        };

        $delegate.error = function () {
            origInfo(null, addLogToText(arguments));
        };
        return $delegate;
    }]);


    $provide.decorator('$httpBackend', function ($delegate, $injector) {
        var oldHttpBackend = $delegate;
        var asincDefinitions = [];
        var $log = $injector.get("$log");

        var httpBackend = function (method, url, data, callback, headers, timeout, withCredentials) {
            var tizenRelay = $injector.get("TizenHttpRelay");
            if (method == "JSONP") {
                //if (tizenRelay.isConnected()) {
                var req = tizenRelay.relay(method, url, data, headers).then(function (response) {
                    $log.debug("Got response!");
                    $log.debug(response);

                    var respJSON = JSON.parse(response);
                    var f = new Function("JSON_CALLBACK", respJSON.response);
                    var responseData = null;
                    f(function (json) {
                        return responseData = json.responseData;
                    })
                    var reply = {
                        responseData: responseData
                    }
                    callback(200, reply, headers, null)

                }, function (error) {
                    $log.debug("got error");
                    $log.error(error);
                })
                $log.debug(req);
            } else {
                $log.debug("Converted:");
                $log.debug(tizenRelay.convertToRawHttpRequest(method,url,data,headers));
                oldHttpBackend(method, url, data, callback, headers, timeout, withCredentials);
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
