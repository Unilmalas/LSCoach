angular.module('app', [
	'ngRoute', 'googlechart'
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
		var email = $routeParams.email;
		//console.log('ctrl confreg ' + username + ' pw ' + password + ' uemail ' + email);
		UserSvc.confreg(username, password, email) // call confregister in UserSvc service
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

// Insights controller
// how to integrate google charts into angular:
// https://stackoverflow.com/questions/14375728/how-to-integrate-google-charts-as-an-angularjs-directive
angular.module('app')
.controller('InsightsCtrl', ['InsightsService', '$scope', '$routeParams', function (InsightsService, $scope, $routeParams) {
	
	// retrieve list of interactions for this person from the api and show it in the table
	var username = $scope.currentUser.username;
	console.log("InsightsCtrl: " + JSON.stringify($scope.currentUser) + " : " + username);
	// initial load of all interactions for current user
	InsightsService.getAllInteractions( username )
	.then(function (interactions) {
		var datevals = [];
		var motivvals = [];
		var dayinmills = 1000 * 60 * 60 * 24;
		var ilen = interactions.data.length;
		for (var i=0; i<ilen; i++) {
			var date =  new Date(interactions.data[i].date);
			datevals[i] = ( date.getTime() - Date.now() ) / dayinmills;
			motivvals[i] = parseInt(interactions.data[i].motivatorpm);
		}
		
		var chart1 = {};
		//chart1.type = "ColumnChart";
		chart1.type = "ScatterChart";
		chart1.cssStyle = "height:80px; width:800px;";
		chart1.data = JSON.parse( fillChartData( datevals, motivvals, "time", "motivator" ) );

		chart1.options = {
			  "title": 'Interactions over time',
			  "hAxis": {title: 'time', minValue: 0, maxValue: 25},
			  "vAxis": {title: 'Motivator', minValue: -1, maxValue: 1},
			  "legend": 'none'
		};

		chart1.formatters = {};
		$scope.chart = chart1;
		
		
		console.log(JSON.stringify(interactions.data));
	});
	
	function fillChartData( xvals, yvals, xlbl, ylbl ) {
		if ( xvals.length != yvals.length ) return "";
		var jsonstr = '{"cols": [{"id": "' + xlbl + '", "label": "' + xlbl + '", "type": "number"}, {"id": "' + ylbl + '", "label": "' + ylbl + '", "type": "number"}], "rows": [';
		for ( var i=0; i<xvals.length; i++ ) {
			jsonstr += '{"c":[{"v": ' + xvals[i] + '}, {"v": ' + yvals[i] + '}, {"v":' + xvals[i] + '}]}';
			if ( (i+1) < xvals.length ) jsonstr += ', ';
		}
		jsonstr += ']}';
		return jsonstr;
	}
	
	// data format JSON: https://developers.google.com/chart/interactive/docs/reference#dataparam
	
    /*chart1.data = {
		"cols": [
			{id: "time", label: "time", type: "number"},
			{id: "motivator", label: "motivator", type: "number"}],
		"rows": [
			{c:[{v: 0}, {v: 1}, {v:'0'}]},
			{c:[{v: 1}, {v: 1}, {v:'1'}]},
			{c:[{v: 2}, {v: -1}, {v:'2'}]},
			{c:[{v: 3}, {v: 0}, {v:'3'}]},
			{c:[{v: 4}, {v: 1}, {v:'4'}]},
			{c:[{v: 5}, {v: 0}, {v:'5'}]}
		]
    };*/
	
    /*chart1.type = "ColumnChart";
    chart1.cssStyle = "height:200px; width:300px;";
    chart1.data = {"cols": [
        {id: "month", label: "Month", type: "string"},
        {id: "laptop-id", label: "Laptop", type: "number"},
        {id: "desktop-id", label: "Desktop", type: "number"},
        {id: "server-id", label: "Server", type: "number"},
        {id: "cost-id", label: "Shipping", type: "number"}
    ], "rows": [
        {c: [
            {v: "January"},
            {v: 19, f: "42 items"},
            {v: 12, f: "Ony 12 items"},
            {v: 7, f: "7 servers"},
            {v: 4}
        ]},
        {c: [
            {v: "February"},
            {v: 13},
            {v: 1, f: "1 unit (Out of stock this month)"},
            {v: 12},
            {v: 2}
        ]},
        {c: [
            {v: "March"},
            {v: 24},
            {v: 0},
            {v: 11},
            {v: 6}

        ]}
    ]};

    chart1.options = {
        "title": "Sales per month",
        "isStacked": "true",
        "fill": 20,
        "displayExactValues": true,
        "vAxis": {
            "title": "Sales unit", "gridlines": {"count": 6}
        },
        "hAxis": {
            "title": "Date"
        }
    }; */
  
}]);
'use strict';

// insights services
angular.module('app')
.service('InsightsService', [ '$http', function ($http) {
	
  this.getAllInteractions = function ( username ) {
    return $http({ // fetch interactions for given persid
		url: '/api/intell/inter_all',
		method: "GET",
		params: { username: username }
	});
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
.controller('LoginCtrl', ['UserSvc', '$scope', '$routeParams','$location', function (UserSvc, $scope, $routeParams, $location) {
	
  $scope.userPWWrong = false; // flag set to true if user or pw wrong
	
  $scope.login = function (username, password) {
    UserSvc.login( username, password )
    .then( function ( response ) {
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
  
  $scope.forgotPW = function ( username ) {
	$scope.user.username = username;
	//console.log("forgotPW: " + username);
	$location.path("/pwforgotten/username/" + username); // link to pw reset page
  }
  
}]);
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
/*! angular-google-chart 2017-04-16 */
/*
* @description Google Chart Api Directive Module for AngularJS
* @version 1.0.0-beta.1
* @author GitHub Contributors <https://github.com/angular-google-chart/angular-google-chart/graphs/contributors> 
* @license MIT
* @year 2013
*/
/* global angular */
(function(){
    angular.module('googlechart', [])
        .run(registerResizeEvent);
        
    registerResizeEvent.$inject = ['$rootScope', '$window'];
    
    function registerResizeEvent($rootScope, $window){
        angular.element($window).on('resize', function () {
                $rootScope.$emit('resizeMsg');
            });
    }
})();
/* global angular, google */
(function(){
    angular.module('googlechart')
        .factory('FormatManager', formatManagerFactory);
        
        function formatManagerFactory(){
            // Handles the processing of Google Charts API Formats
            function FormatManager($google){
                var self = this;
                var oldFormatTemplates = {};
                self.iFormats = {}; // Holds instances of formats (ie. self.iFormats.date[0] = new $google.visualization.DateFormat(params))
                self.applyFormats = applyFormats;
                
                // apply formats of type to datatable
                function apply(tFormats, dataTable){
                    var i, formatType;
                    for (formatType in tFormats){
                        if (tFormats.hasOwnProperty(formatType)){
                            for (i = 0; i < self.iFormats[formatType].length; i++) {
                                if (tFormats[formatType][i].columnNum < dataTable.getNumberOfColumns()) {
                                    self.iFormats[formatType][i].format(dataTable, tFormats[formatType][i].columnNum);
                                }
                            }
                        }
                    }
                }
                
                function applyFormat(formatType, FormatClass, tFormats){
                    var i;
                    if (angular.isArray(tFormats[formatType])) {
                        // basic change detection; no need to run if no changes
                        if (!angular.equals(tFormats[formatType], oldFormatTemplates[formatType])) {
                            oldFormatTemplates[formatType] = tFormats[formatType];
                            self.iFormats[formatType] = [];
            
                            if (formatType === 'color') {
                                instantiateColorFormatters(tFormats);
                            } else {
                                for (i = 0; i < tFormats[formatType].length; i++) {
                                    self.iFormats[formatType].push(new FormatClass(
                                        tFormats[formatType][i])
                                    );
                                }
                            }
                        }
                    }
                }
                
                function applyFormats(dataTable, tFormats, customFormatters) {
                    var formatType, FormatClass, requiresHtml = false;
                    if (!angular.isDefined(tFormats) || !angular.isDefined(dataTable)){
                        return { requiresHtml: false };
                    }
                    for (formatType in tFormats){
                        if (tFormats.hasOwnProperty(formatType)){
                            FormatClass = getFormatClass(formatType, customFormatters);
                            if (!angular.isFunction(FormatClass)){
                                // if no class constructor was returned,
                                // there's no point in completing cycle
                                continue;
                            }
                            applyFormat(formatType, FormatClass, tFormats);
                            
                            //Many formatters require HTML tags to display special formatting
                            if (formatType === 'arrow' || formatType === 'bar' || formatType === 'color') {
                                requiresHtml = true;
                            }
                        }
                    }
                    apply(tFormats, dataTable);
                    return { requiresHtml: requiresHtml };
                }
                
                function instantiateColorFormatters(tFormats){
                    var t, colorFormat, i, data, formatType = 'color';
                    for (t = 0; t < tFormats[formatType].length; t++) {
                        colorFormat = new $google.visualization.ColorFormat();

                        for (i = 0; i < tFormats[formatType][t].formats.length; i++) {
                            data = tFormats[formatType][t].formats[i];

                            if (typeof (data.fromBgColor) !== 'undefined' && typeof (data.toBgColor) !== 'undefined') {
                                colorFormat.addGradientRange(data.from, data.to, data.color, data.fromBgColor, data.toBgColor);
                            } else {
                                colorFormat.addRange(data.from, data.to, data.color, data.bgcolor);
                            }
                        }

                        self.iFormats[formatType].push(colorFormat);
                    }
                }
                
                function getFormatClass(formatType, customFormatters){
                    var className = formatType.charAt(0).toUpperCase() + formatType.slice(1).toLowerCase() + "Format";
                    if ($google.visualization.hasOwnProperty(className)){
                        return google.visualization[className];
                    } else if (angular.isDefined(customFormatters) && customFormatters.hasOwnProperty(formatType)) {
                        return customFormatters[formatType];
                    }
                    return;
                }
            }
            
            return FormatManager;
        }
})();
/* global angular, google */

(function() {

    angular.module('googlechart')
        .controller('GoogleChartController', GoogleChartController);

    GoogleChartController.$inject = ['$scope', '$element', '$attrs', '$injector', '$timeout', '$window', '$rootScope', 'GoogleChartService'];

    function GoogleChartController($scope, $element, $attrs, $injector, $timeout, $window, $rootScope, GoogleChartService) {
        var self = this;
        var resizeHandler;
        var googleChartService;

        init();

        function cleanup() {
            resizeHandler();
        }

        function draw() {
            if (!draw.triggered && (self.chart !== undefined)) {
                draw.triggered = true;
                $timeout(setupAndDraw, 0, true);
            }
            else if (self.chart !== undefined) {
                $timeout.cancel(draw.recallTimeout);
                draw.recallTimeout = $timeout(draw, 10);
            }
        }

        // Watch function calls this.
        function drawAsync() {
            googleChartService.getReadyPromise()
                .then(draw);
        }

        //setupAndDraw() calls this.
        function drawChartWrapper() {
            googleChartService.draw();
            draw.triggered = false;
        }

        function init() {
            // Instantiate service
            googleChartService = new GoogleChartService();
            
            self.registerChartListener = googleChartService.registerChartListener;
            self.registerWrapperListener = googleChartService.registerWrapperListener;
            self.registerServiceListener = googleChartService.registerServiceListener;
            
            /* Watches, to refresh the chart when its data, formatters, options, view,
            or type change. All other values intentionally disregarded to avoid double
            calls to the draw function. Please avoid making changes to these objects
            directly from this directive.*/
            $scope.$watch(watchValue, watchHandler, true); // true is for deep object equality checking

            // Redraw the chart if the window is resized
            resizeHandler = $rootScope.$on('resizeMsg', drawAsync);

            //Cleanup resize handler.
            $scope.$on('$destroy', cleanup);
        }

        function setupAndDraw() {
            googleChartService.setup($element,
            self.chart.type,
            self.chart.data,
            self.chart.view,
            self.chart.options,
            self.chart.formatters,
            self.chart.customFormatters);

            $timeout(drawChartWrapper);
        }

        function watchHandler() {
            self.chart = $scope.$eval($attrs.chart);
            drawAsync();
        }

        function watchValue() {
            var chartObject = $scope.$eval($attrs.chart);
            if (angular.isDefined(chartObject) && angular.isObject(chartObject)) {
                return {
                    customFormatters: chartObject.customFormatters,
                    data: chartObject.data,
                    formatters: chartObject.formatters,
                    options: chartObject.options,
                    type: chartObject.type,
                    view: chartObject.view
                };
            }
        }
    }
})();
/* global angular */
(function(){
    angular.module('googlechart')
        .directive('agcBeforeDraw', beforeDrawDirective);
        
    function beforeDrawDirective(){
        return {
            restrict: 'A',
            scope: false,
            require: 'googleChart',
            link: function(scope, element, attrs, googleChartController){
                callback.$inject=['chartWrapper'];
                function callback(chartWrapper){
                    scope.$apply(function (){
                        scope.$eval(attrs.agcBeforeDraw, {chartWrapper: chartWrapper});
                    });
                }
                googleChartController.registerServiceListener('beforeDraw', callback, this);
            }
        };
    }
})();

/* global angular */
(function() {
    angular.module('googlechart')
        .provider('agcGstaticLoader', agcGstaticLoaderProvider);

    function agcGstaticLoaderProvider(){
        var useBothLoaders = false;
        var version = "current";
        var options = {
            packages: ["corechart"]
        };

        /** Add Google Visualization API package to loader configuration. */
        this.addPackage = function(packageName){
            options.packages = options.packages || [];
            options.packages.push(packageName);

            if (needsBothLoaders())
                useBothLoaders = true;
            return this;
        };

        /** Delete key from underlying loader configuration. */
        this.clearOption = function(key){
            delete this._options[key];
            return this;
        };

        /** Remove Google Visualization API package from loader configuration. */
        this.removePackage = function(packageName){
            options.packages = this._options.packages || [];
            var index = options.packages.indexOf(packageName);
            if (index > -1)
                options.packages.splice(index, 1);
            return this;
        };

        /** Set option to value. See developers.google.com/chart/ for information about loader options. */
        this.setOption = function(key, value){
            options[key] = value;
            return this;
        };

        /** Sets underlying loader options object to value provided. Replaces everything, included packages. */
        this.setOptions = function(value){
            options = value;
            return this;
        };

        /** Set Google Visualization API frozen version to load. Default: 'current' */
        this.setVersion = function(value){
            version = value;
            if (needsBothLoaders())
                useBothLoaders = true;
            return this;
        };

        /** Override for internal setting to add both loader scripts. Required under certain conditions. */
        this.useBothLoaders = function(value){
            if (typeof value === 'undefined')
                value = true;

            useBothLoaders = !!value;
            return this;
        };

        /** Check if conditions are correct to need both JSAPI and gstatic loader scripts. */
        function needsBothLoaders(){
            var versionCheck, packageCheck;

            versionCheck = !isNaN(+version) && +version < 45;
            packageCheck = options.packages.indexOf("geochart") > -1 ||
                options.packages.indexOf("map") > -1;

            return versionCheck && packageCheck;
        }

        this.$get = function($rootScope, $q, agcScriptTagHelper){

            function scriptLoadCallback(){
                if (!google ||
                    !google.charts ||
                    typeof google.charts.setOnLoadCallback !== 'function'){
                    return $q.reject("Google charts library loader not present.");
                }
                
                var deferred = $q.defer();

                google.charts.load(version, options);

                google.charts.setOnLoadCallback(function(){
                    $rootScope.$apply(function(){
                        deferred.resolve(google);
                    });
                });

                return deferred.promise;
            }

            var tagPromise = agcScriptTagHelper("https://www.gstatic.com/charts/loader.js");
            if (useBothLoaders)
                tagPromise = tagPromise.then(function(){ return agcScriptTagHelper("https://www.google.com/jsapi");});
            var libraryPromise = tagPromise.then(scriptLoadCallback);

            return libraryPromise;
        };
        this.$get.$inject = ["$rootScope", "$q", "agcScriptTagHelper"];
    }
})();

/* global angular */
(function() {
    angular.module("googlechart")
        .factory("agcJsapiLoader", agcJsapiLoaderFactory);

    agcJsapiLoaderFactory.$inject = ["$log", "$rootScope", "$q", "agcScriptTagHelper", "googleChartApiConfig"];
    function agcJsapiLoaderFactory($log, $rootScope, $q, agcScriptTagHelper, googleChartApiConfig){
        $log.debug("[AGC] jsapi loader invoked.");
        var apiReady = $q.defer();
        // Massage configuration as needed.
        googleChartApiConfig.optionalSettings = googleChartApiConfig.optionalSettings || {};

        var userDefinedCallback = googleChartApiConfig.optionalSettings.callback;

        var settings = {
            callback: function() {
                if (angular.isFunction(userDefinedCallback))
                    userDefinedCallback.call(this);

                $rootScope.$apply(function(){
                    apiReady.resolve(google);
                });
            }
        };

        settings = angular.extend({}, googleChartApiConfig.optionalSettings, settings);

        $log.debug("[AGC] Calling tag helper...");
        agcScriptTagHelper("//www.google.com/jsapi")
            .then(function(){
                $log.debug("[AGC] Tag helper returned success.");
                window.google.load('visualization', googleChartApiConfig.version || '1', settings);
            })
            .catch(function(){
                $log.error("[AGC] Tag helper returned error. Script may have failed to load.");
                apiReady.reject();
            });

        return apiReady.promise;
    }   
})();

/* global angular */
(function(){
    angular.module("googlechart")
        .provider("agcLibraryLoader", AgcLibraryLoaderProvider);

    AgcLibraryLoaderProvider.$inject = ["$injector"];

    function AgcLibraryLoaderProvider($injector){

        var DEFAULT_LOADER = "Jsapi";

        this.$get = function(loader){
            return loader;
        };

        this.setLoader = function(loaderName){
            if ($injector.has(this.getProviderName(loaderName)))
                this.$get.$inject = [this.getProviderName(loaderName)];
            else {
                console.warn("[Angular-GoogleChart] Loader type \"" + loaderName + "\" doesn't exist. Defaulting to JSAPI loader.");
                this.$get.$inject = [this.getProviderName(DEFAULT_LOADER)];
            }
        };

        this.getProviderName = function(loaderName){
            loaderName = loaderName.charAt(0).toUpperCase() + loaderName.slice(1);
            return "agc" + loaderName + "Loader";
        };

        this.setLoader(DEFAULT_LOADER);
    }
})();

/* global angular */
(function(){
    angular.module("googlechart")
        .provider("agcNullLoader", AgcNullLoaderProvider);
    
    /** Fake loader strategy. Use this if you're loading the google charts library
     *  in some non-standard way.
     */

    function AgcNullLoaderProvider(){
        this._hasTrigger = false;
        this._libraryOverride = null;
        this._triggerFunction = (function(){
            // If the trigger function is called before $get,
            // just act as if it was never fetched.
            if (this._deferred)
                this._deferred.resolve(this._libraryOverride || google);
            else
                this._hasTrigger = false;
        }).bind(this);
        this._deferred = null;
    }

    AgcNullLoaderProvider.prototype.$get = function($q){
        this._deferred = $q.defer();
        
        if (!this._hasTrigger)
            this._deferred.resolve(this._libraryOverride || google);
        
        return this._deferred.promise;
    };
    AgcNullLoaderProvider.prototype.$get.$inject = ["$q"];

    AgcNullLoaderProvider.prototype.getTriggerFunction = function(){
        // Records that the trigger function was fetched.
        // Will wait for it to be called to resolve.
        // This is useful for manual, but deferred, loading of
        // the google charts library.
        this._hasTrigger = true;
        return this._triggerFunction;
    };

    /** Forces angular-google-chart to load this object as the google library.
     *  Makes no checks to ensure that the object passed is compatible. Use
     *  at own risk.
     */
    AgcNullLoaderProvider.prototype.overrideLibrary = function(library){
        this._libraryOverride = library;
    };
})();

(function(){
    angular.module('googlechart')
        .directive('agcOnClick', onClickDirective);

    function onClickDirective(){
        return {
            restrict: 'A',
            scope: false,
            require: 'googleChart',
            link: function(scope, element, attrs, googleChartController){
                callback.$inject = ['args', 'chart', 'chartWrapper'];
                function callback(args, chart, chartWrapper){
                    scope.$apply(function (){
                        scope.$eval(attrs.agcOnClick, {args: args, chart: chart, chartWrapper: chartWrapper});
                    });
                }
                googleChartController.registerChartListener('click', callback, this);
            }
        };
    }
})();

/* global angular */
(function(){
    angular.module('googlechart')
        .directive('agcOnError', onErrorDirective);
    function onErrorDirective(){
        return{
            restrict: 'A',
            scope: false,
            require: 'googleChart',
            link: function(scope, element, attrs, googleChartController){
                callback.$inject = ['chartWrapper', 'chart', 'args'];
                function callback(chartWrapper, chart, args){
                    var returnValues = {
                        chartWrapper: chartWrapper,
                        chart: chart,
                        args: args,
                        error: args[0],
                        err: args[0],
                        id: args[0].id,
                        message: args[0].message
                    };
                    scope.$apply(function(){
                        scope.$eval(attrs.agcOnError, returnValues);
                    });
                }
                googleChartController.registerWrapperListener('error', callback, this);
            }
        };
    }
})();
/* global angular */

(function(){
    angular.module('googlechart')
        .directive('agcOnMouseout', agcOnMouseoutDirective);
    
    function agcOnMouseoutDirective(){
        return {
            restrict: 'A',
            scope: false,
            require: 'googleChart',
            link: function(scope, element, attrs, googleChartController){
                callback.$inject = ['args', 'chart', 'chartWrapper'];
                function callback(args, chart, chartWrapper){
                    var returnParams = {
                        chartWrapper: chartWrapper,
                        chart: chart,
                        args: args,
                        column: args[0].column,
                        row: args[0].row
                    };
                    scope.$apply(function () {
                        scope.$eval(attrs.agcOnMouseout, returnParams);
                    });
                }
                googleChartController.registerChartListener('onmouseout', callback, this);
            }
        };
    }
})();
/* global angular */

(function(){
    angular.module('googlechart')
        .directive('agcOnMouseover', agcOnMouseoverDirective);
    
    function agcOnMouseoverDirective(){
        return {
            restrict: 'A',
            scope: false,
            require: 'googleChart',
            link: function(scope, element, attrs, googleChartController){
                callback.$inject = ['args', 'chart', 'chartWrapper'];
                function callback(args, chart, chartWrapper){
                    var returnParams = {
                        chartWrapper: chartWrapper,
                        chart: chart,
                        args: args,
                        column: args[0].column,
                        row: args[0].row
                    };
                    scope.$apply(function () {
                        scope.$eval(attrs.agcOnMouseover, returnParams);
                    });
                }
                googleChartController.registerChartListener('onmouseover', callback, this);
            }
        };
    }
})();
/* global angular */

(function(){
    angular.module('googlechart')
        .directive('agcOnRangeChange', agcOnRangeChangeDirective);

    function agcOnRangeChangeDirective(){
        return {
            restrict: 'A',
            scope: false,
            require: 'googleChart',
            link: function(scope, element, attrs, googleChartController){
                callback.$inject = ['args', 'chart', 'chartWrapper'];
                function callback(args, chart, chartWrapper){
                    var returnParams = {
                        chartWrapper: chartWrapper,
                        chart: chart,
                        args: args,
                        start: args[0].start,
                        end: args[0].end
                    };
                    scope.$apply(function () {
                        scope.$eval(attrs.agcOnRangeChange, returnParams);
                    });
                }
                googleChartController.registerChartListener('rangechange', callback, this);
            }
        };
    }
})();

/* global angular */
(function(){
    angular.module('googlechart')
        .directive('agcOnReady', onReadyDirective);
        
    function onReadyDirective(){
        return {
            restrict: 'A',
            scope: false,
            require: 'googleChart',
            link: function(scope, element, attrs, googleChartController){
                callback.$inject=['chartWrapper'];
                function callback(chartWrapper){
                    scope.$apply(function (){
                        scope.$eval(attrs.agcOnReady, {chartWrapper: chartWrapper});
                    });
                }
                googleChartController.registerWrapperListener('ready', callback, this);
            }
        };
    }
})();
/* global angular */
(function(){
    angular.module('googlechart')
        .directive('agcOnSelect', onSelectDirective);
        
    function onSelectDirective(){
        return {
            restrict: 'A',
            scope: false,
            require: 'googleChart',
            link: function(scope, element, attrs, googleChartController){
                callback.$inject = ['chartWrapper', 'chart'];
                function callback(chartWrapper, chart){
                    var selectEventRetParams = { selectedItems: chart.getSelection() };
                    // This is for backwards compatibility for people using 'selectedItem' that only wanted the first selection.
                    selectEventRetParams.selectedItem = selectEventRetParams.selectedItems[0];
                    selectEventRetParams.chartWrapper = chartWrapper;
                    selectEventRetParams.chart = chart;
                    scope.$apply(function () {
                        scope.$eval(attrs.agcOnSelect, selectEventRetParams);
                    });
                }
                googleChartController.registerWrapperListener('select', callback, this);
            }
        };
    }
})();
/* global angular */
(function() {
    angular.module("googlechart")
        .factory("agcScriptTagHelper", agcScriptTagHelperFactory);

    agcScriptTagHelperFactory.$inject = ["$q", "$document"];
    function agcScriptTagHelperFactory($q, $document)
    {
        /** Add a script tag to the document's head section and return an angular
          * promise that resolves when the script has loaded.
          */
        function agcScriptTagHelper(url)
        {
            var deferred = $q.defer();
            var head = $document.find('head');
            var script = angular.element('<script></script>');

            script.attr('type', 'text/javascript');

            script.on('load', onLoad);
            script.on('error', onError);

            script.attr('src', url);

            // This: head.append(script);
            // Adds the tag, but event handles don't work.
            // Workaround is to add element with native appendChild().
            head[0].appendChild(script[0]);

            function onLoad() {
                deferred.resolve();
            }

            function onError() {
                deferred.reject();
            }

            return deferred.promise;
        }

        return agcScriptTagHelper;
    }
})();

/* global angular, google */
/* jshint -W072 */
(function(){
    angular.module('googlechart')
        .directive('googleChart', googleChartDirective);
        
    googleChartDirective.$inject = [];
        
    function googleChartDirective() {

        return {
            restrict: 'A',
            scope: false,
            controller: 'GoogleChartController'
        };
    }
})();

/* global angular */
(function(){
    angular.module('googlechart')
        .value('googleChartApiConfig', {
            version: '1',
            optionalSettings: {
                packages: ['corechart']
            }
        });
})();
/* global angular */
(function(){
    angular.module('googlechart')
        .factory('googleChartApiPromise', googleChartApiPromiseFactory);
        
    googleChartApiPromiseFactory.$inject = ['agcLibraryLoader'];

    /** Here for backward-compatibility only. */
    function googleChartApiPromiseFactory(agcLibraryLoader) {
        return agcLibraryLoader;
    }
})();

/* global angular */
(function() {
    angular.module('googlechart')
        .factory('GoogleChartService', GoogleChartServiceFactory);

    GoogleChartServiceFactory.$inject = ['agcLibraryLoader', '$injector', '$q', 'FormatManager'];

    function GoogleChartServiceFactory(agcLibraryLoader, $injector, $q, FormatManager) {
        function GoogleChartService() {
            var self = this;
            self.draw = draw;
            self.getChartWrapper = getChartWrapper;
            self.getData = getData;
            self.getElement = getElement;
            self.getOption = getOption;
            self.getOptions = getOptions;
            self.getView = getView;
            self.getReadyPromise = getReadyPromise;
            self.isApiReady = isApiReady;
            self.registerChartListener = registerChartListener;
            self.registerServiceListener = registerServiceListener;
            self.registerWrapperListener = registerWrapperListener;
            self.setData = setData;
            self.setElement = setElement;
            self.setOption = setOption;
            self.setOptions = setOptions;
            self.setup = setup;
            self.setView = setView;

            var $google,
                _libraryPromise,
                _apiReady,
                _chartWrapper,
                _element,
                _chartType,
                _data,
                _view,
                _options,
                _formatters,
                _innerVisualization,
                _formatManager,
                _needsUpdate = true,
                _customFormatters,
                _serviceDeferred,
                serviceListeners = {},
                wrapperListeners = {},
                chartListeners = {};

            _init();

            function _activateServiceEvent(eventName) {
                var i;
                if (angular.isArray(serviceListeners[eventName])) {
                    for (i = 0; i < serviceListeners[eventName].length; i++) {
                        serviceListeners[eventName][i]();
                    }
                }
            }

            function _apiLoadFail(reason) {
                // Not sure what to do if this does happen.
                // Post your suggestions in the issues tracker at
                // https://github.com/angular-google-chart/angular-google-chart/
                return reason;
            }

            function _apiLoadSuccess(g) {
                $google = g;
                _apiReady = true;
                _serviceDeferred.resolve();
                return g;
            }


            function _continueSetup() {
                if (!angular.isDefined(_chartWrapper)) {
                    _chartWrapper = new $google.visualization.ChartWrapper({
                        chartType: _chartType,
                        dataTable: _data,
                        view: _view,
                        options: _options,
                        containerId: _element[0]
                    });
                    _registerListenersWithGoogle(_chartWrapper, wrapperListeners);
                }
                else {
                    _chartWrapper.setChartType(_chartType);
                    _chartWrapper.setDataTable(_data);
                    _chartWrapper.setView(_view);
                    _chartWrapper.setOptions(_options);
                }

                if (!_formatManager) {
                    _formatManager = new FormatManager($google);
                }

                if (_formatManager.applyFormats(_chartWrapper.getDataTable(),
                        _formatters, _customFormatters).requiresHtml) {
                    _chartWrapper.setOption('allowHtml', true);
                }

                _needsUpdate = false;
            }

            // Credit for this solution:
            // http://stackoverflow.com/a/20125572/3771976
            function _getSetDescendantProp(obj, desc, value) {
                var arr = desc ? desc.split(".") : [];

                while (arr.length && obj) {
                    var comp = arr.shift();
                    var match = new RegExp("(.+)\\[([0-9]*)\\]").exec(comp);

                    if (value) {
                        if (obj[comp] === undefined) {
                            obj[comp] = {};
                        }

                        if (arr.length === 0) {
                            obj[comp] = value;
                        }
                    }

                    obj = obj[comp];
                }

                return obj;
            }

            function _handleReady() {
                // When the chartWrapper is ready, check to see if the inner chart
                // has changed. If it has, re-register listeners onto that chart.
                if (_innerVisualization !== _chartWrapper.getChart()) {
                    _innerVisualization = _chartWrapper.getChart();
                    _registerListenersWithGoogle(_innerVisualization, chartListeners);
                }
            }

            function _init() {
                _apiReady = false;
                _serviceDeferred = $q.defer();
                //keeps the resulting promise to chain on other actions
                _libraryPromise = agcLibraryLoader
                    .then(_apiLoadSuccess)
                    .catch(_apiLoadFail);

                registerWrapperListener('ready', _handleReady, self);
            }

            function _registerListener(listenerCollection, eventName, listenerFn, listenerObject) {
                // This is the function that will be invoked by the charts API.
                // Passing the wrapper function allows the use of DI for
                // for the called function.
                var listenerWrapper = function() {
                    var locals = {
                        chartWrapper: _chartWrapper,
                        chart: _chartWrapper.getChart(),
                        args: arguments
                    };
                    $injector.invoke(listenerFn, listenerObject || this, locals);
                };

                if (angular.isDefined(listenerCollection) && angular.isObject(listenerCollection)) {
                    if (!angular.isArray(listenerCollection[eventName])) {
                        listenerCollection[eventName] = [];
                    }
                    listenerCollection[eventName].push(listenerWrapper);
                    return function() {
                        if (angular.isDefined(listenerWrapper.googleListenerHandle)) {
                            $google.visualization.events.removeListener(listenerWrapper.googleListenerHandle);
                        }
                        var fnIndex = listenerCollection[eventName].indexOf(listenerWrapper);
                        listenerCollection[eventName].splice(fnIndex, 1);
                        if (listenerCollection[eventName].length === 0) {
                            listenerCollection[eventName] = undefined;
                        }
                    };
                }
            }

            function _registerListenersWithGoogle(eventSource, listenerCollection) {
                for (var eventName in listenerCollection) {
                    if (listenerCollection.hasOwnProperty(eventName) && angular.isArray(listenerCollection[eventName])) {
                        for (var fnIterator = 0; fnIterator < listenerCollection[eventName].length; fnIterator++) {
                            if (angular.isFunction(listenerCollection[eventName][fnIterator])) {
                                listenerCollection[eventName][fnIterator].googleListenerHandle =
                                    $google.visualization.events.addListener(eventSource, eventName, listenerCollection[eventName][fnIterator]);
                            }
                        }
                    }
                }
            }

            function _runDrawCycle() {
                _activateServiceEvent('beforeDraw');
                _chartWrapper.draw();
            }

            /*
            This function does this:
                - waits for API to load, if not already loaded
                - sets up ChartWrapper object (create or update)
                - schedules timeout event to draw chart
            */
            function draw() {
                if (_needsUpdate) {
                    _libraryPromise = _libraryPromise.then(_continueSetup);
                }
                _libraryPromise = _libraryPromise.then(_runDrawCycle());
            }

            function getChartWrapper() {
                // Most get functions on this interface return copies,
                // this one should return reference so as to expose the 
                //chart api to users
                return _chartWrapper;
            }

            function getData() {
                var data = _data || {};
                return angular.copy(data);
            }

            function getElement() {
                return _element;
            }

            function getOption(name) {
                var options = _options || {};
                return _getSetDescendantProp(options, name);
            }

            function getOptions() {
                var options = _options || {};
                return angular.copy(options);
            }

            function getReadyPromise() {
                return _serviceDeferred.promise;
            }

            function getView() {
                var view = _view || {};
                return angular.copy(view);
            }

            function isApiReady() {
                return _apiReady;
            }

            function registerChartListener(eventName, listenerFn, listenerObject) {
                return _registerListener(chartListeners, eventName, listenerFn, listenerObject);
            }

            function registerServiceListener(eventName, listenerFn, listenerObject) {
                return _registerListener(serviceListeners, eventName, listenerFn, listenerObject);
            }

            function registerWrapperListener(eventName, listenerFn, listenerObject) {
                return _registerListener(wrapperListeners, eventName, listenerFn, listenerObject);
            }

            function setData(data) {
                if (angular.isDefined(data)) {
                    _data = angular.copy(data);
                    _needsUpdate = true;
                }
            }

            function setElement(element) {
                if (angular.isElement(element) && _element !== element) {
                    _element = element;
                    // clear out the chartWrapper because we're going to need a new one
                    _chartWrapper = null;
                    _needsUpdate = true;
                }
            }

            function setOption(name, value) {
                _options = _options || {};
                _getSetDescendantProp(_options, name, angular.copy(value));
                _needsUpdate = true;
            }

            function setOptions(options) {
                if (angular.isDefined(options)) {
                    _options = angular.copy(options);
                    _needsUpdate = true;
                }
            }

            function setup(element, chartType, data, view, options, formatters, customFormatters) {
                // Keep values if already set,
                // can call setup() with nulls to keep
                // existing values
                _element = element || _element;
                _chartType = chartType || _chartType;
                _data = data || _data;
                _view = view || _view;
                _options = options || _options;
                _formatters = formatters || _formatters;
                _customFormatters = customFormatters || _customFormatters;

                _libraryPromise = _libraryPromise.then(_continueSetup);
            }

            function setView(view) {
                _view = angular.copy(view);
            }
        }
        return GoogleChartService;
    }
})();
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

// login controller
angular.module('app')
.controller('PWresCtrl', ['UserSvc', '$scope', '$routeParams','$location', function (UserSvc, $scope, $routeParams, $location) {

  $scope.username = $routeParams.username;
  
  $scope.recoverPW = function ( username ) {
	UserSvc.pwreset( username )
	.then( function ( response ) {
		//console.log('recover PW ' + JSON.stringify(response));
	});
  }
  
}]);
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
'use strict';

// User settings controller
angular.module('app')
//.controller('SettingsCtrl',	function ($scope, SettingsService) {
//.controller('SettingsCtrl', ['SettingsService', '$scope', '$routeParams', function (SettingsService, $scope, $routeParams) {
.controller('SettingsCtrl', ['SettingsService', '$scope', '$routeParams', '$location', function (SettingsService, $scope, $routeParams, $location) {
// see https://stackoverflow.com/questions/19957280/angularjs-best-practices-for-module-declaration for best practices on module declaration

   $scope.username = $routeParams.username;
   //console.log('ID: ' + $scope.persid);
	
   // initial load of user
   if ($scope.isAuth) { // authorized?
	   SettingsService.fetch( $scope.currentUser.username ) // fetch only current user
	   .then(function (user) {
			//console.log('fetch in SettingsCtrl: ' + JSON.stringify(user.data));
			$scope.user = user.data[0]; // fetch returns an array
			// do we need to blank the password? NO: select: false!
			//console.log('fetch in SettingsCtrl: ' + JSON.stringify($scope.user));
	   });
   }
  
  $scope.subSettings = function () {
    if ($scope.isAuth) {
	  //console.log('subSettings in SettingsCtrl: ' + JSON.stringify($scope.user));
	  SettingsService.updUser({
		username:		$scope.currentUser.username,
		company:    	$scope.user.company,
		email:	  		$scope.user.email,
		postinterq:		$scope.user.postinterq,
		intertime:		parseInt( $scope.user.intertime )
	  })
	  .then(function (user) {
		console.log('Settings ctrl: user updated');
		//$scope.intertime = parseInt( $scope.user.intertime );
		$scope.$emit('inttime', $scope.user.intertime); // pass event up to to ApplicationCtrl
		//console.log("settings ctrl: " + $scope.intertime);
	  });
    } else {
		console.log('You are not authenticated!');
	}
  };

}]);
'use strict';

// user settings services
angular.module('app')
.service('SettingsService', [ '$http', function ($http) {
	
  this.fetch = function ( username ) {
    //return $http.get('/api/settings');
	return $http({
		url: '/api/settings',
		method: "GET",
		params: { username: username }
	});
  };
  
  this.updUser = function ( user ) {
    return $http.post('/api/settings/upduser', user);
  };
  
}]);
// services for user admin
'use strict';
angular.module('app')
.service('UserSvc', function ($http) {
  var svc = this;
  
  svc.getUser = function () {
    return $http.get('/api/users'); // get the logged-in users information
  }
  
  svc.login = function (username, password) { // login user
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
  
  svc.register = function (username, password) { // register new user
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
  
  svc.prereg = function (username, uemail) { // preregister user
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

  svc.confmail = function (uemail, etoken) { // send confirmation link via e-mail
	return $http({ // confirm registration (following the link from registration e-mail) (also for pw-reset)
		url: '/api/users/confmail',
		method: "GET",
		params: { uemail: uemail, etoken: etoken }
	});
  }
  
  svc.confreg = function (username, password, email) {	// confirm user registration (also used for pw reset)
	//console.log('service confreg ' + username + ' pw ' + password);
	return $http.post('/api/users/confreg', { // finalize user creation / pw reset
		username: username,
		password: password,
		email: email
	}).then(function () {
		return svc.login(username, password);
	});
  }
  
  svc.pwreset = function (username) { // reset password
	return $http.post('/api/users/pwreset', {
		username: username
	}).then(function (response) {
		return response; // no login!
	}, function errorCallback(response) {
		// called asynchronously if an error occurs
		// or server returns response with an error status.
		return response; // no login!
	});
  }

});