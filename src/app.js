var api = require('xLabs-api');
var main = require('./controller/main');
var controls = require('./view/controls');

api.setup(main, main.onApiReady, main.onApiUpdate);

controls.on('start',main.start);
controls.on('end',main.end);