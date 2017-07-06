// routes
angular.module('app') // getter
.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
  $routeProvider 	// each route has a controller and a template associated with it
    .when('/',         { controller: 'LandingCtrl', templateUrl: '/templates/landing.html' })  // html-files are loaded on demand
	.when('/home',         { controller: 'HomeCtrl', templateUrl: '/templates/home.html' })  // html-files are loaded on demand
	.when('/inter/:persid/username/:username', { controller: 'InterCtrl', templateUrl: '/templates/inter.html' }) // show interactions for a person
	//.when('/register', { controller: 'RegisterCtrl', templateUrl: '/templates/register.html' }) // register user
	.when('/prereg', { controller: 'PreRegCtrl', templateUrl: '/templates/prereg.html' }) // preregistration of user till conf
	//.when('/confreg', { controller: 'ConfRegCtrl', templateUrl: '/templates/confreg.html' }) // confirm user registration
	.when('/confmail/email/:email/token/:token', { controller: 'ConfMailCtrl', templateUrl: '/templates/confreg.html' }) // confirm user from e-mail
	//.when('/confmail', { controller: 'ConfMailCtrl', templateUrl: '/templates/confreg.html' }) // confirm user from e-mail
	.when('/login',    { controller: 'LoginCtrl', templateUrl: '/templates/login.html' })
	.when('/logout',	 { controller: 'LogoutCtrl', templateUrl: '/templates/logout.html' })
	.when('/manage/:persid/username/:username',	 { controller: 'ManageCtrl', templateUrl: '/templates/manage.html' })
	.when('/manage',	 { controller: 'ManageCtrl', templateUrl: '/templates/manage.html' })
	.when('/settings',	 { controller: 'SettingsCtrl', templateUrl: '/templates/settings.html' })
	.when('/insights',	 { controller: 'InsightsCtrl', templateUrl: '/templates/insights.html' })
	.when('/pwforgotten/username/:username',	 { controller: 'PWresCtrl', templateUrl: '/templates/pwreset.html' })
	// routes like /color/:color/largecode/:largecode*\ will match /color/brown/largecode/code/with/slashes
	// and extract: color: brown largecode: code/with/slashes and stored in $routeParams under the given name
	//.otherwise(			{ redirectTo: '/' }); // home page (should I put this into templates too...?)
	/*.otherwise(		{
		templateUrl: function(params) {
			console.log('otherwise in routes.js hit: ' + params);
			redirectTo: '/';
		}
	});*/
	.otherwise(			{ redirectTo: function(params, currentPath) {
	  //console.log('otherwise hit: ' + currentPath); // log the path that gets redirected to default
	  return '/';
	}});
  //$locationProvider.html5Mode(true);
  // AngularJS 1.6 has changed the default for hash-bang urls in the  $location service
  // see https://stackoverflow.com/questions/41272314/angular-all-slashes-in-url-changed-to-2f
  $locationProvider.hashPrefix('');								// revert to previous behavior
}]);

/*angular.module('app') // getter
.run([
  '$rootScope',
  function($rootScope) {
    // see what's going on when the route tries to change
    $rootScope.$on('$routeChangeStart', function(event, next, current) {
      // next is an object that is the route that we are starting to go to
      // current is an object that is the route where we are currently
      var currentPath = current.originalPath;
      var nextPath = next.originalPath;

      console.log('Starting to leave %s to go to %s', currentPath, nextPath);
	  console.log(document.URL);
    });
  }
]);*/