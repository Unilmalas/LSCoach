// prereq user controller
'use strict';
angular.module('app')
.controller('PreRegCtrl', function ($scope, UserSvc) {
	
  $scope.userExists = false; // flag set to true if user exists
	
  $scope.prereg = function (username, uemail) {
	// e-mail validation
	var emailRegex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
	if (emailRegex.test(uemail)) { // test if e-mail format ok
		UserSvc.prereg(username, uemail) // call preregister in UserSvc service
		.then(function (response) {
			if (response.status == '409') {
				//console.log('user ' + response.config.data.username + ' already exists.');
				$scope.userExists = true; // flag set to true if user exists
			}
			//console.log('prereg response: ' + JSON.stringify(response));
			//$scope.$emit('login', response.data); // pass event up to to ApplicationCtrl
			//$location.path('/');
		});
	} else console.log('Please enter a valid e-mail address.');
  }
});
