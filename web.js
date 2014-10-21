"use strict";

/* Nodefly has to be the first item loaded */
if (process.env.NODEFLY_KEY)
{
    require('nodefly').profile(
            process.env.NODEFLY_KEY,
            ['acra-reporting']
    );
}
var express  = require('express');
var util     = require('util');
var url      = require("url");
var fs       = require('fs');
var models   = require('./lib/models');
var mongoose = require('mongoose');
var eson     = require('eson');
var MongoStore = require('connect-mongo')(express);

var app = express();

var routes = [
    "./lib/routes/base",
    "./lib/routes/api"
];

/* Config */

var config = eson()
    .use(eson.ms)
    .use(eson.args())
    .use(eson.env(""))
    .use(eson.include)
    .use(eson.dimensions)
    .use(eson.replace('{root}', __dirname))
    .read('./config.json');

/* Connect to mongose */
mongoose.connection.on('error', console.error.bind(console, 'connection error:'));
mongoose.connection.once('open', function callback () {
    startExpress();
});
mongoose.connect(config.mongo_url);


/* Callback after everything else is connected  to start express */
var startExpress = function(db) {

    app.configure(function() {
        app.engine('ejs', require('ejs-locals'));
        app.use(express.logger());
        app.use(express['static'](__dirname + '/public'));
        app.use(express.bodyParser());
        app.use(express.cookieParser());
        app.use(express.session({
            secret: config.session_secret,
            store: new MongoStore({
                mongoose_connection: mongoose.connection
            })
        }));
        // http://www.senchalabs.org/connect/favicon.html
        app.use(express.favicon());
        app.use(function(req,res,next) {
            res.locals.title = null;
            res.locals.current_path = req.path;
            res.locals.user = null;
            if (req.session.email)
            {
                res.locals.user = {
                    email: req.session.email
                };
            }
            res.locals.ga = config.google_analytics_key;
            next();
        });
        routes.forEach(function(r) {
            console.log("Now loading route: ", r);
            app.use(require(r));
        });
        require("express-persona")(app, {
              audience: config.base_url
        });
        app.use(app.router);

    });

    app.configure('development', function(){
        var expressError = require('express-error');
        app.use(expressError.express3({contextLinesCount: 3, handleUncaughtException: true}));
    });

    // listen to the PORT given to us in the environment
    app.listen(config.port, function() {
        console.log("Listening on " + config.port);
    });
};
