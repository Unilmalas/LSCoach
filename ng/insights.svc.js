'use strict';

// insights services
angular.module('app')
.service('InsightsService', [ '$http', function ($http) {
	
  this.getAllInteractions = function ( username ) {
    return $http({ // fetch interactions for given persid
		url: '/api/intell/inter_all',
		method: "GET",
		params: { username: username }
	});
  };
	 
}]);