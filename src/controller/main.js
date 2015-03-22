/*

## main
* isTracking: false
* update: function (state){
* onApiState: function ( state ){
* setup: function (){
* start: function (e,mainInstructions, subSequences){
* stopCalibration: function (){
	
### dependencies (listens to)
* xLabsApi

### listeners
* util.proxy ("xlabson", "xlabsoff")
* "update"
    * controller.gaze
    * controller.instructions

*/

/* Dependencies */
var util = require('util');
var EventEmitter = require('events').EventEmitter;

/* Properties */
var isTracking, isSetup, isStarted = false;


/* Private Methods */

/* Public methods */
var setup = function(){
	isSetup = true;
};

var update = function(data){
	if(isStarted && isSetup && data.system.mode === "training" &&  !data.state.trackingSuspended){
		if(!isTracking){
			isTracking = true;
			this.emit('tracking-on');
		}
		this.emit('tracking-update',data);
	}else if(isTracking){
		isTracking = false;
		this.emit('tracking-off');
	}
};

var startCalibration = function(){	
	isStarted = true;
};
var stopCalibration = function(){
	isStarted = false;
};

var getIsTracking = function(){
	return isTracking;
};


function Main(){}

// extend eventemitter
util.inherits(Main, EventEmitter);

//add publics. Todo: map the prototype?
Main.prototype.isTracking = getIsTracking;
Main.prototype.onApiUpdate = update;
Main.prototype.onApiReady = setup;
Main.prototype.start = startCalibration;
Main.prototype.end = stopCalibration;

module.exports = Main;