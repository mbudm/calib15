var test = require('tape-catch'),
		MovingAverage = require('../../../src/model/movingAverage');
var fs = require('fs');
var	d =  fs.readFileSync('./test/data/apiFull.json','utf8');
var testApiData = JSON.parse(d);
 
test('MovingAverage exists', function (t) {
    t.ok(MovingAverage,'MovingAverage exists');
		t.ok(MovingAverage.create,'MovingAverage.create is method');
    t.end();
});

test('MovingAverage create a model instance', function (t) {
		var ma = MovingAverage.create({
			gazeX:200,
			gazeY:250,
			headX:0.5,
			headY:-0.5,
			gazeScore:0.7,
			size:2
		});
    t.ok(ma,'MovingAverage instance exists');
    t.ok(ma.isValid(),'MovingAverage instance isValid');
    t.end();
});

test('MovingAverage should inherit apiSubset parseApi - create a model instance from a full xlabs api object', function (t) {
		var maFromApi = MovingAverage.parseApi(testApiData);
    t.ok(maFromApi,'maFromApi instance exists');
    t.notOk(maFromApi.isValid(),'maFromApi instance not isValid - doesnt have a size ');
		maFromApi.updateProperties({
			size:2
		});

    t.ok(maFromApi.isValid(),'maFromApi instance isValid - now has a size ');
		t.equals(maFromApi.gazeX,parseFloat(testApiData.state.gaze.estimate.x),'gaze x set correctly');
		t.equals(maFromApi.headY,parseFloat(testApiData.state.head.y),'head y set correctly');
    t.end();
});