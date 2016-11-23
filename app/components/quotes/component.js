angular
  .module('app.components')
  .component('traderQuotes', {
    bindings: {
      quotes: '='
    },
    templateUrl: 'app/components/quotes/view.html',
    controller: function() {

    }
  });
