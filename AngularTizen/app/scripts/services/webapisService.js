/** Interface to SAconns[id].
 * @ngdoc service
 * @name scoreitApp.samsungService
 * @description
 * # dataService
 * Service in the scoreitApp.
 */
angular.module('TizenHttp')
    .service('webapisService', ['$log', "$q", function ($log, $q) {

            var agents = {}
            var agents = {}
            var courseChannel = "/scoreit/course";

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