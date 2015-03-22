/* Dependencies */
var EventEmitter = require('event-emitter');
var $ = require('jquery');

var ee = new EventEmitter;

/* UI */
var $startBtn = $('<btn class="start">Start</btn>');
$('body').append($startBtn);

/* handlers */
$startBtn.on('click',function(){
	ee.emit('start');
});

var on = function(t,l){
	ee.on(t,l);
}

var off = function(t,l){
	ee.removeListener(t,l);
}

module.exports = {
	on:on,
	off:off,
	getStartButton:function(){
		return $startBtn;
	}
}