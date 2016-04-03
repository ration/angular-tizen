'use strict';

describe('Service: androidService', function () {

    var rootScope;
    var $q;
    var deferred;
    var peerCallBack;
    var connectionCallBack;
    var socketListener;
    var dataReceivedCallback;
    var socketStatusCallback;
    var agent = {
        id: "myAgent",
        setPeerAgentFindListener: function (callback) {
            peerCallBack = callback;
            var peerAgent = {
                appName: "TizenHttpRelay"
            }
            peerCallBack.onpeeragentfound(peerAgent);
        },
        findPeerAgents: function () {
        },
        setServiceConnectionListener: function (callback) {
            socketListener = callback;
            socketListener.onconnect(socket);
        }
    }
    var socket = {
        sendData: function (id, data) {

        },
        setSocketStatusListener: function (callback) {
            socketStatusCallback = callback;
        },
        setDataReceiveListener: function (callback, id) {
            dataReceivedCallback = callback;
        },
        disconnect: function () {
        },
        close: function () {
        }
    }
    var sockets = [socket];
    var agents = [agent];
    var mockSA = {
        sa: function () {
            return {
                requestSAAgent: function (callback) {
                    return callback(agents);
                }
            }
        },
        hasWebapis: function () {
            return true;
        }


    }

    // instantiate service
    var androidService;

    var $log;

    // load the service's module
    beforeEach(module('TizenHttp'));

    beforeEach(function () {
        module(function ($provide) {
            $provide.value('webapisService', mockSA);
        });
    })

    // Inject the $log service
    beforeEach(inject(function (_$log_) {
        $log = _$log_;
    }));

    // Log debug messages in Karma
    afterEach(function () {
        console.log($log.debug.logs);
    });


    beforeEach(inject(function (_androidService_, _$q_, _$rootScope_) {
        //    $q = _$q_;
        // deferred = $q.defer();
        androidService = _androidService_;
        rootScope = _$rootScope_;


    }));


    it('connects', function () {
        // deferred.resolve("OK");
        //spyOn(androidService, 'connect').and.returnValue(deferred.promise);
        var c = null;
        androidService.connect(agent.id)
            .then(function (success) {
                c = success;
            }, function (err) {
                c = err;
                fail(err);
            });

        rootScope.$apply();
        expect(c).toBe("OK")
    });

    it("fetches given data", function () {

        spyOn(socket, "sendData").and.callFake(function (id, data) {
            dataReceivedCallback(agent.id, "RESPONSE");
        });
        androidService.connect(agent.id)
            .then(function (success) {
            }, function (err) {
                fail(err);
            });

        rootScope.$apply();

        var ans = "";
        androidService.fetch(agent.id, "hello").then(function (response) {
            ans = response;
        }, function (err) {
            fail(err);
        });
        rootScope.$apply();
        expect(ans).toBe("RESPONSE");


    });
    it("notifies on disconnect", function () {
        androidService.connect(agent.id);
        rootScope.$apply();
        expect(androidService.isConnected(agent.id)).toBe(true);


        socketStatusCallback("DISCONNECT");
        expect(androidService.isConnected(agent.id)).toBe(false);
    });

    it("uses callback for random data receive, when there is no promise", function () {
        androidService.connect(agent.id);
        rootScope.$apply();
        var called = false;
        androidService.listen(agent.id, function () {
            called = true;
        })
        dataReceivedCallback(agent.id, "RESPONSE");

        expect(called).toBe(true);
    });

    afterEach(function () {
        rootScope.$apply();
    });

});