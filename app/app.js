var api = require('./node_modules/xLabsApi');

api.setup(this, function(){
	console.log('api ready');
}, function(data){
	console.log('api data', data);
})