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
		.then(function (user) {
			//console.log('confmail ' + JSON.stringify(user.data));
			$scope.user = user.data; // getting username back
	});
	
	$scope.confreg = function (username, password) {
		var email = $routeParams.email;
		//console.log('ctrl confreg ' + username + ' pw ' + password + ' uemail ' + email);
		UserSvc.confreg(username, password, email) // call confregister in UserSvc service
			.then(function (response) {
			$scope.$emit('login', response.data); // pass event up to to ApplicationCtrl
			//$location.path('/');
		});
	}
  
}]);
