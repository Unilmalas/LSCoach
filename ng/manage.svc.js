'use strict';

// manage services
angular.module('app')
.service('ManageService', [ '$http', function ($http) {
	
  this.fetch = function ( persid, username ) {
    //return $http.get('/api/intell');
	return $http({
		url: '/api/intell/pid',
		method: "GET",
		params: { _id: persid, username: username }
	});
  };
  
  this.addPers = function (pers) {
    return $http.post('/api/intell/addpers', pers);
  };
  
  this.updPers = function (pers) {
    return $http.post('/api/intell/updpers', pers);
  };
  
  this.delPers = function (pers) {
    return $http.post('/api/intell/delpers', pers);
  };
  
}]);