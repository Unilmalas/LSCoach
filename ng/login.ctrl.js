// login controller
angular.module('app')
.controller('LoginCtrl', function ($scope, UserSvc) {
	
  $scope.userPWWrong = false; // flag set to true if user or pw wrong
	
  $scope.login = function (username, password) {
    UserSvc.login(username, password)
    .then(function (response) {
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
});