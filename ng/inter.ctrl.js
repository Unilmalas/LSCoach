'use strict';

// Interaction controller
angular.module('app')
.controller('InterCtrl', ['InterService', '$scope', '$routeParams', function (InterService, $scope, $routeParams) {
  
  // retrieve list of interactions for this person from the api and show it in the table
  var persid = $routeParams.persid;
  var username = $routeParams.username;
  // initial load of interactions
  InterService.fetch(persid)
  //InterService.fetch(persid, username)
  .then(function (interactions) {
	  $scope.interactions = interactions; // to be shown in interactions list
	  //console.log(JSON.stringify(interactions.data));
  });
  
}]);