'use strict';

// user settings services
angular.module('app')
.service('SettingsService', [ '$http', function ($http) {
	
  this.fetch = function ( username ) {
    //return $http.get('/api/settings');
	return $http({
		url: '/api/settings',
		method: "GET",
		params: { username: username }
	});
  };
  
  this.updUser = function ( user ) {
    return $http.post('/api/settings/upduser', user);
  };
  
}]);