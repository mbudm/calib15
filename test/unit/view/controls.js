var test = require('tape'),
		ctrls = require('../../../src/view/controls'),
		//ctrls = new CtrlsView(),
		startBtn;
 
test('controls exists', function (t) {
    t.ok(ctrls,'ctrls exists');
    t.end();
});

test('start button exists', function (t) {
		startBtn = ctrls.getStartButton();
    t.ok(startBtn,'startBtn exists');
    t.ok(startBtn.click,'startBtn hasa a click method');
    t.end();
});

test('start button click fires start event', function (t) {
		t.plan(2);
		startBtn.click(function(){
			 t.pass('click event fired ');
		});
		ctrls.on('start',function(){
			 t.pass('start event fired');
		});
		startBtn.click();
});