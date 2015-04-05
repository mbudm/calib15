var Api = require('xLabs-api');
var Main = require('./controller/main');
var controls = require('./view/controls');

Api.setup(main, main.onApiReady, main.onApiUpdate);

controls.on('start', main.start);
controls.on('end', main.end);  