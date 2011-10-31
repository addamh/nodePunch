
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


// Error Handling

function NotFound(msg) {
  this.name = 'NotFound';
  Error.call(this, msg);
  Error.captureStackTrace(this, arguments.callee);
}


sys.inherits(NotFound, Error);

app.get('/404', function(req, res) {
  throw new NotFound;
});

app.get('/500', function(req, res) {
  throw new Error('An unexpected error');
});

app.error(function(err, req, res, next) {
  if (err instanceof NotFound) {
    res.render('404.jade', { status: 404 });
  } else {
    next(err);
  }
});

if (app.settings.env == 'production') {
  app.error(function(err, req, res) {
    res.render('500.jade', {
      status: 500,
      locals: {
        error: err
      } 
    });
  });
}

//Routes

app.get('/', routes.index);


// Return list of all Punches
app.get('/punches.:format?', function(req, res) {
  Punch.find({},function(err, punches) {
      res.send(punches); 
  });
}); 

// Create new Punch
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


// Update Punch
app.put('/punches/:id.:format?', function(req, res, next) {
  Punch.findOne({ _id: req.params.id }, function(err, p) {
    if (!p) return next(new NotFound('Punch not found'));
    p.punchIn = req.body.punchIn;
    p.punchOut = req.body.punchOut;
    p.notes = req.body.notes;
    p.tags = req.body.tags;

    p.save(function(err) {
      switch (req.params.format) {
        case 'json':
          res.send(p.toObject());
        break;

        default:
          req.flash('info', 'Punch Updated');
          res.direct('/punches');
      }
    });
  });
});

// Delete Punch
app.del('/punches/:id.:format?', function(req, res, next) {
  Document.findOne({ _id: req.params.id }, function(err, p) {
    if (!p) return next(new NotFound('Punch not found'));

    p.remove(function() {
      switch (req.params.format) {
        case 'json':
          res.send('true');
        break;

        default:
          req.flash('info', 'Punch deleted');
          res.redirect('/punches');
      } 
    });
  });
});

if(app.settings.env == 'production'){
app.listen(43014);
} else {
app.listen(3000);
}

if (!module.parent) {
  console.log('Express server listening on port %d, environment: %s', app.address().port, app.settings.env)
  console.log('Using connect %s, Express %s, Jade %s', connect.version, express.version, jade.version);
}
