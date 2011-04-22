var mime = require('mime'),
connect = require('connect'),
inspect = require('util').inspect,
config = require('./config'),
renderer = require('./lib/renderer')(config);

// define early so that connect sees them
mime.define({
    'application/x-font-woff': ['woff'],
    'image/vnd.microsoft.icon': ['ico'],
    'image/webp': ['webp'],
    'text/cache-manifest': ['manifest'],
    'text/x-component': ['htc'],
    'application/x-chrome-extension': ['crx']
});

var routes = function(app) {

    var defaultHandler = function(route) {
        return function(req, res, next) {
            console.log('Matching route ', route, ' for ', req.url);
            console.log('params: ', req.params);
            next();
        };
    },

    addRoute = function(route, r) {
        r = r || defaultHandler(route);
        app.get(route, proxy(r, renderer));
    },

    proxy = function(fn, context) {
        return function(req, res, next) {
            return fn.apply(context, arguments);
        };
    };

    // index
    addRoute('/', renderer.index);

    // rss feed
    addRoute('/feed.xml', renderer.feed);

    // category/tags support
    addRoute('/category/:category', renderer.category);

    // article
    addRoute('/article/:post', renderer.article);

    // this must be the last route, its an addition to the static provider
    app.get('*', function(req, res, next) {
        var reqPath = req.url,
        userAgent = req.headers['user-agent'],
        reqHost = req.headers.host;
        
        if (userAgent && userAgent.indexOf('MSIE') && reqPath.match(/\.html$/) || reqPath.match(/\.htm$/)) {
          // use this header for html files, or add it as a meta tag
          // to save header bytes serve it only to IE
          res.setHeader('X-UA-Compatible', "IE=Edge,chrome=1"); 
        }

        // protect .files
        if (reqPath.match(/(^|\/)\./)) {
          return res.end("Not allowed"); 
        }

        // allow cross domain (for your subdomains)
        // disallow other domains.
        // you can get really specific by adding the file
        // type extensions you want to allow to the if statement
        if (reqHost && !reqHost.match(config.hostAddress)) {
          return res.end("Cross-domain is not allowed"); 
        }

        next();
        // let the static server do the rest
    });
};

// set you cache maximum age, in milisecconds.
// if you don't use cache break use a smaller value
var oneMonth = 1000 * 60 * 60 * 24 * 30;

// start the server
var server = connect.createServer(
  // good ol'apache like logging
  // you can customize how the log looks:
  // http://senchalabs.github.com/connect/middleware-logger.html
  connect.logger(),
  
  // call to trigger routes
  connect.router(routes),

  // set to ./ to find the boilerplate files
  // change if you have an htdocs dir or similar
  // maxAge is set to one month
  connect.static([__dirname, config.themeDir, config.theme, 'public'].join('/'), {maxAge: oneMonth})
);

// bind the server to a port, choose your port:
server.listen(config.port);
// 80 is the default web port and 443 for TLS
// Your server is running :-)
console.log('Node server is running! and listening on ', config.port);

// this is a failsafe, it will catch the error silently and logged it the console
// while this works, you should really try to catch the errors with a try/catch block
// more on this here: http://nodejs.org/docs/v0.4.3/api/process.html#event_uncaughtException_
process.on('uncaughtException', function (err) {
   console.log('Caught exception: ' + err);
});

