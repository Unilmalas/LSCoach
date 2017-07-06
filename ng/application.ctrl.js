// application controller
angular.module('app') // getter
.controller('ApplicationCtrl', function ($scope, UserSvc) {
//.controller('ApplicationCtrl', [ '$scope', ApplicationCtrl($scope, UserSvc)]);

//function ApplicationCtrl($scope, UserSvc) {
    /*if (!$scope.isAuth){
        $location.path('/login');
    } else {
        $location.path('/');
    }*/

	$scope.$on('login', function (_, user) { // receives $emit; _=ignore this binding/parameter
		$scope.currentUser = user;
		$scope.isAuth = true;
		$scope.intertime = user.intertime;
		//console.log("AppCtrl on: " + user.intertime);
		if ( user.admin ) $scope.isAdmin = true; // set admin flag if user has admin status
	});

	$scope.$on('inttime', function (_, intertime) { // receives $emit; _=ignore this binding/parameter
		$scope.intertime = intertime;
		//console.log("AppCtrl on: " + user.intertime);
	});
	
	$scope.logout = function(){
        $scope.currentUser = null;
        //$location.path('/login');
        UserSvc.removeToken();
        $scope.isAuth = false;
    }
});
//}