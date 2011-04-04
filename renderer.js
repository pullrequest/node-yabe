var fs = require('fs'),
jqtpl = require('./lib/node-jqtpl'),
markdown = require('./lib/markdown');

var Renderers = module.exports = (function(o) {
    
    // Cache templates on application startup
    var addTemplate = function(file) {
        fs.readFile(__dirname + '/themes/default/' + file + '.html', 'utf8', function(err, tmpl) {
            if (err) throw err;
            
            jqtpl.template('tmpl.' + file, tmpl);
        });   
    };
    
    addTemplate('layout');
    
    return {
        index: function(req, res, next) {
            console.log('index', this);
            next();
        },
        
        category: function(){},
        
        article: function(req, res, next){
            console.log('article ', req.params, __dirname);
            
            var article = req.params.post + '.markdown';
            
            fs.readFile(__dirname + '/articles/' + article, 'utf8', function (err, body) {
                if (err) return next(err);
                
                var result = jqtpl.tmpl('tmpl.layout', {content: markdown.encode(body)});
                
                res.writeHead(200, { 
                    'content-type': 'text/html',
                    'content-length': result.length
                });
                res.end(result);
                
            });
        },
        feed: function(){}
    }
});