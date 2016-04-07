var app = angular.module("TizenHttp",[]);
app.config(['$httpProvider', function configHttp($httpProvider) {
  //  $httpProvider.interceptors.push('TizenHttpRelay');
}]);