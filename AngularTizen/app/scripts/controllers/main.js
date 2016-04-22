'use strict';

/**
 * @ngdoc function
 * @name angularTizenApp.controller:MaincontrollerCtrl
 * @description
 * # MaincontrollerCtrl
 * Controller of the angularTizenApp
 */
angular.module('TizenHttp')
    .controller('MainCtrl', ['$http', '$log', 'TizenHttpRelay', '$xhrFactory', function ($http, $log, TizenHttpRelay, $xhrFactory) {
        var self = this;
        self.data = "hello";
        self.feeds = [];
        self.today = null;

        self.relay = TizenHttpRelay;
        self.connect = function() {
            self.relay.connect();
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
    }]).filter('unsafe', function ($sce) {
    return $sce.trustAsHtml;
});