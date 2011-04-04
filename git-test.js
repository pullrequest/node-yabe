var sys = require('sys'),
    Git = require('./lib/node-git/lib/git-fs');


// Test it!
Git(process.cwd());


Git.log("articles/play-ui-grid.markdown", function (err, data) {
    if (err) throw err;
    sys.p(data);
    process.exit();
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