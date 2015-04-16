var test = require('tape-catch');
var instructions = require('../../../src/controller/instructions');

test('instructions exists', function (t) {
    t.ok(instructions,'instructions exists');
    t.end();
});

test('instructions event emitter ok', function (t) {
		t.plan(3);
		t.ok(instructions.on, 'instructions.on public method exists');
		t.ok(instructions.once, 'instructions.removeListener public method exists');
		t.ok(instructions.removeListener, 'instructions.removeListener public method exists');
});

/* 

setUpInstructions: function (){
* checkInstructions: function (){
* fireCriteriaSuccessEvent: function (instructionObj){
* instructionsStart: function (){
* passCriteria: function (instructionObj){

*/