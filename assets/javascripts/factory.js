
angular
  .module('app.factory', [])
  .factory('apiRealTimeQuotes', ['$http', function apiRealTimeQuotesFactory($http) {

    // Helper function to create combined queries to google's api.
    function constructQuery( market ) {
      let query = '', i = 0, key;
      for (key in config[ market ]) {
        if (i > 0) {
          query += ',';
        }
        i++;
        query += market + ':' + key;
      }
      return query;
    };

    function normaliseName(symbol) {

      let name = config.NASDAQ.hasOwnProperty(symbol) ? config.NASDAQ[ symbol ] : config.FTSE[ symbol ];

      return (
        name
          .split(' ')
          .map( word => word[0].toUpperCase() + word.substring(1).toLowerCase() )
          .join(' ')
      );
    };

    function normaliseLevel(level, market) {
      return (
        Math.round(
          parseFloat(
            market == 'LON'
            ? (level.replace(',','') / 100)
            : level
          ) * 100) / 100
      );
    };

    /**
     * Getting quotes for specific market.
     * @param {string} marketSymbol - symbol of a stock market
     * @returns {Array} Returns an array of objects representing quotes statisitcs of a company.
     */
    function getMarketQuotes( marketSymbol ) {
      let query = constructQuery( marketSymbol.toUpperCase() );

      return $http.jsonp(`https://finance.google.com/finance/info?client=ig&q=${query}&callback=JSON_CALLBACK`)
        .then(function(response) {
          return response.data.map(quote => ({

                symbol: quote.t,
                name: normaliseName(quote.t),
                level: normaliseLevel(quote.l, quote.e),
                change: parseFloat( quote.c, 10),
                changePercent: parseFloat( quote.cp ),
                timestamp: (new Date(quote.lt_dts)),
                market: quote.e == 'LON' ? 'FTSE 100' : 'NASDAQ 100',

          }));
        })
        .catch(function(error) {
          console.error( error );
        });
    }

    // Request to Google's finance API to get FTSE 100 and NASDAQ 100 stock quotes.
      let quotesFTSE, quotesNASDAQ;

      getMarketQuotes( 'FTSE' )
        .then((quotes) => {
          quotesFTSE = quotes;
        });

      return getMarketQuotes( 'NASDAQ' )
        .then((quotes) => {
          quotesNASDAQ = quotes;
        })
        .then(() => {
          var quotes = [].concat(quotesFTSE, quotesNASDAQ);
          return quotes;
        });
  }]);
