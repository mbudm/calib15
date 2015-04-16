var rqrSrc = require('rqr').withPrefix('src'),
    mth = rqrSrc('util/math'),
		apiStore = rqrSrc('store/apiStore'),
		_ = require('underscore'),
		util = require('util');

//private
var maSizeList = [3,5,8,10,15],
		maLib = [];
function MovingAverageModel (maSize){
	this.size = maSize;
}
MovingAverageModel.prototype.size = null;

util.inherits(MovingAverageModel, apiStore.getApiModel() );

for(var i = 0; i < maSizeList.length; i++){
	maLib.push( new MovingAverageModel(maSizeList[i]));
}

function getMovingAverage(maModel, prop){
	//if api store hasenough history to cover maModel.size then calculate the ma for this prop
	
}

apiStore.on('update',function(data){
	//update moving averages
	for(var i = 0; i < maLib.length; i++){
		_.each(apiStore.getApiModel().prototype,function(p){
			maLib[i][p] = getMovingAverage(maLib[i],p);
		});
	}
});

//publics
var MovingAverages = {
  getProp: function(prop,ma){
  	if(maLib[ma] && ma[ma][prop]){
  		return maLib[ma][prop]
  	}
  }
};


module.exports = MovingAverages; //shared state across all instances. Not a singleton pattern as it's an instance of a static object, not a class.