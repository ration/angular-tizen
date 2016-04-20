'use strict';

describe('Service: TizenHttpRelay', function () {

    // load the service's module
    beforeEach(module('TizenHttp'));

    // instantiate service
    var TizenHttpRelay;
    beforeEach(inject(function (_TizenHttpRelay_) {
        TizenHttpRelay = _TizenHttpRelay_;
    }));

    it('Should be able to instantiate TizenHttpRelay', function () {
        expect(!!TizenHttpRelay).toBe(true);
    });

    it("convert requests readily", function () {
        var method = "GET";
        var headers = {};
        var url = "/";
        var data = null;
        var headers = {};
        var answer = TizenHttpRelay.convertToRawHttpRequest(method, url, data, headers);
        expect(answer).toBe("GET / HTTP/1.1\r\n\r\n");
        url = "/foo/bar?lol";
        answer = TizenHttpRelay.convertToRawHttpRequest(method, url, data, headers);
        expect(answer).toBe("GET " + url + " HTTP/1.1\r\n\r\n");
        headers["key"] = "value";
        answer = TizenHttpRelay.convertToRawHttpRequest(method, url, data, headers);
        expect(answer).toBe("GET " + url + " HTTP/1.1\r\nkey: value\r\n\r\n");

    });

});
