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