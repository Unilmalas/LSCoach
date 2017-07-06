'use strict';

// User settings controller
angular.module('app')
//.controller('SettingsCtrl',	function ($scope, SettingsService) {
//.controller('SettingsCtrl', ['SettingsService', '$scope', '$routeParams', function (SettingsService, $scope, $routeParams) {
.controller('SettingsCtrl', ['SettingsService', '$scope', '$routeParams', '$location', function (SettingsService, $scope, $routeParams, $location) {
// see https://stackoverflow.com/questions/19957280/angularjs-best-practices-for-module-declaration for best practices on module declaration

   $scope.username = $routeParams.username;
   //console.log('ID: ' + $scope.persid);
	
   // initial load of user
   if ($scope.isAuth) { // authorized?
	   SettingsService.fetch( $scope.currentUser.username ) // fetch only current user
	   .then(function (user) {
			//console.log('fetch in SettingsCtrl: ' + JSON.stringify(user.data));
			$scope.user = user.data[0]; // fetch returns an array
			// do we need to blank the password? NO: select: false!
			//console.log('fetch in SettingsCtrl: ' + JSON.stringify($scope.user));
	   });
   }
  
  $scope.subSettings = function () {
    if ($scope.isAuth) {
	  //console.log('subSettings in SettingsCtrl: ' + JSON.stringify($scope.user));
	  SettingsService.updUser({
		username:		$scope.currentUser.username,
		company:    	$scope.user.company,
		email:	  		$scope.user.email,
		postinterq:		$scope.user.postinterq,
		intertime:		parseInt( $scope.user.intertime )
	  })
	  .then(function (user) {
		console.log('Settings ctrl: user updated');
		//$scope.intertime = parseInt( $scope.user.intertime );
		$scope.$emit('inttime', $scope.user.intertime); // pass event up to to ApplicationCtrl
		//console.log("settings ctrl: " + $scope.intertime);
	  });
    } else {
		console.log('You are not authenticated!');
	}
  };

}]);