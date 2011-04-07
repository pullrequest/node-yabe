Title: Node is sweet
Author: John Doe
Date: Apr 07 2011 21:14:00 GMT-0500 (CDT)
Categories: comma, separated, list, of, values

[Wheat](https://github.com/creationix/wheat) is really sweet. It's a blog engine written with node that makes blogging really handy. It uses git filesystem to get info from a local repo and markdown syntax to default post syntax. Markdown is really an efficient markup language and makes documentation actually fun, the same goes for writings.

> [Markdown](http://daringfireball.net/projects/markdown/) is a text-to-HTML conversion tool for web writers. Markdown allows you to write using an easy-to-read, easy-to-write plain text format, then convert it to structurally valid XHTML (or HTML).

Right now, this application does the barely minimum, and uses the node filesystem API to get articles' content. This is a work in progress (and mostly just fun).

## Routes exposed
    
* `GET /` rendering index.html views articles list
* `GET /article/:post/` rendering a full article. :post is the filename, minus the markdown suffix.
* `GET /feed.xml` providing a basic rss feed
    
## Views

Views are defined within their own 'themes' `folder/` within `themes/` one.

* index.html that lists articles with a short intro
* articles.html actually used when viewing an article
* feed.xml provides a simple and really basic rss feed
* layout.html is used to decorate index/articles templates

The template engine used is [node-jqtpl](https://github.com/kof/node-jqtpl) by [kof](https://github.com/kof/), a node port of jQuery Templates plugin.

## Thanks!

Tim Caswell([creationix](Tim Caswell)) and [Wheat](https://github.com/creationix/wheat), a really beautiful piece of node hacking. The markdown and pretiffy modules are directly coming from Wheat, the whole is heavily based on Wheat which inspired me this experiments, mostly for fun. I'm using wheat since a few months now to blog and I really think that solutions like Jekyll or Wheat, both based on markdown (textile is also pretty good) are ideal and really pleasant to work with.



