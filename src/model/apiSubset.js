var model = require('model'),
		apiBase = require('./apiBase');
		

function ApiSubset(){
	apiBase.apply(this, arguments);
}

ApiSubset = model.register('ApiSubset', ApiSubset);
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