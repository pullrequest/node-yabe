var fs = require('fs');

var Tools = {
    render: function(name, data, callback, partial) {
    
    }
};

function render(name, data, callback, partial) {
    Step(
      function getHead() {
        Git.getHead(this);
      },
      function loadTemplates(err, version) {
        if (err) { callback(err); return; }
        loadTemplate(version, name, this.parallel());
        if (!partial) {
          loadTemplate(version, "layout", this.parallel());
        }
      },
      function renderTemplates(err, template, layout) {
        if (err) { callback(err); return; }
        data.__proto__ = Helpers;
        var content = template(data);
        if (partial) { return stringToBuffer(content); }
        data = {
          content: content,
          title: data.title || "",
          categories: data.categories || []
        };
        data.__proto__ = Helpers;
        return stringToBuffer(layout(data));
      },
      callback
    )
  }


var Renderers = module.exports = (function(o) {
  
    /* * /
    addRoute('/', r.index);
    
    // rss feed
    addRoute('/feed.xml', r.feed);
    
    // category/tags support
    addRoute('/category/:category', r.category);

    // article
    addRoute('/article/:post', r.article);

    // article revisions
    addRoute(/^\/([a-f0-9]{40})\/([a-z0-9_-]+)\/?$/, r.article);
    /* */
    
    
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
                
                res.writeHead(200, { 
                   'content-type': 'text/html',
                   'content-length': body.length
                });
                
                res.end(body);
            });
        },
        feed: function(){}
    }
})();