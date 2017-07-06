// services for user admin
'use strict';
angular.module('app')
.service('UserSvc', function ($http) {
  var svc = this;
  
  svc.getUser = function () {
    return $http.get('/api/users'); // get the logged-in users information
  }
  
  svc.login = function (username, password) { // login user
    return $http.post('/api/sessions', { // get a JWT coming back from the sessions/post
      username: username,
	  password: password
	}).then(function (val) {
	  //console.log('user svc login: ' + val);
	  svc.token = val.data;
	  $http.defaults.headers.common['X-Auth'] = val.data;
      return svc.getUser();
    }, function errorCallback(response) {
		// called asynchronously if an error occurs
		// or server returns response with an error status.
		return response; // no login!
	});
  }
  
  svc.register = function (username, password) { // register new user
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
  
  svc.prereg = function (username, uemail) { // preregister user
	//console.log('prereg user called frum user svc: ' + username);
	return $http.post('/api/users/prereg', { // create a user temporarily
		username: username,
		uemail: uemail
	}).then(function (response) {
		return response; // no login!
	}, function errorCallback(response) {
		// called asynchronously if an error occurs
		// or server returns response with an error status.
		return response; // no login!
	});
  }

  svc.confmail = function (uemail, etoken) { // send confirmation link via e-mail
	return $http({ // confirm registration (following the link from registration e-mail) (also for pw-reset)
		url: '/api/users/confmail',
		method: "GET",
		params: { uemail: uemail, etoken: etoken }
	});
  }
  
  svc.confreg = function (username, password, email) {	// confirm user registration (also used for pw reset)
	//console.log('service confreg ' + username + ' pw ' + password);
	return $http.post('/api/users/confreg', { // finalize user creation / pw reset
		username: username,
		password: password,
		email: email
	}).then(function () {
		return svc.login(username, password);
	});
  }
  
  svc.pwreset = function (username) { // reset password
	return $http.post('/api/users/pwreset', {
		username: username
	}).then(function (response) {
		return response; // no login!
	}, function errorCallback(response) {
		// called asynchronously if an error occurs
		// or server returns response with an error status.
		return response; // no login!
	});
  }

});