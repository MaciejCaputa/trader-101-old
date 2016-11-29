angular
  .module('app.components')
  .component('traderFeed', {
    bindings: {
      user: '=',
      quotes: '='
    },
    templateUrl: 'app/components/feed/view.html',
    controller: function($http) {

      // $http.jsonp(`https://finance.google.com/finance/info?client=ig&q=${query}&callback=JSON_CALLBACK`)
      //  .then(function(response) {
      //     console.log(respnse);
      //    });


      var req = {
       method: 'GET',
       url: 'https://www.google.com/finance/market_news?output=json',
       transformRequest: angular.identity,
transformResponse: angular.identity,
      //  transformResponse: function(response) {
      //   //  console.log(response.toString());
      //   console.log(JSON.parse(response));
      //    return JSON.stringify(response);
      //    return response.toString();
      //  },
       headers: {
         'Content-Type': undefined
       }
     };

     $http(req)
      .then(response => {
        return response.data;
      })
      .then(data => {


        let myRegexp, match;
        do {
          myRegexp = /({|,)(\w+):/g;
          match = myRegexp.exec(data);
          // console.log(match[0]); // abc
          // console.log(match);
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
