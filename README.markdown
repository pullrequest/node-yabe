# Node Yabe

A simple (but yet another) blog engine written in node.js. It basically takes the `articles/` folder full of markdown post and serves them as a website.

h5b [node.js](https://github.com/paulirish/html5-boilerplate-server-configs/blob/master/node.js)(thanks [xonecas](https://github.com/xonecas)!) server configuration is used.

Yabe mainly due to my lack of inspiration when it comes to chose a name. I chose to create yet another blog engine. It is a reference to this [play](http://www.playframework.org/documentation/1.0.1/guide1#aTheprojecta) framework sample project.

Right now, this application does the barely minimum, and uses the node filesystem API to get articles content. This is a work in progress (and mostly just fun).

## Dependencies

The dependencies are placed in the `node_modules` folder to load them as if they are native modules. no package.json yet

* [connect](http://github.com/senchalabs/connect) 1.2.1
* [mime](http://github.com/bentomas/node-mime) 1.2.1
* [node-jqtpl](http://github.com/kof/node-jqtpl.git) 0.1.0
* markdown and prettify node module are node ports of showdown and prettify syntax highlighter by [creationix](https://github.com/creationix) for the [Wheat](https://github.com/creationix/wheat) blog engine.

## Routes exposed
    
* `GET /` rendering index.html view. a simple list of available post.
* `GET /article/:post/` rendering a full article. :post is the filename, minus the markdown suffix.
* `GET /feed.xml` providing a basic rss feed
    
## Views

Views are defined within their own 'themes' `folder/` within `themes/` one.

* index.html that lists articles with a short intro
* articles.html actually used when viewing an article
* feed.xml provides a simple and really basic rss feed
* layout.html is used to decorate index/articles templates

The template engine used is [node-jqtpl](https://github.com/kof/node-jqtpl) by [kof](https://github.com/kof/), a node port of jQuery Templates plugin.

## Sidebars

a custom sidebar file allows you to define a custom placeholder that you can later use in your templates, heavily inspired by [gollum](http://github.com/github/gollum). It's not as brilliant and is roughly implemented but you can use a custom `_sidebar.markdown` file in `artciles` folder, its content would be available in your template files like so:

    {{if has_sidebar}}
    <div class="article-sidebar">
      {{html sidebar}}
    </div>
    {{/if}}

## A bit of configuration

`config.js` file acts as a really basic configuration hook. It should expose a simple hash object:

    module.exports = {
      themeDir: 'themes',
      theme: 'testr'
    };

## Thanks!

Tim Caswell([creationix](Tim Caswell)) and [Wheat](https://github.com/creationix/wheat), a really beautiful piece of node hacking. The markdown and pretiffy modules are directly coming from Wheat, the whole is heavily based on Wheat which inspired me this experiments, mostly for fun. I'm using wheat since a few months now to blog and I really think that solutions like Jekyll or Wheat, both based on markdown (textile is also pretty good) are ideal and really pleasant to work with.








