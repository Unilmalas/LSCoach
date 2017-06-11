'use strict';

// Home controller
angular.module('app')
//.controller('HomeCtrl',	function ($scope, HomeService) {
//.controller('HomeCtrl', ['HomeService', '$scope', '$routeParams', function (HomeService, $scope, $routeParams) {
.controller('HomeCtrl', ['HomeService', '$scope', '$location', function (HomeService, $scope, $location) {
// see https://stackoverflow.com/questions/19957280/angularjs-best-practices-for-module-declaration for best practices on module declaration
   
   $scope.persons = [];
   $scope.person = {};
   $scope.inter = {};
   
   $scope.persIndex = 0;

   // initial load of persons
   HomeService.fetch()
   // HomeService.fetch( currentUser.username ) // fetch only persons for current user
   .then(function (persons) {
	    //console.log('fetch in HomeCtrl: ' + JSON.stringify(persons));
		$scope.myPers = null; // inits person
		$scope.persons = persons; // to be shown in persons list
		
		// calculate days since last interaction
		var plen = persons.data.length;
		//console.log('plen: ' + plen);
		var today = new Date();
		var oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
		var diffDays = 0;
		for (var i=0; i<plen; i++) {
			var lastinterdate = new Date(persons.data[i].datelastint);
			//console.log('person intdate: ' + persons.data[i].datelastint + ' for person ' + i);
			$scope.persons.data[i].diffDays = Math.round(Math.abs((today.getTime() - lastinterdate.getTime())/(oneDay)));
			// add interaction and observation to persons.data
			$scope.persons.data[i].observation = '';
			$scope.persons.data[i].interaction = '';
		}
   });
  
  $scope.setPers = function (index) {
	  $scope.persIndex = index;
  };
  
  $scope.subInter = function (motiv, persindex) {
	if ($scope.isAuth) { // authorized?
	  //console.log('HomeCtrl persid ' + persindex + ' pers ' + JSON.stringify($scope.persons.data[persindex]));
	  //console.log('HomeCtrl interaction ' + $scope.persons.data[persindex].interaction + ' ccc ' + $scope.persons.data[persindex]._id);
	  HomeService.subInter({
		  _person:			$scope.persons.data[persindex]._id, // note: persons.data property holds the actual data of the $http response
		  interaction: 		$scope.persons.data[persindex].interaction,
		  observation: 		$scope.persons.data[persindex].observation,
		  motivator:		'',
		  motivatordesc:	'',
		  motivatorpm: 		motiv
	  })
	  .then(function (inter) {
		console.log('interaction submitted');
	  });
	} else {
		console.log('You are not authenticated');
	}
  };
  
  $scope.managePers = function (persid) {
	if ($scope.isAuth) { // authorized?
	  // manage person just clicked
	  //console.log('person id: ' + persid);
	  $location.path("/manage/" + persid + /uid/ + currentUser.username); // link to manage person page
	  // in the router this is then .when('/inter/:persid',...) which can be accessed via var persid = $routeParams.persid;
	} else {
		console.log('You are not authenticated');
	}
  };
  
  $scope.showInteractions = function (index) {
	if ($scope.isAuth) { // authorized?
	  // show interactions for person just clicked
	  var _person = $scope.persons.data[index]._id; // person data property holds data of $http-response
	  //console.log('person id: ' + _person);
	  //$location.path("/inter/").search({persid: _person}); // this produces: /inter/?persid=_person
	  $location.path("/inter/" + _person + /uid/ + currentUser.username); // this is working now, maybe add user?
	  // in the router this is then .when('/inter/:persid',...) which can be accessed via var persid = $routeParams.persid;
	} else {
		console.log('You are not authenticated');
	}
  };

}]);