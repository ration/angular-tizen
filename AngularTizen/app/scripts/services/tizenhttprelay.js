'use strict';

/**
 * @ngdoc service
 * @name consumerApp.TizenHttpRelay
 * @description
 * # TizenHttpRelay
 * Factory in the consumerApp.
 */
angular.module('TizenHttp')
    .factory('TizenHttpRelay', ['$log', '$injector', '$httpBackend', 'androidService', '$q', '$document',
        function ($log, $injector, $httpBackend, androidService, $q, $document) {
            var self = this;
            self.relay = "js/sample2.json";
            self.counter = 1;
            self.relayId = 188;
            self.connected = false;
            self.httpService = $injector.get("$http");
            self.toAndroidApiRequest = function (method, url, data, headers) {
                var req = "";
                var parser = document.createElement("a");
                parser.href = url;


                req += method + " " + parser.hostname;
                $log.debug(req);
            };

            androidService.listen(self.relayId, function (data) {
                $log.debug("Got response from android service");
            });
            androidService.connect(self.relayId).then(function (response) {
                $log.info("Service connected " + androidService.isConnected(self.relayId));
                self.connected = true;
                $log.info(response);
            });
            return {
                relay: function (method, url, data, callback, headers, timeout, withCredentials) {
                    self.toAndroidApiRequest(method, url, data, headers);
                    return;
                }
            };
        }]).factory('$xhrFactory', function () {
    //  $log.debug("factory replace!");
    return function createXhr(method, url) {
        $log.debug("fetching fake");
        var base = new TizenRelay();

        //return base;
        return new window.XMLHttpRequest();

    };
}).config(function ($provide) {
    $provide.decorator('$httpBackend', function ($delegate, $injector) {
        var oldHttpBackend = $delegate;
        var asincDefinitions = [];


        var httpBackend = function (method, url, data, callback, headers, timeout, withCredentials) {
            var httpRelay = $injector.get("TizenHttpRelay");
            httpRelay.relay(method, url, data, callback, headers, timeout, withCredentials);
            // TODO Fake the JSONP request, otherwise pass on to our http provider
            oldHttpBackend(method, url, data, callback, headers, timeout, withCredentials);


        }
        httpBackend.whenAsync = function (method, url, data, headers) {
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
});
