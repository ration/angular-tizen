var app = angular.module("TizenHttp",['AngularTizen']);
app.config(['$httpProvider', function configHttp($httpProvider) {
  //  $httpProvider.interceptors.push('TizenHttpRelay');
}]).config(['TizenHttpRelayProvider', function (relay) {
    relay.autoConnect(true);
}]);