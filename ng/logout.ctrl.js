// logout controller
angular.module('app')
.controller('LogoutCtrl', function ($scope, UserSvc) {
	
  $scope.logout = function () {
		delete $scope.currentUser;
		$scope.$emit('logout'); // pass event up to to ApplicationCtrl
  }
});