/* Dependencies */
var util = require('util');
var cfg = require('../config');

//private

var maModel;


function cat (axis,ma){
	var cat = headCfg.categories.CENTER;
	if(maModel){
		var val = maModel.get(axis,ma),
				prop = (proportion || headCfg.thresholdProportion ),
				threshRange = headCfg[axis+'Range'] - (prop * headCfg[axis+'Range']);
		if(val <= headCfg.currentCenter[axis] - threshRange){
			cat = headCfg[axis+'MinProp'];
		}else if(val >= headCfg.currentCenter[axis] + threshRange){
			cat = headCfg[axis+'MaxProp'];
		}
	}
	return cat;
}


//constructor

function Head(){}

//public

Head.prototype = {
	onMovingAverageModelReady:function(model){
		maModel = model;  
	},
	categorisePitch:function(ma){
		return cat('pitch',ma);
	},
	categoriseYaw:function(ma){
		return cat('yaw',ma);
	}
};


module.exports = new Head();