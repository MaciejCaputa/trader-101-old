angular
  .module('app.components')
  .component('traderFeed', {
    bindings: {
      user: '=',
      quotes: '='
    },
    templateUrl: 'app/components/feed/view.html',
    controller: function() {

    }
  });
