'use strict';

// Insights controller
// how to integrate google charts into angular:
// https://stackoverflow.com/questions/14375728/how-to-integrate-google-charts-as-an-angularjs-directive
angular.module('app')
.controller('InsightsCtrl', ['InsightsService', '$scope', '$routeParams', function (InsightsService, $scope, $routeParams) {
	
	// retrieve list of interactions for this person from the api and show it in the table
	var username = $scope.currentUser.username;
	//console.log("InsightsCtrl: " + JSON.stringify($scope.currentUser) + " : " + username);
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
		
		
		//console.log(JSON.stringify(interactions.data));
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