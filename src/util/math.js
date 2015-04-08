/* Dependencies */
var util = require('util');

// publics. 
var publics = {
	// t: threshold. can be pixel values or % of screen width
	getDistanceThreshold :function(t){
		return t < 1 ? Math.round(t * screen.width) : t ;
	},
	timedOut:function(instructionObj){
		var now = Date.now();
		//console.log('Timed Out? ', now, instructionObj.start, instructionObj.expire)
		return (now - instructionObj.expire > instructionObj.start);
	}
};


function CalibMath(){}

// extend publics
CalibMath.prototype = publics;

module.exports = new CalibMath();