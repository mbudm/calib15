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
var EventEmitter = require('event-emitter');

var ee = new EventEmitter();

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
			ee.emit('tracking-on');
		}
		ee.emit('tracking-update',data);
	}else if(isTracking){
		isTracking = false;
		ee.emit('tracking-off');
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

var on = function(t,l){
	ee.on(t,l);
}

var off = function(t,l){
	ee.removeListener(t,l);
}

var once = function(t,l){
	ee.once(t,l);
}

module.exports = {
	on:on,
	off:off,
	once:once,
	isTracking:getIsTracking,
	onApiUpdate:update,
	onApiReady:setup,
	start:startCalibration,
	end:stopCalibration
};