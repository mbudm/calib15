var api = require('xLabs-api');

api.setup(this, function(){
	console.log('api ready');
}, function(data){
	console.log('api data', data);
})