// TODO: DRY-out this file
var fs = require('fs'),
jqtpl = require('node-jqtpl'),
Markdown = require('markdown'),
prettify = require('prettify'),
QueryString = require('querystring'),
inspect = require('util').inspect,
res = require('http').ServerResponse.prototype,
path = process.cwd(),

config = require('./config'),

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
    fs.readFile([path, config.articleDir, '_sidebar.markdown'].join('/'), 'utf8', function (err, body) {
        if (!err) {
          data.sidebar = cache = Markdown.encode(body);
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
        'Content-Type': /feed/.test(target) ? 'application/rss+xml' : 'text/html',
        'Content-Length': layout.length
    });
  
    this.end(layout);
  })
});

/**
* Renderer Object. Actions goes there, declared in the public API.
*/
var Renderer = (function Renderer() {
    
    // Cache templates on application startup
    var parseProps = function parseProps(markdown) {
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
    
    readFile = function readFile(base, file) {
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
    
    addTemplate = function addTemplate(file) {
      var filename = /\./.test(file) ? file : file + '.html',
      base = [path, this.options.themeDir, this.options.theme, ''].join('/');
          
      // adding templates      
      readFile(base, filename);
      
      // also register to file changes to automatically recompile them
      fs.watchFile(base + filename, function(curr, prev) {
        if(+curr.mtime !== +prev.mtime) {
          readFile(base, filename); 
        }
      });
    },
    
    // https://gist.github.com/825583/
    readDir = function readDir(start, callback) {
      
      // Use lstat to resolve symlink if we are passed a symlink
      fs.lstat(start, function(err, stat) {
        if(err) return callback(err);
            
        var found = {dirs: [], files: []},
        total = 0,
        processed = 0,
        isDir = function isDir(abspath) {
          fs.stat(abspath, function(err, stat) {
            if(stat.isDirectory()) {
              found.dirs.push(abspath);
              // If we found a directory, recurse!
              readDir(abspath, function(err, data) {
                found.dirs = found.dirs.concat(data.dirs);
                found.files = found.files.concat(data.files);
                if(++processed == total) {
                  callback(null, found);
                }
              });
            } else {
              found.files.push(abspath);
              if(++processed == total) {
                callback(null, found);
              }
            }
          });
        };

        // Read through all the files in this directory
        if(stat.isDirectory()) {
          fs.readdir(start, function (err, files) {
            total = files.length;
            files.forEach(function(file, i){
              isDir([start, file].join('/'));              
            });
          });
        } else {
          return callback(new Error("path: " + start + " is not a directory"));
        }
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
        
          var render = function render(articles) {
            articles.sort(function(a, b) {
              return (Date.parse(b.date)) - (Date.parse(a.date));
            });
            
            if(cb) {
              return cb(articles);
            }
            
            res.render('index', {
              articles: articles
            });
          },
          
          abspath = [path, this.options.articleDir].join('/');
          
          if(cb && typeof cb === 'string') {
            // we're given a specific abspath, defaults to default behaviour
            abspath = cb;
            cb = null;
          }
          
          
          readDir(abspath, function(err, results) {
            
            var files = [],
            articles = [],
            ln;
            
            if(err || !results || !results.files) {
              return next(err);
            }
            
          
            // Filter out non markdown files and special ones
            results.files.forEach(function(filename, i) {
              if (!(/\.markdown$/.test(filename)) || /_sidebar\.markdown$/.test(filename)) {
                return;
              }
              
              files.push(filename);
            });
            

            ln = files.length - 1;
            
            // Then handle each files
            files.forEach(function(filename, i) {
              fs.readFile(filename, function(err, markdown) {
                var props;
                if (err) throw err;

                if (typeof markdown !== 'string') {
                  markdown = markdown.toString();
                }

                props = parseProps(markdown);
                props.name = filename
                  .replace([path, config.articleDir, ''].join('/'), '')
                  .replace('.markdown', '');
                  
                props.markdown = Markdown.encode(props.markdown.substr(0, props.markdown.indexOf("##")));
            
                articles.push(props);
                
                if(i === ln) {
                  render(articles);
                }
              });
            });
          });
          
          
          return;
        },
        
        category: function(req, res, next) {},
        
        article: function(req, res, next) {
            var article = req.params[0],
            abspath = [path, this.options.articleDir, article].join('/').replace(/\/$/, ''),
            self = this;
            
            fs.readFile(abspath + '.markdown', 'utf8', function (err, body) {
                var props;
                if (err) {
                  // if it's a valid dir, serves its files
                  return fs.stat(abspath, function(err, stat) {
                    if(err || !stat.isDirectory()) return next(err);
                    
                    self.index(req, res, next, abspath);
                  });
                }
                
                props = parseProps(body);
                props.name = article;
                res.render('article', {
                  article: props,
                  author: {name: props.author},
                  content: Markdown.encode(body)
                });
            });
        },
        
        feed: function(req, res, next){
            return this.index(req, res, next, function(articles) {
                res.render('feed', {articles: articles}, true);
            });
        }
    };
})();


// expose the Renderer Object via
module.exports = function rendererFactory(o) {
  return Object.create(Renderer).init(o);
};