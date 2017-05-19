    var   express       = require('express')
    , bodyParser        = require('body-parser')
    , passport          = require('passport')
    , flash             = require('connect-flash')
    , logger            = require('morgan')
      config            = require('./config/database')
    , port              = process.env.PORT || 4444
    , app               = express()
    , mongoose          = require('mongoose')
    , slug              = require('slug')
    , jwt               = require('jwt-simple');
    


// configuration ===============================================================
// connect to our database

mongoose.connect(config.database);
var db = mongoose.connection;

var models = require('./config/models')(mongoose);

var dbQueries = require('./config/dbQueries.js')(models, slug); // pass passport for configuration
require('./config/passport-jwtl')(passport, models, dbQueries, config); // pass passport for configuration



//app.use(logger('dev'));
app.use(bodyParser.urlencoded({
  extended: false,
  limit: '50mb'
}));
app.use(bodyParser.json({
  limit: '50mb'
}));


// required for passport
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});

app.use(passport.initialize());
app.use(flash()); // use connect-flash for flash messages stored in session

app.set('view engine', 'pug');

app.use('/static', express.static(__dirname + '/static'));

require('./app/routes.js')(app, passport, dbQueries, config);

app.listen(port, function () {
  console.log('Listening on http://localhost:' + (process.env.PORT || 4444))
});


