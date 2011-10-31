var app = require('../app'),
    assert = require('assert'),
    zombie = require('zombie'),
    events = require('events'),
    testHelper = require('./helper');

app.listen(3005);

testHelper.models = [app.Punch];

testHelper.setup(function() {
  
});

testHelper.tests = {
  'POST /punches.json': function(assert) {
    assert.response(app, {
      url: '/punches.json',
      method: 'POST',
      data: JSON.stringify({ punch: { punchIn: '2011-11-01 01:01:01', punchOut: '2011-11-01 02:02:02', notes: 'test notes' }}),
      headers: { 'Content-Type': 'application/json' }
    }, {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    },

    function(res) {
      var punch = JSON.parse(res.body);
      assert.equal('test notes', punch.notes);
    });
    testHelper.end();
  }

};

