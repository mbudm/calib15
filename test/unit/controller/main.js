var test = require('tape');
var main = require('../../../src/controller/main');
//var main = new MainController();
 
test('main exists', function (t) {
    t.ok(main,'main exists');
    t.end();
});

test('main event emitter ok', function (t) {
		t.plan(3);
		t.ok(main.on, 'main.on public method exists');
		t.ok(main.once, 'main.removeListener public method exists');
		t.ok(main.removeListener, 'main.removeListener public method exists');
});

test('main fires tracking-on and tracking-update events', function (t) {
		t.plan(2);
	
		main.once('tracking-on',function(){
			t.ok((arguments.length === 0), 'tracking-on event handler called no argument passed');
		});
		main.once('tracking-update',function(data){
			t.ok(data, 'tracking-update data argument passed');
		});
		
		main.onApiReady();
		main.start();
		main.onApiUpdate({
				system:{
						mode:'training'
				},
				state:{
					trackingSuspended:false
				}
		});
});

test('main fires tracking-off event', function (t) {
		t.plan(1);
		main.once('tracking-off',function(){
			t.ok((arguments.length === 0), 'tracking-off no argument passed');
		}); 
		main.onApiUpdate({
				system:{
						mode:'training'
				},
				state:{
					trackingSuspended:true
				}
			});
		main.end();
});

