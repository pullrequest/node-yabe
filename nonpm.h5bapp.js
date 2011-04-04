// author: Sean Caetano Martin (xonecas)
// 
// Rob Righter https://github.com/robrighter/node-boilerplate
// made a node boilerplate, but I find that it does too much
// I like making my own routes, and organize them as I see fit
// this applies for server errors and 404's
// So I made this, a more compact boiler, that will serve static
// files off the shelf (just in case you want to get going quick)
// Everything else is for you to decide
//
// I will keep this up to date with current node and connect versions
// any issues please file a issue
//

var mime = require('./lib/mime'),
connect = require('./lib/connect'),
inspect = require('util').inspect,
renderer = require('./renderer');

// define early so that connect sees them
mime.define({
   'application/x-font-woff': ['woff'],
   'image/vnd.microsoft.icon': ['ico'],
   'image/webp': ['webp'],
   'text/cache-manifest': ['manifest'],
   'text/x-component': ['htc'],
   'application/x-chrome-extension': ['crx']
});


var routes = function (app) {
    
   // your routes go here
   // you can use app.get, app.post, ...
   // the docs are here: http://senchalabs.github.com/connect/middleware-router.html
    
    var curryRoute = function(route) {
        return function(req, res, next){
            console.log('Matching route ', route, ' for ', req.url);
            console.log('params: ', req.params);
            next();
        };
    }, 
    
    addRoute = function(route, r) {
        r = r || curryRoute(route);
        app.get(route, proxy(r, renderer));
    }, 
    
    proxy = function(fn, context) {
        return function() {
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

    // article revisions
    addRoute(/^\/([a-f0-9]{40})\/([a-z0-9_-]+)\/?$/, renderer.article);

   // this must be the last route, its an addition to the static provider
   app.get(':reqPath', function (req, res, next) {
      var reqPath = req.params.reqPath; // connect populates this

      // use this header for html files, or add it as a meta tag
      // to save header bytes serve it only to IE
      if (req.headers.user-agent.indexOf('MSIE') && 
         reqPath.match(/\.html$/) || reqPath.match(/\.htm$/))
         res.setHeader('X-UA-Compatible', "IE=Edge,chrome=1");

      // protect .files
      if (reqPath.match(/(^|\/)\./))
         res.end("Not allowed");

      // control cross domain if you want
      // req.header.host will be the host of the incoming request
      var hostAddress = "example.com",
         reqHost = req.headers.host;

      // allow cross domain (for your subdomains)
      // disallow other domains.
      // you can get really specific by adding the file
      // type extensions you want to allow to the if statement
      if (reqHost.indexOf(hostAddress) === -1)
         res.end("Cross-domain is not allowed");

      next(); // let the static server do the rest
   });
}

// set you cache maximum age, in milisecconds.
// if you don't use cache break use a smaller value
var oneMonth = 1000 * 60 * 60 * 24 * 30;

// start the server
var server = connect.createServer(
   // good ol'apache like logging
   // you can customize how the log looks: 
   // http://senchalabs.github.com/connect/middleware-logger.html
   //connect.logger(),

   // call to trigger routes
   connect.router(routes),

   // set to ./ to find the boilerplate files
   // change if you have an htdocs dir or similar
   // maxAge is set to one month
   connect.static(__dirname, {maxAge: oneMonth})
);

// bind the server to a port, choose your port:
server.listen(3001); // 80 is the default web port and 443 for TLS

// Your server is running :-)
console.log('Node server is running!');

