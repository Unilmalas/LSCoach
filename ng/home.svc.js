'use strict';

// home services
angular.module('app')
.service('HomeService', [ '$http', function ($http) {
	
  this.fetch = function ( user ) {
    //return $http.get('/api/intell');
	return $http({
		url: '/api/intell',
		method: "GET",
		params: { username: user }
	});
  };
  
  this.findInterforPers = function ( pers, user ) {
	return $http({ // try interaction search by id from person
		url: '/api/intell/person_id',
		method: "GET",
		params: { _id: pers._id, username: user }
	});
  };
  
  this.subInter = function ( inter ) {
	//console.log(inter);
    return $http.post('/api/intell/int', inter);
  };
  
}]);