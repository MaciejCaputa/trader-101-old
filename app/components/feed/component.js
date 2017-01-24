angular
  .module('app.components')
  .component('traderFeed', {
    bindings: {
      user: '=',
      quotes: '='
    },
    templateUrl: 'app/components/feed/view.html',
    controller: function($http) {

      //
      // $.ajax({
      //     // url: 'https://www.google.com/finance/info?q=NASDAQ:AAPL',
      //     url: 'https://www.google.com/finance/market_news?output=rs',
      //     // data: {
      //     //     q: 'NASDAQ:AAPL',
      //     //     infotype: "infoquoteall"
      //     // },
      //     dataType: "json",
      //     cache: true,
      //     success: function(response) {
      //       console.log('response');
      //       console.log(response);
      //     },
      //     error: function(response) {
      //       console.log(response);
      //     }
      // });


    delete $http.defaults.headers.common['X-Requested-With'];

    $http({
        method: 'GET',
        url: 'https://www.google.com/finance/market_news?output=json',
        transformRequest: angular.identity,
        transformResponse: angular.identity
      })
      .then(response => response.data)
      .then(data => {
        let myRegexp, match;
        do {
          myRegexp = /({|,)(\w+):/g;
          match = myRegexp.exec(data);
          if (match) {
            data = data.replace(match[0], `${match[1]}"${match[2]}":`);
          }

        } while(match);


        while(data.indexOf('#39;') > -1) {
          data = data.replace('\\u0026#39;', '\'');
        }

        return JSON.parse( data ).clusters;
      })
      .then(news => {
        console.info(news);
        this.news = news;
      });


    }
  });
