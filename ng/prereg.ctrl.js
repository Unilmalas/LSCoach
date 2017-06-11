// prereq user controller
'use strict';
angular.module('app')
.controller('PreRegCtrl', function ($scope, UserSvc) {
	
  $scope.prereg = function (username, uemail) {
	// e-mail validation
	var emailRegex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
	if (emailRegex.test(uemail)) { // test if e-mail format ok
		UserSvc.prereg(username, uemail) // call preregister in UserSvc service
		.then(function (response) {
			//$scope.$emit('login', response.data); // pass event up to to ApplicationCtrl
			//$location.path('/');
		});
	} else console.log('Please enter a valid e-mail address.');
  }
});
