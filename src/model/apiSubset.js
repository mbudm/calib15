var model = require('model'),
		util = require('util');
		
		//statics - externalise

		var validationErrors =['d', 'b', 'f', 'r', 'u']; // lowercase versions of what comes through in data.validation.errors

var calculateGazeScore = function calculateGazeScore(apiData){
	/* works out the gaze score 0 - 1. Higher the better. */
		var sumStatus = 0,
			len = 2;
		
		if(apiData.state.trackingSuspended === 1){
			sumStatus += 1;
		}
		if(apiData.validation.errors.length > 0){
			sumStatus += apiData.validation.errors.length/validationErrors.length;

		}
		return sumStatus / len;
}


function apiSubset(){
	this.property('gazeX', 'number', {required: true});
  this.property('gazeY', 'number', {required: true});
  this.property('headX', 'number', {required: true});
  this.property('headY', 'number', {required: true});
	this.property('gazeScore', 'number', {required: true});
	
	this.parseApi = function(apiData){
		return this.create({
			gazeX : apiData.state.gaze.estimate.x,
			gazeY : apiData.state.gaze.estimate.y,
			headX : apiData.state.head.x,
			headY : apiData.state.head.y,
			gazeScore : calculateGazeScore(apiData)
		});
	}
}

ApiSubset = model.register('ApiSubset', apiSubset);
/*
ApiSubset.prototype.parseApi = function(apiData){
		this.gazeX = apiData.state.gaze.estimate.x
		this.gazeY = apiData.state.gaze.estimate.y
		this.headX = apiData.state.head.x
		this.headY = apiData.state.head.y
		this.gazeScore = calculateGazeScore(this);
}
*/

module.exports = ApiSubset;