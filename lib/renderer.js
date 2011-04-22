// TODO: DRY-out this file
var fs = require('fs'),
jqtpl = require('node-jqtpl'),
Markdown = require('markdown'),
prettify = require('prettify'),
QueryString = require('querystring'),
inspect = require('util').inspect,
res = require('http').ServerResponse.prototype,
path = process.cwd(),

sidebarize = function sidebarize(fn) {
  var cache;
  
  return function(target, data, force) {
    var self = this, args = arguments;
    
    if(cache) {
      data.sidebar = cache;
      data.has_sidebar = true;
      return fn.apply(this, arguments); 
    }
    
    // lookup for a special _sidebar.markdown file
    fs.readFile(path + '/articles/_sidebar.markdown', 'utf8', function (err, body) {
        if (!err) {
          cache = body;
          data.sidebar = Markdown.encode(body);
          data.has_sidebar = true;
        }
        
        // whatever we've got (err), trigger callback
        fn.apply(self, args); 
    });
  };
};

/**
* Define a custom render method on ServerResponse.
*
* Usage:
*  res.render(view, data, force = false)
*/
Object.defineProperty(res, 'render', {
  value: sidebarize(function(target, data, force) {
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
        'Content-Type': /\.xml/.test(target) ? 'application/rss+xml' : 'text/html',
        'Content-Length': layout.length
    });
  
    this.end(layout);
  })
});

/**
* Renderer Object. Actions goes there, declared in the public API.
*/
var Renderer = (function() {
    
    // Cache templates on application startup
    var parseProps = function(markdown) {
      var props = {},
      match = [];

      // Parse out headers
      while( (match = markdown.match(/^([a-z]+):\s*(.*)\s*\n/i)) ) {
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
    
    readFile = function(base, file) {
      fs.readFile(base + file, 'utf8', function(err, tmpl) {
        var f;
        if (err) throw err;
        
        f = 'tmpl.' + file.replace(/\.\w+/i, '');

        if(jqtpl.template[f]) {
          delete jqtpl.template[f]; 
        }
        
        jqtpl.template(f, tmpl);
      }); 
    },
    
    addTemplate = function(file) {
      var filename = /\./.test(file) ? file : file + '.html',
      base = [path, this.options.themeDir, this.options.theme, ''].join('/');
          
      // adding templates      
      readFile(base, filename);
      
      // also register to file changes to automatically recompile them
      fs.watchFile(base + filename, function(curr, prev) {
        readFile(base, filename);
      });
    };
    
    
    return {
      
        options: {},
        
        init: function(o) {
          this.options = o;
          
          addTemplate.call(this, 'layout');
          addTemplate.call(this, 'article');
          addTemplate.call(this, 'index');
          addTemplate.call(this, 'feed.xml');
          
          return this;
        },
        
        index: function(req, res, next, cb) {
        
          var render = function(articles) {
            articles.sort(function(a, b) {
              return (Date.parse(b.date)) - (Date.parse(a.date));
            });
            
            if(cb) {
              return cb(articles);
            }
            
            res.render('index', {
              articles: articles
            });
          };
          
          fs.readdir(path + '/articles/', function(err, results) {
            var files = [],
            articles = [],
            ln;
            
            if(err || !results) {
              return next(err);
            }
            
          
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

              fs.readFile(path + '/articles/' + filename, function(err, markdown) {
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
            
            fs.readFile(path + '/articles/' + article, 'utf8', function (err, body) {
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
})();


// expose the Renderer Object via
module.exports = function rendererFactory(o) {
  return Object.create(Renderer).init(o);
};