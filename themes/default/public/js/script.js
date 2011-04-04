
(function($, global, body, undefined){

  $(function(){

    var themes = $('p.themes'),
    
    rColorSheme = /black|darky|blue|white|brown/,
    
    rWide = /tiny|large/,

    themify = function(ev) {
      var href = ev.target.href,
      m = href.match(/\#\/themes\/(\w+)/)
      theme = m && m[1] ? m[1] : '',
      isColorSheme = theme !== 'tiny' && theme !== 'large';

      if(!theme) {return false;}
      
      body.className = body.className.replace(( isColorSheme ? rColorSheme : rWide ), theme);
    };
    
    // trigger on click
    themes.delegate('a', 'click', themify);


    $(window).bind('hashchange', function(ev){
      // trigger on hashchange
      themify({
        target: {
          href: global.location.hash
        }
      });
    })

    // Init on page load
    themify({
      target: {
        href: global.location.hash
      }
    });
    
    // widify
    $('.wide-content a').bind('click', themify);

    $('.hovereaster').click(function() {
      $(this).text('✌')
        .addClass('aha');
    });
    
    // search. make better tomorrow (tmpl and friends)
    $('.search').click(function() {
      
      var api = "https://www.googleapis.com/customsearch/v1?key=AIzaSyAIzy2MTzebP4sRKS06l9zZ9-BTuT_oiCI&cx=008711380682935662586:zfniycnc6ia";
      
      var art = $('.article-main'),

      results = $('<div />', {'class': 'results'});
      
      var form = $('<form />', {'class': 'search'})
        .append($('<input />', {
          type: 'text',
          name: 'q',
          autocomplete: 'off'
        }))
        .bind('submit', function(ev) {
          var v = $(this).find('input').val();

          results.empty();
          
          $.ajax({
            url: api,
            type: 'get',
            dataType: 'jsonp',
            data: {q: v},
            success: function(response) {
              console.log('complete', arguments);

              var items = response.items, html = [];
              
              if(!items) {return;}

              $.each(items, function(i, val) {
                html.push('<h3><a href="'+this.link+'">' + this.title.split('mklog.fr')[0].replace(' -', '') + '</h3>');
                html.push('<p>' + this.snippet + '</p>');
              });

              results.html(html.join(''));
            }
          });
          
          return false;
        });
      
      
      art.empty()
        .append($('<h2 />', {text: 'Search!'}))
        .append(form)
        .append(results);
      
    });

  });

})(this.jQuery, this, this.document.body);

// a little noise
(function(document, body){
  
  if(!Modernizr.canvas) {
    return;
  }
  
  var canvas = document.createElement('canvas'),
  ctx = canvas.getContext('2d'),
  width = canvas.width = 45,
  height = canvas.height = 45,
  x, y, num;
  
  for( x = 0; x < width; x++ ) {
    for( y = 0; y < height; y++ ) {
      num = Math.floor( Math.random() * 90);
      
      ctx.fillStyle = "rgba(num, num, num, 0.1)".replace(/num/g, num);
      ctx.fillRect(x, y, 1, 1);
    }        
  }
  
  
  body.style.backgroundImage = "url(" + canvas.toDataURL("image/png") + ")";  
  
})(this.document, this.document.body);
