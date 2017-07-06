// login controller
angular.module('app')
.controller('LoginCtrl', ['UserSvc', '$scope', '$routeParams','$location', function (UserSvc, $scope, $routeParams, $location) {
	
  $scope.userPWWrong = false; // flag set to true if user or pw wrong
	
  $scope.login = function (username, password) {
    UserSvc.login( username, password )
    .then( function ( response ) {
		//console.log('login ' + JSON.stringify(response));
		if (response.status == '401') {
			$scope.userPWWrong = true; // flag set to true if user or pw wrong
		} else {
			//console.log(user);
			$scope.$emit('login', response.data); // pass event up to to ApplicationCtrl
			//$location.path('/');
		}
    });
  }
  
  $scope.forgotPW = function ( username ) {
	$scope.user.username = username;
	//console.log("forgotPW: " + username);
	$location.path("/pwforgotten/username/" + username); // link to pw reset page
  }
  
}]);