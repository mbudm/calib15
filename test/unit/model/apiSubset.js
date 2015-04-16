require('require-json');
var test = require('tape-catch');
		rqr = require('rqr'),
		ApiSubset = rqr('src/model/apiSubset'),
		testApiData = rqr('test/data/apiFull.json');
 
test('apiSubset exists', function (t) {
    t.ok(ApiSubset,'ApiSubset exists');
    t.end();
});

test('apiSubset create a model instance', function (t) {
		var subset = ApiSubset.create({
			gazeX:200,
			gazeY:250,
			headX:0.5,
			headY:-0.5,
			gazeScore:0.7
		})
    t.ok(subset,'subset instance exists');
    t.ok(subset.isValid(),'subset instance isValid');
    t.end();
});

test('apiSubset parseApi - create a model instance from a full xlabs api object', function (t) {
		var fullApiData = ApiSubset.parseApi(testApiData);
    t.ok(fullApiData,'fullApiData instance exists');
    t.ok(fullApiData.isValid(),'fullApiData instance isValid');
		t.equals(fullApiData.gazeX,parseFloat(testApiData.state.gaze.estimate.x),'gaze x set correctly');
		t.equals(fullApiData.headY,parseFloat(testApiData.state.head.y),'head y set correctly');
    t.end();
});