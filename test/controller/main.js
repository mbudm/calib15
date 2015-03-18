var test = require('tape');
var main = require('../../src/controller/main');
 
test('main', function (t) {
    t.plan(3);
    t.equal(1+1, 2);
    t.ok(true);
    t.ok(main);
});