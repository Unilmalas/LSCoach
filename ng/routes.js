// routes
angular.module('app') // getter
.config(['$routeProvider', function ($routeProvider) {
  $routeProvider 	// each route has a controller and a template associated with it
	.when('/',         { controller: 'HomeCtrl', templateUrl: '/templates/home.html' })  // html-files are loaded on demand
	.when('/inter/:persid/username/:username', { controller: 'InterCtrl', templateUrl: '/templates/inter.html' }) // show interactions for a person
	//.when('/register', { controller: 'RegisterCtrl', templateUrl: '/templates/register.html' }) // register user
	.when('/prereg', { controller: 'PreRegCtrl', templateUrl: '/templates/prereg.html' }) // preregistration of user till conf
	.when('/confreg', { controller: 'ConfRegCtrl', templateUrl: '/templates/confreg.html' }) // confirm user registration
	.when('/confmail', { controller: 'ConfMailCtrl', templateUrl: '/templates/confreg.html' }) // confirm user from e-mail
	.when('/login',    { controller: 'LoginCtrl', templateUrl: '/templates/login.html' })
	.when('/logout',	 { controller: 'LogoutCtrl', templateUrl: '/templates/logout.html' })
	.when('/manage/:persid/username/:username',	 { controller: 'ManageCtrl', templateUrl: '/templates/manage.html' })
	.when('/manage',	 { controller: 'ManageCtrl', templateUrl: '/templates/manage.html' })
	// routes like /color/:color/largecode/:largecode*\ will match /color/brown/largecode/code/with/slashes
	// and extract: color: brown largecode: code/with/slashes and stored in $routeParams under the given name
	.otherwise(			{ redirectTo: '/' }); // home page (should I put this into templates too...?)
  //$locationProvider.html5Mode(true);
}]);