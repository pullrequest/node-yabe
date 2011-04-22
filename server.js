// Just a basic server setup for this site
var yabe = require('./lib/node-yabe'),
config = require('./lib/config');

yabe.listen(config.port);

console.log('Node server is running! and listening on', config.port);