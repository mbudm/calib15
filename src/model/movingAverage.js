var mth = require('../util/math'),
		model = require('model'),
		apiBase = require('./apiBase');

//private
var maSizeList = [3,5,8,10,15],
		maLib = [];
	
		
	/*
		look up model docs to create a MovingAverageModel that extends ApiSubset
		with the additon of a size property
		*/
		
function MovingAverage (){
  // Does all the stuff in Item as if it was a Pizza
  apiBase.apply(this, arguments);

	this.property('size', 'number', {required: true});
}



MovingAverage = model.register('MovingAverage', MovingAverage);


/*
MovingAverageModel.prototype.size = null;

util.inherits(MovingAverageModel, model.get('') );

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

		*/

module.exports = MovingAverage; 