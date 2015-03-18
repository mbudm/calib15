/* Dependencies */
var EventEmitter = require('event-emitter');
var $ = require('jquery');

var ee = new EventEmitter;

/* UI */
var startBtn = $('body').append('<btn class="start">Start</btn>');

/* handlers */
startBtn.on('click',function(){
	ee.emit('start');
});

module.exports = {
	on:ee.on,
	off:ee.off
}