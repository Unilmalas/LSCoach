'use strict';

// Manage controller
angular.module('app')
//.controller('ManageCtrl',	function ($scope, ManageService) {
//.controller('ManageCtrl', ['ManageService', '$scope', '$routeParams', function (ManageService, $scope, $routeParams) {
.controller('ManageCtrl', ['ManageService', '$scope', '$routeParams', '$location', function (ManageService, $scope, $routeParams, $location) {
// see https://stackoverflow.com/questions/19957280/angularjs-best-practices-for-module-declaration for best practices on module declaration

	$scope.persid = $routeParams.persid;
	$scope.username = $routeParams.username;
	//console.log('ID: ' + $scope.persid);
	
   // initial load of person
   ManageService.fetch( $scope.persid, $scope.currentUser.username )
   .then(function (person) {
	    //console.log('fetch in ManageCtrl: ' + JSON.stringify(person.data));
		//$scope.person = JSON.parse(JSON.stringify(person.data[0]));; // trick to deep-clone object
		$scope.person = person.data[0];
		//console.log(JSON.stringify($scope.person));
		//console.log($scope.person.firstname)
   });
  
  $scope.addPers = function () {
    if ($scope.isAuth) {
	  // need to check first if update was pressed even as its a new person
	  //console.log('add person: user: ' + $scope.currentUser.username);
	  if ( $scope.person._id != '' ) {
		  ManageService.updPers({
			_id:			$scope.person._id,
			username:		$scope.currentUser.username,
			firstname:    	$scope.person.firstname,
			lastname:	  	$scope.person.lastname,
			relationship:	$scope.person.relationship,
			description:	$scope.person.description
		  })
		  .then(function (pers) {
			console.log('person updated');
		  });
	  } else {
		  ManageService.addPers({
			username:		$scope.currentUser.username,
			firstname:    	$scope.person.firstname,
			lastname:	  	$scope.person.lastname,
			relationship:	$scope.person.relationship,
			description:	$scope.person.description
		  })
		  .then(function (pers) {
			console.log('person added');
		  });
	  }
    } else {
		console.log('You are not authenticated!');
	}
  };
  
  $scope.updatePers = function () {
    if ($scope.isAuth) {
	  if ( $scope.person._id != '' ) { // only if PID is set, otherwise add
		  ManageService.updPers({
			_id:			$scope.person._id,
			username:		$scope.currentUser.username,
			firstname:    	$scope.person.firstname,
			lastname:	  	$scope.person.lastname,
			relationship:	$scope.person.relationship,
			description:	$scope.person.description
		  })
		  .then(function (pers) {
			console.log('person updated');
		  });
	  } else {
		  ManageService.addPers({
			username:		$scope.currentUser.username,
			firstname:    	$scope.person.firstname,
			lastname:	  	$scope.person.lastname,
			relationship:	$scope.person.relationship,
			description:	$scope.person.description
		  })
		  .then(function (pers) {
			console.log('person added');
		  });
	  }
    } else {
		console.log('You are not authenticated!');
	}
  };
  
  $scope.deletePers = function () {
    if ($scope.isAuth) {
      ManageService.delPers({
		_id:			$scope.person._id,
		username:		$scope.currentUser.username,
        firstname:    	$scope.person.firstname,
		lastname:	  	$scope.person.lastname,
		relationship:	$scope.person.relationship,
		description:	$scope.person.description
      })
      .then(function (pers) {
		console.log('person deleted');
		$scope.person = {};
      });
    } else {
		console.log('You are not authenticated!');
	}
  };

}]);