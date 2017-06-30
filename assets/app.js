angular.module('app', [
	'ngRoute'
]); // setter - called only once before getters
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
		if ( user.admin ) $scope.isAdmin = true; // set admin flag if user has admin status
	});
	
	$scope.logout = function(){
        $scope.currentUser = null;
        //$location.path('/login');
        UserSvc.removeToken();
        $scope.isAuth = false;
    }
});
//}
// confreq user controller
'use strict';
angular.module('app')
.controller('ConfRegCtrl', function ($scope, UserSvc) {
})

.controller('ConfMailCtrl', ['$scope','$routeParams', 'UserSvc', function ($scope, $routeParams, UserSvc) {
	var uemail = $routeParams.email; // user e-mail and confirmation token are passed as parameters in the GET-request
	var etoken = $routeParams.token;
	//console.log('confmailctrl hit ' + uemail + ' ' + etoken);
	UserSvc.confmail(uemail, etoken) // call confmail in UserSvc service
		.then(function (user) {
			//console.log('confmail ' + JSON.stringify(user.data));
			$scope.user = user.data; // getting username back
	});
	
	$scope.confreg = function (username, password) {
		console.log('ctrl confreg ' + username + ' pw ' + password);
		UserSvc.confreg(username, password) // call confregister in UserSvc service
			.then(function (response) {
			$scope.$emit('login', response.data); // pass event up to to ApplicationCtrl
			//$location.path('/');
		});
	}
  
}]);

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
   if ($scope.isAuth) { // authorized?
	   HomeService.fetch( $scope.currentUser.username ) // fetch only persons for current user
	   .then(function (persons) {
			//console.log('fetch in HomeCtrl: ' + JSON.stringify(persons));
			$scope.myPers = null; // inits person
			$scope.persons.data = persons.data; // to be shown in persons list
			
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
'use strict';

// home services
angular.module('app')
.service('HomeService', [ '$http', function ($http) {
	
  this.fetch = function ( user ) {
    //return $http.get('/api/intell');
	return $http({
		url: '/api/intell',
		method: "GET",
		params: { username: user }
	});
  };
  
  this.findInterforPers = function ( pers, user ) {
	return $http({ // try interaction search by id from person
		url: '/api/intell/person_id',
		method: "GET",
		params: { _id: pers._id, username: user }
	});
  };
  
  this.subInter = function ( inter ) {
	//console.log(inter);
    return $http.post('/api/intell/int', inter);
  };
  
}]);
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
'use strict';

// interaction services
angular.module('app')
.service('InterService', [ '$http', function ($http) {

  this.fetch = function ( persid, username ) {
    return $http({ // fetch interactions for given persid
		url: '/api/intell/inter_id',
		method: "GET",
		params: { _id: persid, username: username }
	});
  };
  
}]);
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
'use strict';

// landing services
angular.module('app')
.service('LandingService', [ '$http', function ($http) {
  
}]);
// login controller
angular.module('app')
.controller('LoginCtrl', function ($scope, UserSvc) {
	
  $scope.userPWWrong = false; // flag set to true if user or pw wrong
	
  $scope.login = function (username, password) {
    UserSvc.login(username, password)
    .then(function (response) {
		//console.log('login ' + JSON.stringify(response));
		if (response.status == '401') {
			$scope.userPWWrong = true; // flag set to true if user or pw wrong
		} else {
			//console.log(user);
			$scope.$emit('login', response.data); // pass event up to to ApplicationCtrl
			//$location.path('/');
		}
    });
  }
});
// logout controller
angular.module('app')
.controller('LogoutCtrl', function ($scope, UserSvc) {
	
  $scope.logout = function () {
		delete $scope.currentUser;
		$scope.$emit('logout'); // pass event up to to ApplicationCtrl
  }
});
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
'use strict';

// manage services
angular.module('app')
.service('ManageService', [ '$http', function ($http) {
	
  this.fetch = function ( persid, username ) {
    //return $http.get('/api/intell');
	return $http({
		url: '/api/intell/pid',
		method: "GET",
		params: { _id: persid, username: username }
	});
  };
  
  this.addPers = function (pers) {
    return $http.post('/api/intell/addpers', pers);
  };
  
  this.updPers = function (pers) {
    return $http.post('/api/intell/updpers', pers);
  };
  
  this.delPers = function (pers) {
    return $http.post('/api/intell/delpers', pers);
  };
  
}]);
// prereq user controller
'use strict';
angular.module('app')
.controller('PreRegCtrl', function ($scope, UserSvc) {
	
  $scope.userExists = false; // flag set to true if user exists
	
  $scope.prereg = function (username, uemail) {
	// e-mail validation
	var emailRegex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
	if (emailRegex.test(uemail)) { // test if e-mail format ok
		UserSvc.prereg(username, uemail) // call preregister in UserSvc service
		.then(function (response) {
			if (response.status == '409') {
				//console.log('user ' + response.config.data.username + ' already exists.');
				$scope.userExists = true; // flag set to true if user exists
			}
			//console.log('prereg response: ' + JSON.stringify(response));
			//$scope.$emit('login', response.data); // pass event up to to ApplicationCtrl
			//$location.path('/');
		});
	} else console.log('Please enter a valid e-mail address.');
  }
});

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
// services for user admin
'use strict';
angular.module('app')
.service('UserSvc', function ($http) {
  var svc = this;
  
  svc.getUser = function () {
    return $http.get('/api/users'); // get the logged-in users information
  }
  
  svc.login = function (username, password) {
    return $http.post('/api/sessions', { // get a JWT coming back from the sessions/post
      username: username,
	  password: password
	}).then(function (val) {
	  //console.log('user svc login: ' + val);
	  svc.token = val.data;
	  $http.defaults.headers.common['X-Auth'] = val.data;
      return svc.getUser();
    }, function errorCallback(response) {
		// called asynchronously if an error occurs
		// or server returns response with an error status.
		return response; // no login!
	});
  }
  
  svc.register = function (username, password) {	
	return $http.post('/api/users', { // create a user
		username: username,
		password: password
	}).then(function () {
		return svc.login(username, password);
	});
  }
  
  svc.removeToken = function () { // for logout
	$http.defaults.headers.common['X-Auth'] = "";
  }
  
  svc.prereg = function (username, uemail) {	
	//console.log('prereg user called frum user svc: ' + username);
	return $http.post('/api/users/prereg', { // create a user temporarily
		username: username,
		uemail: uemail
	}).then(function (response) {
		return response; // no login!
	}, function errorCallback(response) {
		// called asynchronously if an error occurs
		// or server returns response with an error status.
		return response; // no login!
	});
  }

  svc.confmail = function (uemail, etoken) {
	return $http({ // try account search by zip
		url: '/api/users/confmail',
		method: "GET",
		params: { uemail: uemail, etoken: etoken }
	});
  }
  
  svc.confreg = function (username, password) {	
	console.log('service confreg ' + username + ' pw ' + password);
	return $http.post('/api/users/confreg', { // finalize user creation
		username: username,
		password: password
	}).then(function () {
		return svc.login(username, password);
	});
  }

});