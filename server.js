// Just a basic server setup for this site
var yabe = require('./lib/node-yabe'),
cluster = require('cluster'),
fs = require('fs'),
config = require('./lib/config');

var log_path = '/var/log/pullrequest';

try {
	fs.mkdirSync(log_path, 755);
} catch (e) {
	if(e.code !== 'EEXIST')
		console.warn("Could not create " + log_path );
}

// bind the server to a port, choose your port:
cluster(yabe)
	.use(cluster.pidfiles())
    .use(cluster.cli())
    .use(cluster.reload(['lib','articles','themes','server.js']))
    .use(cluster.logger( log_path,'debug'))
    .use(cluster.reload())
    .listen(config.port);

console.log('Node server is running! and listening on', config.port);