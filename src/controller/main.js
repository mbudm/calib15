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

var ee = new EventEmitter;

/* Properties */
var isTracking = false;


/* Private Methods */
var setup = function(){
	
};
var update = function(){
	
	ee.emit('update');
};

var startCalibration = function(){
	
	ee.emit('xlabson'); // will come from the view?
};
var stopCalibration = function(){
	
	ee.emit('xlabsoff'); // will cme from the view?
};

/* Public methods */
var getIsTracking = function(){
	return isTracking;
};
var onApiState = function(eName,callback,scope){
	
};
var onApiReady = function(eName,callback,scope){
	
};

module.exports = {
	on:ee.on,
	off:ee.off,
	once:ee.once,
	isTracking:getIsTracking,
	onApiUpdate:update,
	onApiReady:onApiReady,
	start:startCalibration,
	end:stopCalibration
};