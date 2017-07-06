// login controller
angular.module('app')
.controller('PWresCtrl', ['UserSvc', '$scope', '$routeParams','$location', function (UserSvc, $scope, $routeParams, $location) {

  $scope.username = $routeParams.username;
  
  $scope.recoverPW = function ( username ) {
	UserSvc.pwreset( username )
	.then( function ( response ) {
		//console.log('recover PW ' + JSON.stringify(response));
	});
  }
  
}]);