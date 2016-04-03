'use strict';

describe('Service: TizenHttpRelay', function () {

  // load the service's module
  beforeEach(module('TizenHttp'));

  // instantiate service
  var TizenHttpRelay;
  beforeEach(inject(function (_TizenHttpRelay_) {
    TizenHttpRelay = _TizenHttpRelay_;
  }));

  it('should do something', function () {
    expect(!!TizenHttpRelay).toBe(true);
  });

});
