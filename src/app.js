var api = require('xLabs-api');
var Main = require('./controller/main');
var controls = require('./view/controls');

var m = new Main();

api.setup(m, m.onApiReady, m.onApiUpdate);

controls.on('start',m.start);
controls.on('end',m.end);