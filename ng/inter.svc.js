'use strict';

// interaction services
angular.module('app')
.service('InterService', [ '$http', function ($http) {

  this.fetch = function (persid) {
    return $http({ // fetch interactions for given persid
		url: '/api/intell/inter_id',
		method: "GET",
		params: { _id: persid }
	});
  };
  
}]);