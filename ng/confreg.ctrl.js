// confreq user controller
'use strict';
angular.module('app')
.controller('ConfRegCtrl', function ($scope, UserSvc) {
})

.controller('ConfMailCtrl', ['$scope','$routeParams', 'UserSvc', function ($scope, $routeParams, UserSvc) {
	var uemail = $routeParams.email; // user e-mail and confirmation token are passed as parameters in the GET-request
	var etoken = $routeParams.token;
	//console.log('confmailctrl hit ' + uemail + ' ' + etoken);
	UserSvc.confmail(uemail, etoken) // call confmail in UserSvc service
		.success(function (user) {
			$scope.username = user.username; // getting username back
	});
  
  	$scope.confreg = function (username, password) {
		//console.log('ctrl confreg ' + username + ' pw ' + password);
		UserSvc.confreg(username, password) // call confregister in UserSvc service
			.then(function (response) {
			$scope.$emit('login', response.data); // pass event up to to ApplicationCtrl
			//$location.path('/');
		});
	}
  
}]);
