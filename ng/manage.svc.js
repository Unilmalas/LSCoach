'use strict';

// manage services
angular.module('app')
.service('ManageService', [ '$http', function ($http) {
	
  this.fetch = function (persid) {
    //return $http.get('/api/intell');
	return $http({
		url: '/api/intell/pid',
		method: "GET",
		params: { _id: persid }
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