var test = require('tape-catch'),
		instructions = require('../../../src/controller/instructions');

test('instructions exists', function (t) {
    t.ok(instructions,'instructions exists');
    t.end();
});

test('instructions event emitter ok', function (t) {
		t.plan(3);
		t.ok(instructions.on, 'instructions.on public method exists');
		t.ok(instructions.once, 'instructions.removeListener public method exists');
		t.ok(instructions.removeListener, 'instructions.removeListener public method exists');
});

test('checkInstruction - delay not passed', function(t){
	var d = Date.now();
	t.notOk( instructions.checkInstruction({delay:d + 1000}) );
	t.end();
});

test('checkInstruction - delay passed, task event fired', function(t){
	t.plan(3);
	var d = Date.now();
	var iObj = {
		delay: (d - 1000),
		task:{
			eventName:"myTask",
			param:"myParam"
		}
	};
	instructions.on(
		{
			'instructions:update':function(ts){
				t.ok(ts > d, 'the timestamp passed to the instructions:update handler is greater than the test setup timestamp');
			},
			'myTask':function(param){
				t.equals(param, iObj.task.param, 'myParam is passed to the myTask handler');
			}
		});
	t.ok( instructions.checkInstruction(iObj) );
});

test('checkInstruction - delay passed, no task or criteria', function(t){
	t.plan(2);
	var d = Date.now();
	instructions.on('instructions:update',function(ts){
		t.ok(ts > d, 'the timestamp passed to the instructions:update handler is greater than the test setup timestamp');
	});
	t.ok(instructions.checkInstruction({
		delay: (d - 1000)
	}));
});
/*
test('checkInstruction - passed criteria success ticker', function(t){
	
});

test('checkInstruction - passed criteria success complete', function(t){
	
});

test('checkInstruction - passed criteria success start', function(t){
	
});

test('checkInstruction - timeout', function(t){
	
});

test('pass - no criteria', function(t){
	
});

test('pass - direction y axis', function(t){
	
});

test('pass - direction x axis', function(t){
	
});

test('pass - calibrate', function(t){
	
});

test('pass - calibrate basic', function(t){
	
});

test('pass - environment', function(t){
	
});*/