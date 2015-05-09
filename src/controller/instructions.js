/* Dependencies */
var util = require('util');
var EventEmitter = require('events').EventEmitter;

//var calibUtil = require('../util/gaze');

var headController = require('./head');// ("categorisePitch") // services
var gazeController = require('./gaze'); //("gazeAccuracy", "gazeMovement") // services
var envController = require('./environment'); //("checkEnvironment") // service
//* model.movingAverages ("pitch", "yaw", "gazeScore")
var uMath = require('../util/math');


/* 
 *  private methods 
 */

function passCriteria(instructionObj){
	if(!instructionObj.criteria){
		return true;
	}
	
	switch(instructionObj.criteria.type){
		case 'direction':
			switch(instructionObj.criteria.direction){
				case 'up':
				case 'down':
					var pitchCat = headController.categorisePitch(instructionObj.criteria.ma); //movingAverages[instructionObj.criteria.ma].pitch);
					if(instructionObj.criteria.direction === pitchCat){
						//console.log(this.getInstructionIdx(),instructionObj,'Pitch criteria passed',pitchCat);
						return true;
					}else{
						//console.log(this.getInstructionIdx(),instructionObj,'Criteria Fail PitchCat:'+pitchCat+' != '+instructionObj.criteria.direction+' ma'+instructionObj.criteria.ma+':'+this.movingAverages[instructionObj.criteria.ma].pitch+ ' center:',this.currentCenter  );
					}
					break;
				case 'left':
				case 'right':
					var yawCat = headController.categoriseYaw(instructionObj.criteria.ma);
					if(instructionObj.criteria.direction === yawCat){
						//console.log(this.getInstructionIdx(),instructionObj,'Yaw criteria passed',yawCat);
						return true;
					}else{
						//console.log(this.getInstructionIdx(),instructionObj,'Criteria Fail YawCat:'+yawCat+' '+instructionObj.criteria.direction+' ma'+instructionObj.criteria.ma+':'+this.movingAverages[instructionObj.criteria.ma].yaw+ ' center:',this.currentCenter );
					}
					break;
				}
			break;
		case 'calibrate':
			// check that the gaze x/y is within the threshold of the target
			//console.log(instructionObj,'calibrating',this.gazeAccuracy(instructionObj.criteria.ma), instructionObj.criteria.threshold, this.getDistanceThreshold(instructionObj.criteria.threshold));
			
			// move getDistanceThreshold to api as it deals with screen width?
			if(gazeController.gazeAccuracy(instructionObj.criteria.ma) <= uMath.getDistanceThreshold(instructionObj.criteria.threshold) ){ 
				return true;
			}
			break;
		case 'calibrate-basic':
			// check that the gaze x/y is within the threshold of the target
			if(gazeController.gazeMovement(instructionObj.criteria.ma) >= instructionObj.criteria.threshold){
				//console.log(this.getInstructionIdx(),instructionObj,'calibrate basic passed',this.gazeMovement(instructionObj.criteria.ma), instructionObj.criteria.threshold);
				return true;
			}
			break;
		case 'environment':
			/*
			if(this.movingAverages[0].gazeScore <= this.errorThreshold ){
				//console.log('failed gazeScore', this.movingAverages[1].gazeScore, instructionObj.criteria.type)
				return false;
			}*/
			return envController.checkEnvironment(instructionObj.criteria.ma);
			break;
	}
	return false;
}



/* 
 * public methods
 */

function checkInstruction(instructionObj){

	if(!instructionObj){
		return false;
	}
	var timeNow = Date.now(),
			timeElapsed = Math.max( 0, ( timeNow - instructionObj.start ) );
		
	if(timeElapsed > instructionObj.delay){
		// change this to switch on type?
		if(instructionObj.task){
			//console.log("Task called", instructionObj.task.method, instructionObj);
			this.emit(instructionObj.task.eventName, instructionObj.task.param);
			this.emit('instructions:update',timeNow);
			return true;
		}
		if(!instructionObj.criteria){
			//console.log("No criteria so move to next instruction", instructionObj);
			this.emit('instructions:update',timeNow);
			return true;
		}
		if(instructionObj.passTime){
			if(instructionObj.passTime <= timeNow){
				console.log("Time passed for instruction (criteria delay)", instructionObj);
				this.emit('instructions:success:end',instructionObj);
				this.emit('instructions:update',timeNow);
			}else{
				this.emit('instructions:success:ticker',instructionObj);
			}
			return true;
		}
		if(passCriteria(instructionObj) ){
			console.log("Criteria passed", instructionObj);
			instructionObj.passTime = timeNow + instructionObj.criteria.delay ;
			this.emit('instructions:success.start',instructionObj);
			/* this should be done by handling the above event 
			this.setInstructionMessage(instructionObj.criteria.success, instructionObj.msgTarget);*/
			return true;
		}
		if(uMath.timedOut(instructionObj) ){
			console.log("Time out for instruction", instructionObj);
			this.emit('instructions:addsequence',instructionObj.criteria.failsequence);
			return true;
		}
	}
	return false;
}




function Instructions(){
	EventEmitter.call(this);
}

// extend eventemitter
util.inherits(Instructions, EventEmitter);

//add publics. 
Instructions.prototype.check = checkInstruction;
Instructions.prototype.pass = passCriteria; // really just making public for more granular tests but could have public use

module.exports = new Instructions();