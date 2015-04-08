var api = require('xLabs-api');
var main = require('./controller/main');
var head = require('./controller/head');
var controls = require('./view/controls');

controls.on('start', main.start);
controls.on('end', main.end);  

api.setup(main, main.onApiReady, main.onApiUpdate);