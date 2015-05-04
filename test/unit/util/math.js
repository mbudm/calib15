var test = require('tape-catch'),
		Mth = require('../../../src/util/math');
		
test('Mth exists', function (t) {
  t.ok(Mth,'Mth exists');
  t.end();
});

test('getDistanceThreshold', function (t) {
	t.equals(Mth.getDistanceThreshold(100),100,'value greater than 1 returns itself');
	t.equals(Mth.getDistanceThreshold(0.5),Math.round(screen.width/2),'value less than 1 returns proprtion of screen width');
	t.end();
});


test('timedOut', function (t) {
	var now = Date.now();
	t.notOk(Mth.timedOut({start:now, expire:1000}),"not timed out");
	t.ok(Mth.timedOut({start:(now - 2000), expire:1000}),"timed out");
	t.end();
});