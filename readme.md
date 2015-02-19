Modules
=======


# config

## head
* pitchMaxProp: "down"
* pitchMinProp: "up"
* pitchProp: "kvHeadY"
* yawMaxProp: "left"
* yawMinProp: "right"
* yawProp: "kvHeadX"

	
	
# controllers

## main
* isTracking: false
* update: function (state){
* onApiState: function ( state ){
* setup: function (){
* start: function (e,mainInstructions, subSequences){
* stopCalibration: function (){
	
### dependencies
* document ("xLabsApiReady","xLabsApiState)

### listeners
* util.proxy ("xlabson", "xlabsoff")
* "update"
    * controller.gaze
    * controller.instructions



## instructions
* setUpInstructions: function (){
* checkInstructions: function (){
* fireCriteriaSuccessEvent: function (instructionObj){
* instructionsStart: function (){
* passCriteria: function (instructionObj){

### dependencies
* controller.main ("start","update", "stop")
* model.sequenceSet ("instruction.next")
* controller.head ("categorisePitch") // services
* controller.gaze ("gazeAccuracy", "gazeMovement") // services
* controller.feedback ("checkEnvironment") // service
* model.movingAverages ("pitch", "yaw", "gazeScore")
* util.math ("timedOut") //service

### listeners
* instruction.timeelapsed
* instruction.task.*
* instruction.message
* instruction.criteria.time.pass
    * "util.proxy"
* instruction.criteria.pass
* instruction.criteria.fail
* instruction.time.fail


	
## gaze
* errorThreshold: 0.33
* statusProperties: Object
* gazeAccuracy: function (ma){
* gazeMovement: function (ma){
* getGazeTrackingStatus: function (state){
* updateGazeDotPosition: function (){

### dependencies
* controller.main ("update")
* model.movingAverages
* model.calibPoint
* util.document

### listeners
* view.gazeDot (gaze.position)
	
## head
* categoriseAxis: function (axis,val,proportion){
* categorisePitch: function (pitch){
* categoriseYaw: function (yaw){
* getAxisRange: function (axis){
* normaliseAxis: function (axis,val){
* positionUserHead: function (pitch,yaw){
* thresholdProportion:0.5
* pitchRange: 0.2
* yawRange: 0.3
* scaleErrorLevel: 0.05 // probably deprecate now there is free head movement

* updateErrorState: function (){ // deprecate ??

	
## feedback
setupFeedback: function (){
updateFeedback: function (){
updateFeedbackStatus: function (msgList){
validationCheckThreshold: 0.5
validationCheckErrors: Array[2]
validationErrors: Array[5]
checkEnvironment: function (ma){
	
## simulate
simulateStart: function (data,e,calibInstructions,seq){
simulateStop: function (){
simulateTimeout: function (){
	
	
	
# models

## kvState
lastState: null
getFps: function (){
gazePos:[]
headPos:[]
validation (f,u, p // position - calculated )	
gazeScore:[]
updateStores: function (){

## movingAverages
movingAverages: Array[5]
gazePos:{x,y)
headPos:{pitch, yaw)
validation:{f,u,p} // position - calculated 
parseValidationErrors: function (errors){
updateMovingAverages: function (){
	
## currentCenter: {pitch, yaw}
setCaptureCenter: function (bool){
	
## calibPos (pitch, yaw)
calibPoint: null
updateCalibPoint: function (t1,t2){

## instruction
getMessageClasses: function (instructionObj){

## feedbackStatusMessage
feedbackStatusMessages: Object
getFeedbackStatusMessage: function (msgObj){

## sequence
incrementInstructionIdx: function (){
	
## sequenceSet
seqIndices: Array[0]
sequences: Array[0]
instructionsSetup: function (mainInstructions,subSequences){
getCurrentInstruction: function (){
getInstructionIdx: function (){
getInstructions: function (){
setInstructionIdx: function (n){
addSequence: function (seq){
updateInstructions: function (){
	


# views

## message
msgBaseCls: "calibDot--message"
msgPositions: "screenMessage-bottom"
setMessage: function (msg, target){
setMessageVisible: function (bool){
adjustMessagePosition: function (height){
	
## video
videoUrl: "http://localhost:9523/video?"

## calibDot
calibDotPositions: "calibDot-topleft calibDot-topright calibDot-bottomleft calibDot-bottomright calibDot-center"
calibMessageClasses: "calibDot--message-up calibDot--message-right calibDot--message-down calibDot--message-left calibDot--message-center"
setCalibPosition: function (param){
setCalibVisible: function (bool){
### message

## headDot
uHeadClsDown: "calibDot--userHead-down"
uHeadClsLeft: "calibDot--userHead-left"
uHeadClsRight: "calibDot--userHead-right"
uHeadClsUp: "calibDot--userHead-up"

## gazeDot
setGazeDotVisible: function (bool){

## feedback
showFeedback: function (bool){
### video
### message

##help
showHelp: function (bool){


## util

### proxy
debug: null
simulate: null

calibrate: function (){

debugMode: function (bool){
off: function (){
on: function (){
sendCalibrationData: function (calibPoint, calibrate){
simMode: function (bool){

## math
getAccumulatedAverage: function (arr, prevAvg){
getAdjustedAverage: function (pushed, shifted, prevAvg, len){
getArrayAverage: function (arr){
getArrayVal: function (mathProp, arr){
isNumeric: function (val){
lineDistance: function (xs,ys){
timedOut: function (instructionObj){ // change arguments to start,expire
	
## document
offsetX: 0
offsetY: 0
getDistanceThreshold: function(t){}

## debugger
log:[]
logState: function (data){
printMe: function (v){
printObj: function (o, specificProps){



/*

	//unused
	
	//methods

	updateThresholds: function (){
	getBodyClasses: fthis.getCurrentInstruction()Obj){

	getDistanceThreshold: function (t){

	// props

	calibDotMovingAverage: 0  
	snap: Object
	positionCheckThreshold: 0.5
	thresholds: Object
	limits: Object


*/