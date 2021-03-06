'use strict';

/**
 * @ngdoc function
 * @name angularTizenApp.controller:MaincontrollerCtrl
 * @description
 * # MaincontrollerCtrl
 * Controller of the angularTizenApp
 */
function MainController($http, $log, TizenLogHelper, TizenHttpRelay) {
    var self = this;
    self.data = "hello";
    self.feeds = [];
    self.today = null;
    self.counter = 1;

    self.getData = "GET DATA";
    self.postData = "POST DATA";
    self.loghelper = TizenLogHelper;
    self.relay = TizenHttpRelay;
    self.connect = function () {
        self.relay.connect();
    }

    self.sample = function () {
        var url = "http://koti.kapsi.fi/~talahtel/json/sample.json"
        $http({
            method: 'GET',
            url: url,
        }).then(function (response) {
            self.getData = response.data.data;
        }, function (error) {
            $log.error(error);
        })
    }

    self.samplePOST = function () {
        var url = "http://koti.kapsi.fi/~talahtel/json/echo.cgi"

        var req = {
            method: 'POST',
            url: url,
            headers: {
                'Content-Type': undefined,
                'Accept-Language': 'Finnish'
            },
            data: {test: 'should echo ' + (self.counter++)}
        }

        $http(req).then(function (response) {
            $log.debug("got response to main");
            $log.debug(response);
            self.postData = response.data.test;
        }, function (error) {
            $log.error(error);
        })
    }

    self.fetchRss = function (url) {
        return $http.jsonp('//ajax.googleapis.com/ajax/services/feed/load?v=1.0&num=50&callback=JSON_CALLBACK&q=' + encodeURIComponent(url), {
            headers: {"Encoding": "UTF-8"}
        });
    }


    document.addEventListener('tizenhwkey', function (e) {
        $log.debug("Got key " + e)
        if (e.keyName == "back") {
            tizen.application.getCurrentApplication().exit();
        }
    });

    self.load = function () {
        self.fetchRss("http://www.juvenes.fi/tabid/1156/moduleid/3302/RSS.aspx").then(function (response) {
            $log.debug("got response");
            self.feeds = response.data.responseData.feed.entries;
            // self.today = response.data.responseData.feed.title;
            angular.forEach(self.feeds, function (feed) {
                if (new Date(Date.parse(feed.publishedDate)).toDateString() == (new Date()).toDateString()) {
                    self.today = feed;
                }
                if (!self.today) {
                    feed;
                }
            });
        }, function (error) {
            $log.error("error fetching rss");
            $log.error(error);
        });


    }

    self.relay.addConnectionListener(function (connected) {
        $log.debug("Loading");
        if (connected) {
            self.load();
        }
    });
}


angular.module('TizenHttp')
    .controller('MainCtrl', ['$http', '$log', 'TizenLogHelper', 'TizenHttpRelay', function ($http, $log, TizenLogHelper, TizenHttpRelay) {
        return new MainController($http, $log, TizenLogHelper, TizenHttpRelay);
    }]).filter('nodiet', function ($sce) {
    return function (data) {
        if (!data) return data;

        return $sce.trustAsHtml(data.replace(/\(.*?\)/g, "").trim());
    }
});