var sys = require('sys'),
    Git = require('./lib/node-git/lib/git-fs');


// Test it!
Git(process.cwd());

var art = "articles/play-ui-grid.markdown"

//Loads a file from a git repo
/* * /
Git.readFile = safe(function readFile(version, path, callback) {

  // Get the data from a git subprocess at the given sha hash.
  if (version.length === 40) {
    gitExec(["show", version + ":" + path], callback);
    return;
  }

  // Or load from the fs directly if requested.
  fs.readFile(Path.join(workTree, path), 'binary', function (err, data) {
    if (err) {
      if (err.errno === process.ENOENT) {
        err.message += " " + JSON.stringify(path);
      }
      callback(err); return;
    }
    callback(null, data);
  });

});
/* */


Git.getHead(function(err, version) {
    console.log('head', version);
    
    
    Git.readFile(version, art, function() {
        console.log('file', arguments);
    });
});




/* * /
Git.getTags(function (err, tags) {
  if (err) { throw(err); }
  Object.keys(tags).forEach(function (tag) {
    Git.readDir("articles", tags[tag], function (err, contents) {
      if (err) { throw(err); }
      contents.files.forEach(function (file) {
        file = Path.join("articles", file);
        Git.readFile(file, tags[tag], function (err, text) {
          if (err) { throw(err); }
          sys.error("tag: " + tag + " sha1: " + tags[tag] + " file: " + file + " length: " + text.length);
        });
      });
    });
  });
});
/* */