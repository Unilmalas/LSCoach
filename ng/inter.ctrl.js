'use strict';

// Interaction controller
angular.module('app')
.controller('InterCtrl', ['InterService', '$scope', '$routeParams', function (InterService, $scope, $routeParams) {
  
  // retrieve list of interactions for this person from the api and show it in the table
  var persid = $routeParams.persid;
  var username = $routeParams.username;
  // initial load of interactions
  InterService.fetch( persid, username )
  .then(function (interactions) {
	  $scope.interactions = interactions; // to be shown in interactions list
	  var ilen = $scope.interactions.data.length;
	  for (var i=0; i<ilen; i++) {
		  var date =  new Date($scope.interactions.data[i].date);
		  $scope.interactions.data[i].datestr = date.toDateString();
	  }
	  //console.log(JSON.stringify(interactions.data));
  });
  
}]);