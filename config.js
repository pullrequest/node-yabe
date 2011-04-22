module.exports = {
  // control cross domain if you want. allow cross domain (for your subdomains) disallow other domains.
  // you can get really specific by using a regex here
  // hostAddress: 'localhost',
  
  hostAddress: /localhost|127\.0\.0\.1/,
  
  // server port
  port: 3001,
  
  // themes folder path
  themeDir: 'themes',
  
  // theme folder name
  theme: 'testr'
};