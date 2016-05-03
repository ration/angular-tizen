/** Interface to SAconns[id].
 * @ngdoc service
 * @name scoreitApp.samsungService
 * @description
 * # dataService
 * Service in the TizenHttpRelay.
 */
angular.module('TizenHttp')
    .service('webapisService', ['$log', "$q", function ($log, $q) {

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
    );