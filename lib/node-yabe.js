var mime = require('mime'),
connect = require('connect'),
inspect = require('util').inspect,
config = require('./config'),
routes = require('./routes');

// define early so that connect sees them
mime.define({
    'application/x-font-woff': ['woff'],
    'image/vnd.microsoft.icon': ['ico'],
    'image/webp': ['webp'],
    'text/cache-manifest': ['manifest'],
    'text/x-component': ['htc'],
    'application/x-chrome-extension': ['crx']
});

// create and expose the server
module.exports = connect.createServer(
  // good ol'apache like logging
  // you can customize how the log looks:
  // http://senchalabs.github.com/connect/middleware-logger.html
  connect.logger(),
  
  // call to trigger routes
  connect.router(routes),

  // set to ./ to find the boilerplate files
  // change if you have an htdocs dir or similar
  // maxAge is set to one month
  connect.static([process.cwd(), config.themeDir, config.theme, 'public'].join('/'), {
    
    // set you cache maximum age, in milisecconds.
    // if you don't use cache break use a smaller value
    maxAge: 1000 * 60 * 60 * 24 * 30
  })
);

// this is a failsafe, it will catch the error silently and logged it the console
// while this works, you should really try to catch the errors with a try/catch block
// more on this here: http://nodejs.org/docs/v0.4.3/api/process.html#event_uncaughtException_
process.on('uncaughtException', function (err) {
   console.log('Caught exception: ' + err);
});

