angular
  .module('app.components')
  .component('traderCompany', {
    bindings: {
      user: '=',
      symbol: '@'
    },
    templateUrl: 'app/components/company/view.html',
    controller: function(ApiCompanyQuotes) {

      // Time span defaults to one year.
      this.timeSpan = 366;

      /**
       * Getting historic quotes for a specific company.
       * @param {string} company - symbol of a company
       * @returns {Array} array of two-element arrays of date and end of the day quote.
       */
      this.getCompany = () => {

        ApiCompanyQuotes.get(this.symbol, this.timeSpan)
          .then(response => {
            console.log('here');
            // Making pull data from Quandl available as this.company variable.
            this.company = response.data.dataset;
          })
          .then(() => {
            // Plotting the graph.
            plotGraph( this.company.data );
          })
          .catch(error => {
            console.error(error);
          });

      };

      this.getCompany();

      // Reploting graph when windows is resized.
      $( window ).resize(() => {
       plotGraph( this.company.data );
      });

      $( window ).change(() => {
       plotGraph( this.company.data );
      });

      $( 'svg' ).resize(() =>{
       plotGraph( this.company.data );
      });

      $( 'svg' ).change(() =>{
       plotGraph( this.company.data );
      });
    }
  });