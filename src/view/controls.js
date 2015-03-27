/* Dependencies */
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var $ = require('jquery');

/* UI */
var $startBtn = $('<btn class="start">Start</btn>');
$('body').append($startBtn);


function Ctrls(){
	var me = this
	/* handlers */
	$startBtn.on('click',function(){
		me.emit('start');
	});
};

// extend eventemitter
util.inherits(Ctrls, EventEmitter);

//add publics. Todo: map the prototype?
Ctrls.prototype.getStartButton = function(){
		return $startBtn;
};

module.exports = new Ctrls();
