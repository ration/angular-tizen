'use strict';

/**
 * @ngdoc service
 * @name scoreitApp.dataService
 * @description
 * # dataService
 * Service in the TizenHttpRelay.
 */

var AndroidServiceModule = angular.module('Android', []);


function AndroidService($log, $q, webapis) {
    var SAAgent = {courseChannel: null};
    var SASocket = {courseChannel: null};
    var promises = {courseChannel: null};
    var connectionPromise = null;
    var receiveCallbacks = {};
    var ProviderAppName = "HttpTizenProvider";


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
                        createHTML("Not expected app: " + peerAgent.appName + " != " + ProviderAppName);
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

    function connect(id, deferred, appName) {
        if (appName) {
            ProviderAppName = appName;
        }
        if (!webapis.hasWebapis()) {
            $log.warn("Samsung Webapis were not found. Faking it.")
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
        $log.debug("Received: " + data);
        if (promises[id]) {
            promises[id].resolve(data);
            promises[id] = null;
        } else if (receiveCallbacks[id]) {
            receiveCallbacks[id](data);
        }
    }

    function fetch(id, channel, data) {
        var deferred = $q.defer();
        if (!webapis.hasWebapis()) {
            // Debug stuff..
            var sample = "{\"response\":\"\\\/* callback *\\\/JSON_CALLBACK({\\\"responseData\\\": {\\\"feed\\\":{\\\"feedUrl\\\":\\\"http:\\\/\\\/www.juvenes.fi\\\/tabid\\\/1156\\\/moduleid\\\/3302\\\/RSS.aspx\\\",\\\"title\\\":\\\"Juvenes\\\",\\\"link\\\":\\\"http:\\\/\\\/www.juvenes.fi\\\",\\\"author\\\":\\\"\\\",\\\"description\\\":\\\"-\\\",\\\"type\\\":\\\"rss20\\\",\\\"entries\\\":[{\\\"title\\\":\\\"Ravinteli TiMoro Lounas 28.4.2016\\\",\\\"link\\\":\\\"http:\\\/\\\/www.juvenes.fi\\\/fi-fi\\\/ravintolatjakahvilat\\\/henkilöstöravintolat\\\/Moro.aspx?week\\\\u003d17\\\\u0026weekday\\\\u003d4\\\\u0026culture\\\\u003dFI\\\",\\\"author\\\":\\\"\\\",\\\"publishedDate\\\":\\\"Wed, 27 Apr 2016 14:00:00 -0700\\\",\\\"contentSnippet\\\":\\\"Ravintola Moro Lounas - torstai 28.4.2016Ylikypsää possua ...\\\",\\\"content\\\":\\\"\\\\u003cp\\\\u003e\\\\u003cstrong\\\\u003eRavintola Moro Lounas - torstai 28.4.2016\\\\u003c\\\/strong\\\\u003e\\\\u003c\\\/p\\\\u003e\\\\u003cul\\\\u003e\\\\u003cli\\\\u003e\\\\u003cstrong\\\\u003eYlikypsää possua appelsiini-inkiväärikastikkeessa\\\\u003c\\\/strong\\\\u003e (SM,G,M,K,SE,VS,SI,SITRUS,SOIJA)\\\\u003c\\\/li\\\\u003e\\\\u003c\\\/ul\\\\u003e\\\\u003cul\\\\u003e\\\\u003cli\\\\u003e\\\\u003cstrong\\\\u003eKalkkunaa-cheddarjuustokastikkeessa\\\\u003c\\\/strong\\\\u003e (G,K,PAPR,SOIJA)\\\\u003c\\\/li\\\\u003e\\\\u003c\\\/ul\\\\u003e\\\\u003cul\\\\u003e\\\\u003cli\\\\u003e\\\\u003cstrong\\\\u003eHalloumiwokki\\\\u003c\\\/strong\\\\u003e (VS,PAPR,SITRUS,SOIJA)\\\\u003c\\\/li\\\\u003e\\\\u003c\\\/ul\\\\u003e\\\\u003cul\\\\u003e\\\\u003cli\\\\u003e\\\\u003cstrong\\\\u003eHernekeitto\\\\u003c\\\/strong\\\\u003e (G,M,K,SI)\\\\u003c\\\/li\\\\u003e\\\\u003cli\\\\u003ePannukakku ja hillo\\\\u003c\\\/li\\\\u003e\\\\u003c\\\/ul\\\\u003e\\\\u003cul\\\\u003e\\\\u003cli\\\\u003e\\\\u003cstrong\\\\u003eKuningatarjälkiruoka\\\\u003c\\\/strong\\\\u003e (G,L)\\\\u003c\\\/li\\\\u003e\\\\u003c\\\/ul\\\\u003e\\\",\\\"categories\\\":[]},{\\\"title\\\":\\\"Ravintola Moro Lounas 27.4.2016\\\",\\\"link\\\":\\\"http:\\\/\\\/www.juvenes.fi\\\/fi-fi\\\/ravintolatjakahvilat\\\/henkilöstöravintolat\\\/Moro.aspx?week\\\\u003d17\\\\u0026weekday\\\\u003d3\\\\u0026culture\\\\u003dFI\\\",\\\"author\\\":\\\"\\\",\\\"publishedDate\\\":\\\"Tue, 26 Apr 2016 14:00:00 -0700\\\",\\\"contentSnippet\\\":\\\"Ravintola Moro Lounas - keskiviikko 27.4.2016Broilerinfileétä  savuchili-kasviskastikkeessa\\\\u0026nbsp;(G,L,K,PAPR,SITRUS)Paistettua ...\\\",\\\"content\\\":\\\"\\\\u003cp\\\\u003e\\\\u003cstrong\\\\u003eRavintola Moro Lounas - keskiviikko 27.4.2016\\\\u003c\\\/strong\\\\u003e\\\\u003c\\\/p\\\\u003e\\\\u003cul\\\\u003e\\\\u003cli\\\\u003e\\\\u003cstrong\\\\u003eBroilerinfileétä  savuchili-kasviskastikkeessa\\\\u003c\\\/strong\\\\u003e (G,L,K,PAPR,SITRUS)\\\\u003c\\\/li\\\\u003e\\\\u003c\\\/ul\\\\u003e\\\\u003cul\\\\u003e\\\\u003cli\\\\u003e\\\\u003cstrong\\\\u003ePaistettua maksaa\\\\u003c\\\/strong\\\\u003e (G,M,L,K)\\\\u003c\\\/li\\\\u003e\\\\u003cli\\\\u003eKermakastike (G,L,K)\\\\u003c\\\/li\\\\u003e\\\\u003cli\\\\u003ePuolukkahillo (G,M,L,KA,K)\\\\u003c\\\/li\\\\u003e\\\\u003c\\\/ul\\\\u003e\\\\u003cul\\\\u003e\\\\u003cli\\\\u003e\\\\u003cstrong\\\\u003eProvencen kasvispyörykät\\\\u003c\\\/strong\\\\u003e (G,L,KA,SE,VS,SOIJA)\\\\u003c\\\/li\\\\u003e\\\\u003cli\\\\u003ePaputzatsiki (G,L,K,VS,PAPR,SITRUS)\\\\u003c\\\/li\\\\u003e\\\\u003c\\\/ul\\\\u003e\\\\u003cul\\\\u003e\\\\u003cli\\\\u003e\\\\u003cstrong\\\\u003ePorkkanasosekeitto\\\\u003c\\\/strong\\\\u003e (G,M,KA,VE,K)\\\\u003c\\\/li\\\\u003e\\\\u003c\\\/ul\\\\u003e\\\\u003cul\\\\u003e\\\\u003cli\\\\u003e\\\\u003cstrong\\\\u003eMarjoja ja suolakaramellia\\\\u003c\\\/strong\\\\u003e (G,L,K)\\\\u003c\\\/li\\\\u003e\\\\u003c\\\/ul\\\\u003e\\\",\\\"categories\\\":[]},{\\\"title\\\":\\\"Ravintola Moro Lounas 26.4.2016\\\",\\\"link\\\":\\\"http:\\\/\\\/www.juvenes.fi\\\/fi-fi\\\/ravintolatjakahvilat\\\/henkilöstöravintolat\\\/Moro.aspx?week\\\\u003d17\\\\u0026weekday\\\\u003d2\\\\u0026culture\\\\u003dFI\\\",\\\"author\\\":\\\"\\\",\\\"publishedDate\\\":\\\"Mon, 25 Apr 2016 14:00:00 -0700\\\",\\\"contentSnippet\\\":\\\"Ravintola Moro Lounas - tiistai 26.4.2016Jauhelihalasagne\\\\u0026nbsp;(L,VS)Rapea ...\\\",\\\"content\\\":\\\"\\\\u003cp\\\\u003e\\\\u003cstrong\\\\u003eRavintola Moro Lounas - tiistai 26.4.2016\\\\u003c\\\/strong\\\\u003e\\\\u003c\\\/p\\\\u003e\\\\u003cul\\\\u003e\\\\u003cli\\\\u003e\\\\u003cstrong\\\\u003eJauhelihalasagne\\\\u003c\\\/strong\\\\u003e (L,VS)\\\\u003c\\\/li\\\\u003e\\\\u003c\\\/ul\\\\u003e\\\\u003cul\\\\u003e\\\\u003cli\\\\u003e\\\\u003cstrong\\\\u003eRapea kalaleike\\\\u003c\\\/strong\\\\u003e (VL,KAL)\\\\u003c\\\/li\\\\u003e\\\\u003cli\\\\u003eLime-kermaviilikastike (G,L,PAPR,SITRUS)\\\\u003c\\\/li\\\\u003e\\\\u003c\\\/ul\\\\u003e\\\\u003cul\\\\u003e\\\\u003cli\\\\u003e\\\\u003cstrong\\\\u003eTofu-pähkinäpiirakka\\\\u003c\\\/strong\\\\u003e (SM,M,L,K,PÄ,SOIJA)\\\\u003c\\\/li\\\\u003e\\\\u003c\\\/ul\\\\u003e\\\\u003cul\\\\u003e\\\\u003cli\\\\u003e\\\\u003cstrong\\\\u003eMetsäsienikeitto\\\\u003c\\\/strong\\\\u003e (G,L,K)\\\\u003c\\\/li\\\\u003e\\\\u003c\\\/ul\\\\u003e\\\\u003cul\\\\u003e\\\\u003cli\\\\u003e\\\\u003cstrong\\\\u003eMustikka-jogurttimousse\\\\u003c\\\/strong\\\\u003e (K)\\\\u003c\\\/li\\\\u003e\\\\u003c\\\/ul\\\\u003e\\\",\\\"categories\\\":[]},{\\\"title\\\":\\\"Ravintola Moro Lounas 25.4.2016\\\",\\\"link\\\":\\\"http:\\\/\\\/www.juvenes.fi\\\/fi-fi\\\/ravintolatjakahvilat\\\/henkilöstöravintolat\\\/Moro.aspx?week\\\\u003d17\\\\u0026weekday\\\\u003d1\\\\u0026culture\\\\u003dFI\\\",\\\"author\\\":\\\"\\\",\\\"publishedDate\\\":\\\"Sun, 24 Apr 2016 14:00:00 -0700\\\",\\\"contentSnippet\\\":\\\"Ravintola Moro Lounas - maanantai 25.4.2016Lammaspyörykät tummassa ...\\\",\\\"content\\\":\\\"\\\\u003cp\\\\u003e\\\\u003cstrong\\\\u003eRavintola Moro Lounas - maanantai 25.4.2016\\\\u003c\\\/strong\\\\u003e\\\\u003c\\\/p\\\\u003e\\\\u003cul\\\\u003e\\\\u003cli\\\\u003e\\\\u003cstrong\\\\u003eLammaspyörykät tummassa rosmariinikastikkeessa\\\\u003c\\\/strong\\\\u003e (M,L,K,VS,SI,SOIJA)\\\\u003c\\\/li\\\\u003e\\\\u003c\\\/ul\\\\u003e\\\\u003cul\\\\u003e\\\\u003cli\\\\u003e\\\\u003cstrong\\\\u003eMustamakkara\\\\u003c\\\/strong\\\\u003e (M,L,K,SI)\\\\u003c\\\/li\\\\u003e\\\\u003cli\\\\u003eValkokastike (G,L,K)\\\\u003c\\\/li\\\\u003e\\\\u003cli\\\\u003ePuolukkahillo (G,M,L,KA,K)\\\\u003c\\\/li\\\\u003e\\\\u003cli\\\\u003ePerunamuusi (SM,G,K)\\\\u003c\\\/li\\\\u003e\\\\u003c\\\/ul\\\\u003e\\\\u003cul\\\\u003e\\\\u003cli\\\\u003e\\\\u003cstrong\\\\u003eTofu-bataatticurry\\\\u003c\\\/strong\\\\u003e (G,M,L,KA,VE,K,VS,PAPR,SITRUS,SOIJA)\\\\u003c\\\/li\\\\u003e\\\\u003c\\\/ul\\\\u003e\\\\u003cul\\\\u003e\\\\u003cli\\\\u003e\\\\u003cstrong\\\\u003eLihakeitto\\\\u003c\\\/strong\\\\u003e (G,M,K,SE)\\\\u003c\\\/li\\\\u003e\\\\u003c\\\/ul\\\\u003e\\\\u003cul\\\\u003e\\\\u003cli\\\\u003e\\\\u003cstrong\\\\u003eRaparperi - mansikkakiisseli\\\\u003c\\\/strong\\\\u003e (G,M,L,KA,VE,K)\\\\u003c\\\/li\\\\u003e\\\\u003cli\\\\u003eVanilja-kermavaahto (G,L,K)\\\\u003c\\\/li\\\\u003e\\\\u003c\\\/ul\\\\u003e\\\",\\\"categories\\\":[]},{\\\"title\\\":\\\"Ravintola Moro Lounas 22.4.2016\\\",\\\"link\\\":\\\"http:\\\/\\\/www.juvenes.fi\\\/fi-fi\\\/ravintolatjakahvilat\\\/henkilöstöravintolat\\\/Moro.aspx?week\\\\u003d16\\\\u0026weekday\\\\u003d5\\\\u0026culture\\\\u003dFI\\\",\\\"author\\\":\\\"\\\",\\\"publishedDate\\\":\\\"Thu, 21 Apr 2016 14:00:00 -0700\\\",\\\"contentSnippet\\\":\\\"Ravintola Moro Lounas - perjantai 22.4.2016Barbeque broileripizza\\\\u0026nbsp;(L,K,SE,VS,PAPR,SI,SOIJA)Palapaisti\\\\u0026nbsp;(G,M,K)Falafel ...\\\",\\\"content\\\":\\\"\\\\u003cp\\\\u003e\\\\u003cstrong\\\\u003eRavintola Moro Lounas - perjantai 22.4.2016\\\\u003c\\\/strong\\\\u003e\\\\u003c\\\/p\\\\u003e\\\\u003cul\\\\u003e\\\\u003cli\\\\u003e\\\\u003cstrong\\\\u003eBarbeque broileripizza\\\\u003c\\\/strong\\\\u003e (L,K,SE,VS,PAPR,SI,SOIJA)\\\\u003c\\\/li\\\\u003e\\\\u003c\\\/ul\\\\u003e\\\\u003cul\\\\u003e\\\\u003cli\\\\u003e\\\\u003cstrong\\\\u003ePalapaisti\\\\u003c\\\/strong\\\\u003e (G,M,K)\\\\u003c\\\/li\\\\u003e\\\\u003c\\\/ul\\\\u003e\\\\u003cul\\\\u003e\\\\u003cli\\\\u003e\\\\u003cstrong\\\\u003eFalafel kasvispyörykät\\\\u003c\\\/strong\\\\u003e (M,L,KA,VE,K,SE,VS)\\\\u003c\\\/li\\\\u003e\\\\u003cli\\\\u003ePunajuuri-tar-tarkastike (G,L,K,VS)\\\\u003c\\\/li\\\\u003e\\\\u003c\\\/ul\\\\u003e\\\\u003cul\\\\u003e\\\\u003cli\\\\u003e\\\\u003cstrong\\\\u003eSavuriista-tuorejuustokeitto\\\\u003c\\\/strong\\\\u003e (G,L,K,SE,SITRUS)\\\\u003c\\\/li\\\\u003e\\\\u003c\\\/ul\\\\u003e\\\\u003cul\\\\u003e\\\\u003cli\\\\u003e\\\\u003cstrong\\\\u003eMarjarahka\\\\u003c\\\/strong\\\\u003e (G,L,K)\\\\u003c\\\/li\\\\u003e\\\\u003c\\\/ul\\\\u003e\\\",\\\"categories\\\":[]}]}}, \\\"responseDetails\\\": null, \\\"responseStatus\\\": 200})\"}";
            deferred.resolve(sample);
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
        connect: function (id,appname) {
            $log.info("Connecting to " + id);
            var deferred = $q.defer();

            connect(id, deferred, appname);
            return deferred.promise;
        },
        fetch: function (id, channel, data) {

            return fetch(id, channel, data);
 
        },
        isConnected: function (id) {
            return SASocket[id] != null;
        },
        listen: function (id, callback) {
            receiveCallbacks[id] = callback;
        }
    }

}



AndroidServiceModule
    .service('webapisService', ['$log', '$q', function ($log, $q) {

            return {
                sa: function (id, success, error) {
                    var deferred = $q.defer()
                    if (typeof webapis == 'undefined') {
                        $q.reject("No Samsung Service");
                    }
                    return webapis.sa;
                },
                hasWebapis: function() {
                    return typeof webapis != 'undefined';
                }
            }

        }]
    )
    .service('AndroidService', ['$log', "$q", "webapisService", function ($log, $q, webapis) {
        return new AndroidService($log, $q, webapis);
    }]);