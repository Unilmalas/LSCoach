angular.module('app', [
	'ngRoute'
]); // setter - called only once before getters
// Admin controller
angular.module('app')
.controller('AdminCtrl', function ($scope, AdminSvc) {
  
  $scope.module = "jak"; // hard-coded for now, will add a wrapper later and set it there
  //console.log('calling admin module');
  
  // initial load of questions (todo: when implementing types will need to change this)
  AdminSvc.fetch($scope.module)
  .success(function () {
	$scope.myAcct = null; // inits acct
	$scope.myCust = null; // inits cust
	$scope.myQuest = null; // inits cust
  });

  $scope.updateAcct = function () { // actually upsert: creates a new document when no document matches
    if ( $scope.isAuth && $scope.isAdmin ) { // authorized? also needs admin rights
      AdminSvc.updateAcct({
		module:	  $scope.myAcct.module,
        name:     $scope.myAcct.name,
		zip:	  $scope.myAcct.zip
      })
      .success(function (acct) {
		console.log('acct updated');
      })
    } else {
		console.log('You are not authenticated');
	}
  }
  
  $scope.findAcct = function () { // called from admin accounts
	//console.log('findAcct: ' + $scope.myAcct);
	if ( $scope.isAuth && $scope.isAdmin ) {
		AdminSvc.findAcct ($scope.module, $scope.myAcct.name)
		.success(function (accts) {
			$scope.accts = accts;
		});
	} else {
	console.log('You are not authenticated');
	}
  }
  
  $scope.findCustAcct = function () { // called from admin customers
	//console.log('findCustAcct: ' + $scope.myAcct);
	if ( $scope.isAuth && $scope.isAdmin ) {
		AdminSvc.findCustAcct ($scope.module, $scope.myCust.acct)
		.success(function (caccts) {
			$scope.caccts = caccts;
		});
	} else {
	console.log('You are not authenticated');
	}
  }
  
  $scope.setAcct = function (acct) {
	  $scope.myAcct.module = acct.module;
	  $scope.myAcct.name = acct.name;
	  $scope.myAcct.zip = acct.zip;
	  $scope.myAcct._id = acct._id;
	  $scope.accts = [];
  }
  
  $scope.setAcctCust = function (cacct) {
	  //console.log('setAcctCust ' + JSON.stringify(cacct));
	  $scope.myCust.acct = cacct.name;
	  $scope.myCust._acct = cacct._id;
	  $scope.caccts = [];
  }

  $scope.updateCust = function () { // upsert cust
    console.log('update cust ctrl ' + JSON.stringify($scope.myCust));
    if ( $scope.isAuth && $scope.isAdmin ) { // postBody from: input ng-model='postBody' in template posts.html
      AdminSvc.updateCust({
		module:	  		$scope.module,
        firstname:     	$scope.myCust.firstname,
		lastname:	  	$scope.myCust.lastname,
		_acct:			$scope.myCust._acct
      })
      .success(function (cust) {
		console.log('cust updated');
      })
    } else {
		console.log('You are not authenticated!');
	}
	/*      AdminSvc.addCust({
		module:	  $scope.module,
        firstname:     'John',
		lastname:	  'Doe'
      })
      .success(function (cust) {
		console.log('cust stored');
      })
    } else {
		console.log('You are not authenticated!');
	}*/
  }
  
  $scope.deleteCust = function () { // delete cust
    console.log('delete cust ctrl ' + JSON.stringify($scope.myCust));
    if ( $scope.isAuth && $scope.isAdmin ) { // postBody from: input ng-model='postBody' in template posts.html
      AdminSvc.deleteCust({
		module:	  		$scope.module,
        firstname:     	$scope.myCust.firstname,
		lastname:	  	$scope.myCust.lastname,
		_acct:			$scope.myCust._acct
      })
      .success(function (cust) {
		console.log('cust deleted');
      })
    } else {
		console.log('You are not authenticated!');
	}
  }
  
  $scope.findCust = function () {
	if ( $scope.isAuth && $scope.isAdmin ) {
		if ( $scope.myAcct != null ) {
			if ( $scope.myAcct._id ) { // myAcct is set: search customers with restriction to acct
				AdminSvc.findCust ($scope.module, $scope.myAcct._id, $scope.myCust.lastname)
				.success(function (custs) {
					$scope.custs = custs;
				});
			} // todo: else what ????
		} else { // to do: take out and let svc deal with it
			//console.log($scope.myCust);
			AdminSvc.findCust ($scope.module, null, $scope.myCust.lastname)
			.success(function (custs) {
				$scope.custs = custs;
			});				
		}
	} else {
	console.log('You are not authenticated!');
	}
  }
  
  $scope.setCust = function (cust) {
	  $scope.myCust.module = $scope.module;
	  $scope.myCust.firstname = cust.firstname;
	  $scope.myCust.lastname = cust.lastname;
	  $scope.custs = [];
	  //console.log('admin ctrl ' + cust._acct);
	  AdminSvc.findAcctforCust ($scope.module, cust)
	  .success(function (custacct) {
		  //console.log('setcust ' + JSON.stringify(custacct) + ' acct name ' + custacct.name);
		  $scope.myCust.acct = custacct.name;
		  $scope.myCust._acct = custacct._id;
		  //$scope.myAcct.name = custacct.name;
		  //$scope.myAcct._id = custacct._id;
	  });
  }

  $scope.clearSearch = function () {
	$scope.acct = {};
	$scope.cacct = {};
	$scope.cust = {};
	$scope.myAcct.name = null; // inits acct
	$scope.myAcct.zip = null;
	$scope.myAcct._id = null;
	$scope.myCust = null; // inits cust
	$scope.myQuest = null; // inits quest
  }

  $scope.findQuest = function () { // find question to change/delete
    if ( $scope.isAuth && $scope.isAdmin ) { // postBody from: input ng-model='postBody' in template posts.html
      AdminSvc.findQuest($scope.myQuest)
      .success(function (quests) {
		console.log('ctrl question found ' + JSON.stringify(quests));
		$scope.myQuest.question = quests.question;
		$scope.myQuest.module = quests.module;
		$scope.myQuest.type = quests.type;
		$scope.myQuest.answers = quests.answers; // check, possibly copy function required
		$scope.myQuest.points = quests.points;
		$scope.myQuest.answers.push("Answer") // add a last entry for new answer choice
		$scope.myQuest.points.push(0);
      });
    } else {
		console.log('You are not authenticated!');
	}
  }
  
  $scope.updateQuest = function () { // upsert question
    if ( $scope.isAuth && $scope.isAdmin ) { // postBody from: input ng-model='postBody' in template posts.html
      //console.log('quest upd ' + $scope.myQuest.answers[$scope.myQuest.answers.length - 1]);
	  if ( $scope.myQuest.answers[$scope.myQuest.answers.length - 1] == "Answer" ) {
		$scope.myQuest.answers.pop() // remove last entry since no new addition
		$scope.myQuest.points.pop();
	  }
	  AdminSvc.updateQuest({
		module:	  	$scope.myQuest.module,
		type:		$scope.myQuest.type,
        question:	$scope.myQuest.question,
		answers:	$scope.myQuest.answers,
		points:		$scope.myQuest.points
      })
      .success(function (quest) {
		console.log('question updated');
      });
    } else {
		console.log('You are not authenticated!');
	}
  }
  
  $scope.deleteQuest = function () { // delete question
    if ( $scope.isAuth && $scope.isAdmin ) { // postBody from: input ng-model='postBody' in template posts.html
      AdminSvc.deleteQuest({
		module:	  	$scope.myQuest.module,
		type:		$scope.myQuest.type,
        question:	$scope.myQuest.question,
		answers:	$scope.myQuest.answers,
		points:		$scope.myQuest.points
      })
      .success(function (quest) {
		console.log('question deleted');
      });
    } else {
		console.log('You are not authenticated!');
	}
  }
  
});
// Admin services (binding to API is in server.js)
angular.module('app')
.service('AdminSvc', function ($http) {
	
  this.fetch = function (module) {
    //return $http.get('/api/admin');
	//console.log('service fetch: ' + module);
	return $http({
		url: '/api/admin',
		method: "GET",
		params: { module: module }
	});
  }
  
  this.updateAcct = function (acct) {
    return $http.post('/api/admin/acct_upd', acct);
  }
  
  this.updateCust = function (cust) {
    return $http.post('/api/admin/cust_upd', cust);
  }
  
  this.deleteCust = function (cust) {
    return $http.post('/api/admin/cust_del', cust);
  }

  this.addCust = function (cust) {
    return $http.post('/api/admin/cust', cust);
  }
  
  this.addQuest = function (quest) {
    return $http.post('/api/admin/quest', quest);
  }
  
  this.updateQuest = function (quest) {
    return $http.post('/api/admin/quest_upd', quest);
  }
  
  this.deleteQuest = function (quest) {
    return $http.post('/api/admin/quest_del', quest);
  }
  
  this.findAcct = function (module, acct) {
		// as much bussiness logic as possible into services (and away from controller)
		if(isNaN(acct)) { // returns true if acct is NOT a valid number
			// split search string into numeric (if at all) and non-numeric
			var numRegMatch = "";
			var res = acct.match(/\d+/g);
			//console.log('TypeSvc name: ' + acct + ' res1: ' + res);
			if (res!=null) {
				res.forEach( function (item) {
					numRegMatch += item;
				});
			}
			var txtRegMatch = ".*";
			res = acct.match(/\D+/g);
			//console.log('TypeSvc name: ' + acct + ' res2: ' + res);
			if (res!=null) {
				acct.match(/\D+/g).forEach( function (item) {
					txtRegMatch += item.trim() + ".*";
				});
			}
			//console.log('findAcct: ' + res + ' : ' + txtRegMatch);
			return $http({ // try account search by name or zip: careful here: currently thats "or", if and the separate name-only search has to be actvated
				url: '/api/admin/acct_mixed',
				method: "GET",
				params: { module: module, name: txtRegMatch, zip: numRegMatch }
			});
			/*return $http({ // try account search by name
				url: '/api/admin/acct_name',
				method: "GET",
				params: { acct: acct }
			});*/
		} else {
			// try account search by zip (only number)
			if(acct==null) acct = "";
			//console.log('TypeSvc zip: ' + acct);
			return $http({ // try account search by zip
				url: '/api/admin/acct_zip',
				method: "GET",
				params: { module: module, acct: acct }
			});
		}
  }
  
  this.findCustAcct = function (module, acct) {
		// acct set? 	-> N: 	find acct or error
		//				-> Y: 	find acct via _id on customer: not found: error
		//						otherwise: change on cust and update
		if(isNaN(acct)) { // returns true if acct is NOT a valid number
			// split search string into numeric (if at all) and non-numeric
			var numRegMatch = "";
			var res = acct.match(/\d+/g);
			//console.log('TypeSvc name: ' + acct + ' res1: ' + res);
			if (res!=null) {
				res.forEach( function (item) {
					numRegMatch += item;
				});
			}
			var txtRegMatch = ".*";
			res = acct.match(/\D+/g);
			//console.log('TypeSvc name: ' + acct + ' res2: ' + res);
			if (res!=null) {
				acct.match(/\D+/g).forEach( function (item) {
					txtRegMatch += item.trim() + ".*";
				});
			}
			//console.log('findAcct: ' + res + ' : ' + txtRegMatch);
			return $http({ // try account search by name or zip: careful here: currently thats "or", if and the separate name-only search has to be actvated
				url: '/api/admin/acct_mixed',
				method: "GET",
				params: { module: module, name: txtRegMatch, zip: numRegMatch }
			});
			/*return $http({ // try account search by name
				url: '/api/admin/acct_name',
				method: "GET",
				params: { acct: acct }
			});*/
		} else {
			// try account search by zip (only number)
			if(acct==null) acct = "";
			console.log('TypeSvc zip: ' + acct);
			return $http({ // try account search by zip
				url: '/api/admin/acct_zip',
				method: "GET",
				params: { module: module, acct: acct }
			});
		}
  }
  
  this.findAcctforCust = function (module, cust) {
	// assume cust is a valid customer (call comes from controller after customer is chosen from list)
	//console.log('admin svc findAcctffor Cust: ' + cust._acct);
	return $http({ // try account search by id from cust
		url: '/api/admin/acct_id',
		method: "GET",
		params: { module: module, _id: cust._acct }
	});
  } 
  
  this.findCust = function (module, acct, cust) {
	// as much bussiness logic as possible into services (and away from controller)
	var txtRegMatch = cust==null ? "" : cust;
	//console.log('findCust svc: ' + txtRegMatch);
	if (acct == null) {
		return $http({ // try cust search by name
			url: '/api/admin/cust_name',
			method: "GET",
			params: { module: module, lastname: txtRegMatch } // todo: change latname to both names, omly temp!
		});
	} else { // acct is set, restrict search to customers in acct
		return $http({ // try cust search by name
			url: '/api/admin/cust_acct',
			method: "GET",
			params: { module: module, lastname: txtRegMatch, _acct: acct } // todo: change latname to both names, omly temp!
		});		
	}
  }
  
  this.findQuest = function (quest) {
	console.log('svc querying questions with ' + JSON.stringify(quest));
	return $http({ // try question search by question from quest
		url: '/api/admin/quest',
		method: "GET",
		params: { module: quest.module, type: quest.type, question: quest.question }
	});
  } 
  
});
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
        scope.currentUser = null;
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
		.success(function (user) {
			$scope.username = user.username; // getting username back
	});
  
  	$scope.confreg = function (username, password) {
		//console.log('ctrl confreg ' + username + ' pw ' + password);
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
   HomeService.fetch()
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
  };
  
  $scope.managePers = function (persid) {
	  // manage person just clicked
	  //console.log('person id: ' + persid);
	  $location.path("/manage/" + persid); // link to manage person page
	  // in the router this is then .when('/inter/:persid',...) which can be accessed via var persid = $routeParams.persid;
  };
  
  $scope.showInteractions = function (index) {
	  // show interactions for person just clicked
	  var _person = $scope.persons.data[index]._id; // person data property holds data of $http-response
	  //console.log('person id: ' + _person);
	  //$location.path("/inter/").search({persid: _person}); // this produces: /inter/?persid=_person
	  $location.path("/inter/" + _person); // this is working now
	  // in the router this is then .when('/inter/:persid',...) which can be accessed via var persid = $routeParams.persid;
  };

}]);
'use strict';

// home services
angular.module('app')
.service('HomeService', [ '$http', function ($http) {
	
  this.fetch = function () {
    return $http.get('/api/intell');
	/*return $http({
		url: '/api/intell',
		method: "GET",
		params: {}
	});*/
  };
  
  this.findInterforPers = function (pers) {
	return $http({ // try interaction search by id from person
		url: '/api/intell/person_id',
		method: "GET",
		params: { _id: pers._id }
	});
  };
  
  this.subInter = function (inter) {
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
  // initial load of interactions
  InterService.fetch(persid)
  .then(function (interactions) {
	  $scope.interactions = interactions; // to be shown in interactions list
	  //console.log(JSON.stringify(interactions.data));
  });
  
}]);
'use strict';

// interaction services
angular.module('app')
.service('InterService', [ '$http', function ($http) {

  this.fetch = function (persid) {
    return $http({ // fetch interactions for given persid
		url: '/api/intell/inter_id',
		method: "GET",
		params: { _id: persid }
	});
  };
  
}]);
// login controller
angular.module('app')
.controller('LoginCtrl', function ($scope, UserSvc) {
	
  $scope.login = function (username, password) {
    UserSvc.login(username, password)
    .then(function (response) {
		//console.log(user);
		$scope.$emit('login', response.data); // pass event up to to ApplicationCtrl
		//$location.path('/');
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
	//console.log('ID: ' + $scope.persid);
	
   // initial load of person
   ManageService.fetch($scope.persid)
   .then(function (person) {
	    //console.log('fetch in ManageCtrl: ' + JSON.stringify(person.data));
		//$scope.person = JSON.parse(JSON.stringify(person.data[0]));; // trick to deep-clone object
		$scope.person = person.data[0];
		//console.log(JSON.stringify($scope.person));
		//console.log($scope.person.firstname)
   });
  
  $scope.addPers = function () {
    //if ($scope.isAuth) {
	  // need to check first if update was pressed even as its a new person
	  if ( $scope.person._id != '' ) {
		  ManageService.updPers({
			_id:			$scope.person._id,
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
			firstname:    	$scope.person.firstname,
			lastname:	  	$scope.person.lastname,
			relationship:	$scope.person.relationship,
			description:	$scope.person.description
		  })
		  .then(function (pers) {
			console.log('person added');
		  });
	  }
    //} else {
	//	console.log('You are not authenticated!');
	//}
  };
  
  $scope.updatePers = function () {
    //if ($scope.isAuth) {
	  if ( $scope.person._id != '' ) { // only if PID is set, otherwise add
		  ManageService.updPers({
			_id:			$scope.person._id,
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
			firstname:    	$scope.person.firstname,
			lastname:	  	$scope.person.lastname,
			relationship:	$scope.person.relationship,
			description:	$scope.person.description
		  })
		  .then(function (pers) {
			console.log('person added');
		  });
	  }
    //} else {
	//	console.log('You are not authenticated!');
	//}
  };
  
  $scope.deletePers = function () {
    //if ($scope.isAuth) {
      ManageService.delPers({
		_id:			$scope.person._id,
        firstname:    	$scope.person.firstname,
		lastname:	  	$scope.person.lastname,
		relationship:	$scope.person.relationship,
		description:	$scope.person.description
      })
      .then(function (pers) {
		console.log('person deleted');
		$scope.person = {};
      });
    //} else {
	//	console.log('You are not authenticated!');
	//}
  };

}]);
'use strict';

// manage services
angular.module('app')
.service('ManageService', [ '$http', function ($http) {
	
  this.fetch = function (persid) {
    //return $http.get('/api/intell');
	return $http({
		url: '/api/intell/pid',
		method: "GET",
		params: { _id: persid }
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
	
  $scope.prereg = function (username, uemail) {
	// e-mail validation
	var emailRegex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
	if (emailRegex.test(uemail)) { // test if e-mail format ok
		UserSvc.prereg(username, uemail) // call preregister in UserSvc service
		.then(function (response) {
			//$scope.$emit('login', response.data); // pass event up to to ApplicationCtrl
			//$location.path('/');
		});
	} else console.log('Please enter a valid e-mail address.');
  }
});

// register user controller
angular.module('app')
.controller('RegisterCtrl', function ($scope, UserSvc) {
	
  $scope.register = function (username, password) {
    UserSvc.register(username, password) // call register in UserSvc service
    .then(function (response) {
		$scope.$emit('login', response.data); // pass event up to to ApplicationCtrl
		//$location.path('/');
    });
  }
});

// routes
angular.module('app') // getter
.config(['$routeProvider', function ($routeProvider) {
  $routeProvider 	// each route has a controller and a template associated with it
	.when('/',         { controller: 'HomeCtrl', templateUrl: '/templates/home.html' })  // html-files are loaded on demand
	.when('/inter/:persid', { controller: 'InterCtrl', templateUrl: '/templates/inter.html' }) // show interactions for a person
	//.when('/register', { controller: 'RegisterCtrl', templateUrl: '/templates/register.html' })
	.when('/prereg', { controller: 'PreRegCtrl', templateUrl: '/templates/prereg.html' }) // preregistration of user till conf
	.when('/confreg', { controller: 'ConfRegCtrl', templateUrl: '/templates/confreg.html' }) // confirm user registration
	.when('/confmail', { controller: 'ConfMailCtrl', templateUrl: '/templates/confreg.html' }) // confirm user from e-mail
	.when('/login',    { controller: 'LoginCtrl', templateUrl: '/templates/login.html' })
	.when('/logout',	 { controller: 'LogoutCtrl', templateUrl: '/templates/logout.html' })
	.when('/manage/:persid',	 { controller: 'ManageCtrl', templateUrl: '/templates/manage.html' })
	.when('/manage',	 { controller: 'ManageCtrl', templateUrl: '/templates/manage.html' })
	// routes like /color/:color/largecode/:largecode*\/edit will match /color/brown/largecode/code/with/slashes/edit 
	// and extract: color: brown largecode: code/with/slashes and stored in $routeParams under the given name
	.otherwise(			{ redirectTo: '/' }); // home page (should I put this into templates too...?)
  //$locationProvider.html5Mode(true);
}]);
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
	  svc.token = val.data;
	  $http.defaults.headers.common['X-Auth'] = val.data;
      return svc.getUser();
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
	return $http.post('/api/users/prereg', { // create a user temporarily
		username: username,
		uemail: uemail
	}).then(function () {
		return; // no login!
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
	//console.log('service confreg ' + username + ' pw ' + password);
	return $http.post('/api/users/confreg', { // finalize user creation
		username: username,
		password: password
	}).then(function () {
		return svc.login(username, password);
	});
  }

});