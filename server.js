
// author: Sean Caetano Martin (@xonecas)


var mime = require('mime');

mime.define({
   'application/x-font-woff': ['woff'],
   'image/vnd.microsoft.icon': ['ico'],
   'image/webp': ['webp'],
   'text/cache-manifest': ['manifest'],
   'text/x-component': ['htc'],
   'application/x-chrome-extension': ['crx']
});

var connect = require('connect'),
   io = require('socket.io'),
   fs = require('fs'),
   http = require('http'),
   _ = require('underscore'),
   inspect = require('util').inspect;

var header = fs.readFileSync(__dirname +'/htdocs/header.html', 'utf8'),
   footer = fs.readFileSync(__dirname +'/htdocs/footer.html', 'utf8'),
   cache = false;

function wget (host, path, https, callback) {
   var port = (https)? 443: 80, 
      client = http.createClient(port, host, https),
      request = client.request('get', path, { 'host': host }),
      response_body = '';

   request.end();
   request.on('response', function (response) {
      response.on('data', function (chunk) {
         response_body += chunk;
      });
      response.on('end', function () {
         callback(response_body);
      });   
   });
}


var routes = function (app) {
   app.get('/', function (req, res, next) {
      fs.readFile(__dirname +'/htdocs/index.html', 'utf8', function (err, body) {
         if (err) throw err;

         body = header + body + footer;

         res.writeHead(200, { 
            'content-type': 'text/html',
            'content-length': body.length
         });
         res.end(body);
      });
   });

   app.get('/nodeboiler', function (req, res, next) {
      fs.readFile(__dirname +'/htdocs/nodeboiler.html', 'utf8', function (err, html) {
         //https://github.com/xonecas/node-boiler/raw/master/server.js
         fs.readFile(__dirname +'/htdocs/assets/nodeboiler.js', 'utf8', function (err, code) {
            if (err) throw err;      

            var body = _.template(header+html+footer, { file: code });

            res.writeHead(200, { 
               'content-type': 'text/html',
               'content-length': body.length
            });
            res.end(body);
         });
      });
   });

   app.get('/whatishtml5', function (req, res, next) {
      fs.readFile(__dirname +'/htdocs/whatishtml5.html', 'utf8', function (err, body) {
         if (err) throw err;

         body = header + body + footer;
         
         res.writeHead(200, { 
            'content-type': 'text/html',
            'content-length': body.length
         });
         res.end(body);
      });
   });
     
   app.get('/getTweet', function (req, res, next) {
      function respond (json) {
         if (json) 
            var randomizer = Math.floor(Math.random()*json.length),
               tweet = json[randomizer].text;
         else
            tweet = "Twitter is not cooperating. *shakes fist*";
         
         res.writeHead(200, { 
            'content-type': 'text/plain',
            'content-length': tweet.length
         });
         res.end(tweet);
      }

      if (!cache) {
         wget('api.twitter.com', 
            '/1/statuses/user_timeline.json?screen_name=xonecas&count=20',
            false, function (json) { try {
               cache = JSON.parse(json);
            } catch (err) { cache = false; };
            respond(cache);
         });
      }
      else {
         respond(cache)
      }
   });

   app.get('/hello/raisa', function (req, res, next) {
      req.url = '/chat.html';
      next();
   });



   // this must be the last route, its an addition to the static provider
   app.get('*', function (req, res, next) {
      var reqPath = req.url;

      if (reqPath.match(/backTile/)) {
         req.url = (Math.random() > 0.5)? 
            '/images/plad.png': '/images/tile.png'; 
      }

      var userAgent = req.headers['user-agent'];
      if (userAgent && userAgent.indexOf('MSIE') && 
         reqPath.match(/\.html$/) || reqPath.match(/\.htm$/))
         res.setHeader('X-UA-Compatible', "IE=Edge,chrome=1");

      // protect .files
      if (reqPath.match(/(^|\/)\./))
         res.end("Not allowed");

      var hostAddress = "xonecas.com",
         reqHost = req.headers.host;

      if (reqHost.indexOf(hostAddress) === -1)
         res.end("Cross-domain is not allowed");

      next(); // let the static server do the rest
   });
}

var oneMonth = 1000 * 60 * 60 * 24 * 30;

var server = connect.createServer(
   connect.logger(),
   connect.router(routes),
   connect.static(__dirname+'/htdocs', {maxAge: oneMonth})
);

server.listen(80); // 80 is the default web port and 443 for TLS


// socket.io 
var socket = io.listen(server); 
socket.on('connection', function(client){ 
   // new client is here! 
   client.on('message', function(data) { 
      data = JSON.parse(data);
      console.log(inspect(data)); 
      
      if (data.joined) {
         data.author = 'system';
         data.color = '#999';
         data.text = data.joined +" has joined";
      }
      else if (data.leaving) {
         data.author = 'system';
         data.text = data.leaving +" has left";
      }

      socket.broadcast(data);
   }) 
   //client.on('disconnect', function(){ … }) 
}); 



console.log('Node server is running!');

// this is not the best way...
process.on('uncaughtException', function (err) {
   console.log('Caught exception: ' + err);
});