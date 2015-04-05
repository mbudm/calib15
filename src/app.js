var api = require('xLabs-api');
var Main = require('./controller/main');
var controls = require('./view/controls');

var m  = new Main();

api.setup(main, main.onApiReady, main.onApiUpdate);

controls.on('start', main.start);
controls.on('end', main.end);  