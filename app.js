
/**
 * Module dependencies.
 */

var express = require('express'),
    connect = require('connect'),
    jade = require('jade'),
    app = module.exports = express.createServer(),
    mongoose = require('mongoose'),
    mongoStore = require('connect-mongodb'),
    sys = require('sys'),
    path = require('path'),
    models = require('./models/punch_models.js'),
    db,
    Punch,
    User,
    LoginToken,
    Settings = { development: {}, test: {}, production: {} },
    routes = require('./routes');

var app = module.exports = express.createServer();

app.configure('development', function() {
  app.set('db-uri', 'mongodb://localhost/nodePunch-development');
  app.use(express.errorHandler({ dumpExceptions: true }));
});

app.configure('test', function() {
  app.set('db-uri', 'mongodb://localhost/nodePunch-test');
});

app.configure('production', function() {
  app.set('db-uri', 'mongodb://localhost/nodePunch-production');
});

// Models
models.defineModels(mongoose, function() {
  app.Punch = Punch = mongoose.model('Punch');
  db = mongoose.connect(app.set('db-uri'));
})

// Configuration

app.configure(function(){
  app.use(express.logger());
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

// Routes

app.get('/', routes.index);

app.get('/punches.:format?', function(req, res) {
  Punch.find({},function(err, punches) {
      res.send(punches); 
  });
}); 

app.get('/shit', function(req, res){
  res.send('bullshit');
});

app.post('/punches.:format?', function(req, res) {
  var punch = new Punch(req.body.punch);
  punch.save(function() {
    switch (req.params.format) {
      case 'json':
        var d = punch.toObject();
        d.id = d._id;
        res.send(d);
      break;

      default:
        res.redirect('/punches');
    }
  });
});

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
