'use strict';

/**
 * @ngdoc service
 * @name scoreitApp.dataService
 * @description
 * # dataService
 * Service in the TizenHttpRelay.
 */
angular.module('TizenHttp')
    .service('androidService', ['$log', "$q", "webapisService", function ($log, $q, webapis) {

        var courseChannel = "/scoreit/course";
        var SAAgent = {courseChannel: null};
        var SASocket = {courseChannel: null};
        var CHANNELID = {courseChannel: 104};
        var promises = {courseChannel: null};
        var connectionPromise = null;
        var receiveCallbacks = {};
        var ProviderAppName = "TizenHttpRelay";


        function createHTML(log_string) {
            var content = document.getElementById("toast-content");
            content.textContent = log_string;
            tau.openPopup("#toast");
        }

        function onerror(err) {
            $log.debug("err [" + err + "]");
        }

        var agentCallback = function (id) {
            return {
                onconnect: function (socket) {
                    SASocket[id] = socket;
                    if (connectionPromise) {
                        connectionPromise.resolve("OK");
                        connectionPromise = null;
                    }

                    SASocket[id].setSocketStatusListener(function (reason) {
                        console.log("Service " + id + " connection lost, Reason : [" + reason + "]");
                        disconnect(id);
                    });
                    SASocket[id].setDataReceiveListener(onreceive.bind(this, id));
                },
                onerror: onerror
            };
        };

        var peerAgentFindCallback = function (id) {
            return {
                onpeeragentfound: function (peerAgent) {
                    try {
                        if (peerAgent.appName == ProviderAppName) {
                            SAAgent[id].setServiceConnectionListener(agentCallback(id));
                            SAAgent[id].requestServiceConnection(peerAgent);
                        } else {
                            createHTML("Not expected app!! : " + peerAgent.appName);
                        }
                    } catch (err) {
                        console.log("exception [" + err.name + "] msg[" + err.message + "]");
                    }
                },
                onerror: onerror
            };
        }

        function onsuccess(id, deferred, agents) {
            var agentsLen = agents.length,
                found = false,
                i = 0;

            for (i; i < agentsLen; i += 1) {
                if (agents[i].id === id) {
                    found = true;
                    try {
                        SAAgent[id] = agents[i];

                        SAAgent[id].setPeerAgentFindListener(peerAgentFindCallback(id));
                        SAAgent[id].findPeerAgents();
                        $log.info("Resolved agent " + agents[i]);
                       // deferred.resolve("OK");
                    } catch (err) {
                        deferred.reject(err);
                        console.log("exception [" + err.name + "] msg[" + err.message + "]");
                    }
                }
            }

            if (!found) {
                createHTML("Not found SAAgent " + id + "!!");
            }
        }

        function connect(id, deferred) {
            if (!webapis.hasWebapis()) {
                deferred.resolve("OK");
            }
            if (SASocket[id]) {
                deferred.resolve("OK");
                $log.info("Already connected");
                createHTML('Already connected!');
                return false;
            }
            try {
                connectionPromise = deferred;
                webapis.sa().requestSAAgent(onsuccess.bind(this, id, deferred), function (err) {
                    deferred.reject(err);
                    $log.info("err [" + err.name + "] msg[" + err.message + "]");
                });
            } catch (err) {
                deferred.reject(err);
            }
        }

        function disconnect(id) {
            try {
                if (SASocket[id] != null) {
                    SASocket[id].close();
                    SASocket[id] = null;
                    createHTML("closeConnection " + id);
                }
            } catch (err) {
                console.log("exception [" + err.name + "] msg[" + err.message + "]");
            }
        }

        function onreceive(id, channelId, data) {
            $log.debug("Received: "+ data);
            if (promises[id]) {
                promises[id].resolve(data);
                promises[id] = null;
            } else if (receiveCallbacks[id]) {
                receiveCallbacks[id](data);
            }
        }

        function fetch(id, channel,data) {
            var deferred = $q.defer();
            if (!webapis.hasWebapis()) {

                deferred.resolve('{"name":"Epilä, Tampere","link":"http://discgolfscores.net/Main.php?do=courseTable&course_id=274","id":"274","location":"Rankasillankatu, 33270 Tampere","layouts":[{"name":"DGP-9","pars":[4,3,3,3,3,3,3,3,3],"lengths":[177,90,96,80,72,68,61,127,70],"link":"http://discgolfscores.net/Main.php?do=courseLayoutAjax&course_lid=174"},{"name":"DGS-12","pars":[4,3,3,3,3,3,3,3,3,3,3,4],"lengths":[177,90,96,80,72,68,61,127,70,80,100,160],"link":"http://discgolfscores.net/Main.php?do=courseLayoutAjax&course_lid=502"},{"name":"Vaakkolampi","pars":[3,3,3,3,3,3,3,3,3],"lengths":[80,94,61,68,87,96,61,116,96],"link":"http://discgolfscores.net/Main.php?do=courseLayoutAjax&course_lid=1"}]}')
                return deferred.promise;
            }
            try {
                promises[id] = deferred;
                if (!SASocket[id]) {
                    deferred.reject("No Socket connection");

                } else {
                    // resolved in receive
                    SASocket[id].sendData(channel, data);
                }
            } catch (e) {
                deferred.reject(e);
            }
            return deferred.promise;
        }

        return {
            connect: function (id) {
                $log.info("Connecting to " + id);
                var deferred = $q.defer();

                connect(id, deferred);
                return deferred.promise;
            },
            fetch: function (id,channel, data) {

                return fetch(id, channel,data);

            },
            isConnected: function (id) {
                return SASocket[id] != null;
            },
            listen: function(id, callback) {
                receiveCallbacks[id] = callback;
            }



        }


    }]);
