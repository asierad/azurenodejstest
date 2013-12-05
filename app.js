
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var runtests = require('./routes/runtests');
var http = require('http');
var path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.engine('html',require('consolidate').hogan);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/runtests', function(request, response, next) {
    requrl = require('url').parse(request.url);
    data = requrl.query ? JSON.parse(decodeURI(requrl.query)) : null;
    request.jsondata = data;
    next();
    });
app.post('/runtests', function(request, response, next) {
    data = request.body.model ? request.body.model : null;
    request.jsondata = data ? JSON.parse(data) : null;
    next();
    });
app.get('/', routes.index);
app.all('/runtests', runtests.run);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
