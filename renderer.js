var fs = require('fs'),
jqtpl = require('./lib/node-jqtpl'),
Markdown = require('./lib/markdown'),
prettify = require('./lib/prettify'),
QueryString = require('querystring'),
res = require('http').ServerResponse.prototype;

res.render = function(target, data, force) {
  
  var partial = jqtpl.tmpl('tmpl.' + target, data),
  layout = !force ? jqtpl.tmpl('tmpl.layout', {content: partial}) : partial;
  
  // prettify snippets of code
  layout = layout.replace(/<pre><code>[^<]+<\/code><\/pre>/g, function (code) {
    code = code.match(/<code>([\s\S]+)<\/code>/)[1];
    code = prettify.prettyPrintOne(code);
    return "<pre><code>" + code + "</code></pre>";
  });
  
  // with feeds, the ' escape made it non valid feed.
  layout = layout.replace(/&#39/g, "'");
  
  this.writeHead(200, { 
      'Content-Type': target === "feed.xml" ? 'application/rss+xml' : 'text/html',
      'Content-Length': layout.length
  });
  
  this.end(layout);
};


var Renderers = module.exports = (function(o) {
    
    // Cache templates on application startup
    var parseProps = function(markdown) {
      var props = { };

      // Parse out headers
      var match;
      while(match = markdown.match(/^([a-z]+):\s*(.*)\s*\n/i)) {
        var name = match[1].toLowerCase(),
            value = match[2];
        markdown = markdown.substr(match[0].length);
        props[name] = value;
      }
      props.markdown = markdown;

      if(props.categories !== undefined) {
        props.categories = props.categories.split(',').map(function(element){ 
          return QueryString.escape(element.trim());
        });
      }
      
      return props;
    },
    
    addTemplate = function(file) {
        var filename = /\./.test(file) ? file : file + '.html'; 
        fs.readFile(__dirname + '/themes/default/' + filename, 'utf8', function(err, tmpl) {
            if (err) throw err;
            jqtpl.template('tmpl.' + file, tmpl);
        });   
    };
    
    addTemplate('layout');
    addTemplate('article');
    addTemplate('index');
    addTemplate('feed.xml');
    
    return {
        index: function(req, res, next, cb) {
        
          var render = function(articles) {
            articles.sort(function(a, b) {
              return (Date.parse(b.date)) - (Date.parse(a.date));
            });
            
            if(cb ){
                return cb(articles);
            }
            
            res.render('index', {
              articles: articles
            });
          };
          
          fs.readdir(__dirname + '/articles/', function(err, results) {
            var files = [],
            articles = [];
          
            results.forEach(function(filename, i) {
              if (!(/\.markdown$/.test(filename))) {
                return;
              }
              
              files.push(filename);
            });
            
            
            ln = files.length - 1;
            files.forEach(function(filename, i) {
              if (!(/\.markdown$/.test(filename))) {
                return;
              }

              fs.readFile(__dirname + '/articles/' + filename, function(err, markdown) {
                var props;
                if (err) throw err;

                if (typeof markdown !== 'string') {
                  markdown = markdown.toString();
                }

                props = parseProps(markdown);
                props.name = filename.replace('.markdown', '');
                props.markdown = Markdown.encode(props.markdown.substr(0, props.markdown.indexOf("##")));
            
                articles.push(props);
                
                if(i === ln) {
                  render(articles);
                }
              });
            });
          });
        },
        
        category: function() {},
        
        article: function(req, res, next) {
            var article = req.params.post + '.markdown';
            
            fs.readFile(__dirname + '/articles/' + article, 'utf8', function (err, body) {
                var props;
                if (err) return next(err);
                
                props = parseProps(body);
                props.name = req.params.post;
                res.render('article', {
                  article: props,
                  author: {name: props.author},
                  content: Markdown.encode(body)
                });
            });
        },
        
        feed: function(req, res, next){
            return this.index(req, res, next, function(articles) {
                res.render('feed.xml', {articles: articles}, true);
            });
        }
    };
});