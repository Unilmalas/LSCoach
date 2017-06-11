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