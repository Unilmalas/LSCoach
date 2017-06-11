// services for user admin
'use strict';
angular.module('app')
.service('UserSvc', function ($http) {
  var svc = this;
  
  svc.getUser = function () {
    return $http.get('/api/users'); // get the logged-in users information
  }
  
  svc.login = function (username, password) {
    return $http.post('/api/sessions', { // get a JWT coming back from the sessions/post
      username: username,
	  password: password
	}).then(function (val) {
	  svc.token = val.data;
	  $http.defaults.headers.common['X-Auth'] = val.data;
      return svc.getUser();
    });
  }
  
  svc.register = function (username, password) {	
	return $http.post('/api/users', { // create a user
		username: username,
		password: password
	}).then(function () {
		return svc.login(username, password);
	});
  }
  
  svc.removeToken = function () { // for logout
	$http.defaults.headers.common['X-Auth'] = "";
  }
  
  svc.prereg = function (username, uemail) {	
	return $http.post('/api/users/prereg', { // create a user temporarily
		username: username,
		uemail: uemail
	}).then(function () {
		return; // no login!
	});
  }

  svc.confmail = function (uemail, etoken) {
	return $http({ // try account search by zip
		url: '/api/users/confmail',
		method: "GET",
		params: { uemail: uemail, etoken: etoken }
	});
  }
  
  svc.confreg = function (username, password) {	
	//console.log('service confreg ' + username + ' pw ' + password);
	return $http.post('/api/users/confreg', { // finalize user creation
		username: username,
		password: password
	}).then(function () {
		return svc.login(username, password);
	});
  }

});