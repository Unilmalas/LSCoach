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
   
   function isNumeric(n) {
		return !isNaN(parseFloat(n)) && isFinite(n);
   }

   // initial load of persons
   if ($scope.isAuth) { // authorized?
	   HomeService.fetch( $scope.currentUser.username ) // fetch only persons for current user
	   .then(function (persons) {
			//console.log('fetch in HomeCtrl: ' + JSON.stringify(persons));
			$scope.myPers = null; // inits person
			$scope.persons.data = persons.data; // to be shown in persons list
			var maxinterdays = 100000; // set to practical infinity 274 yrs ;)
			if ( isNumeric( $scope.intertime ) ) maxinterdays = $scope.intertime * 30; // if max inter time (in months!) set take that
			// ONLY FOR TEST: DAYS!!!!! REMOVE ONCE WORKING !!!!!
			//console.log(" home ctrl intertime " + $scope.intertime);
			if ( isNumeric( $scope.intertime ) ) maxinterdays = $scope.intertime; 
			// REMOVE END
			// calculate days since last interaction
			var plen = persons.data.length;
			//console.log('plen: ' + plen);
			var today = new Date();
			var oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
			var diffDays = 0;
			for (var i=0; i<plen; i++) {
				var lastinterdate = new Date(persons.data[i].datelastint);
				//console.log('person intdate: ' + persons.data[i].datelastint + ' for person ' + i);
				// calculate difference in days from today to date of last interaction
				diffDays = Math.round(Math.abs((today.getTime() - lastinterdate.getTime())/(oneDay)));
				if ( diffDays <= maxinterdays ) // interaction inside desired time horizon?
					$scope.persons.data[i].diffDays = Math.round(Math.abs((today.getTime() - lastinterdate.getTime())/(oneDay)));
				else
					$scope.persons.data[i].diffDays = 'beyond';
				// add interaction and observation to persons.data
				$scope.persons.data[i].observation = '';
				$scope.persons.data[i].interaction = '';
				//console.log('fetch[' + i + ']: ' + JSON.stringify($scope.persons.data[i]));
			}
	   });
   }
  
  $scope.setPers = function (index) {
	  $scope.persIndex = index;
  };
  
  $scope.subInter = function (motiv, index) {
	if ($scope.isAuth) { // authorized?
	  //console.log('HomeCtrl persid ' + index + ' pers ' + JSON.stringify($scope.persons.data[index]));
	  //console.log('HomeCtrl interaction ' + $scope.persons.data[index].interaction + ' ccc ' + $scope.persons.data[index]._id);
	  HomeService.subInter({
		  username:			$scope.currentUser.username,
		  _person:			$scope.persons.data[index]._id, // note: persons.data property holds the actual data of the $http response
		  interaction: 		$scope.persons.data[index].interaction,
		  observation: 		$scope.persons.data[index].observation,
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
  
  $scope.managePers = function (index) {
	if ($scope.isAuth) { // authorized?
	  // manage person just clicked
	  var persid = $scope.persons.data[index]._id; // person data property holds data of $http-response
	  //console.log('managePers: person id: ' + persid + ' at index: ' + index + ' is ' + $scope.persons.data[index].firstname);
	  $location.path("/manage/" + persid + /username/ + $scope.currentUser.username); // link to manage person page
	  // in the router this is then .when('/inter/:persid',...) which can be accessed via var persid = $routeParams.persid;
	} else {
		console.log('You are not authenticated');
	}
  };
  
  $scope.showInteractions = function (index) {
	if ($scope.isAuth) { // authorized?
	  // show interactions for person just clicked
	  var _person = $scope.persons.data[index]._id; // person data property holds data of $http-response
	  //console.log('showInter person id: ' + _person + ' at index: ' + index + ' is ' + $scope.persons.data[index].firstname);
	  //$location.path("/inter/").search({persid: _person}); // this produces: /inter/?persid=_person
	  $location.path("/inter/" + _person + /username/ + $scope.currentUser.username); // this is working now, maybe add user?
	  // in the router this is then .when('/inter/:persid',...) which can be accessed via var persid = $routeParams.persid;
	} else {
		console.log('You are not authenticated');
	}
  };

}]);