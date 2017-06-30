'use strict';

// Landing controller
angular.module('app')
.controller('LandingCtrl', ['LandingService', '$scope', '$location', function (LandingService, $scope, $location) {
// see https://stackoverflow.com/questions/19957280/angularjs-best-practices-for-module-declaration for best practices on module declaration
  
  $scope.goHome = function () {
	$location.path("/home"); // go to home screen
	// in the router this is then .when('/inter/:persid',...) which can be accessed via var persid = $routeParams.persid;
  };

}]);