angular
  .module('app.components')
  .component('componentFeed', {
    bindings: {
      user: '=',
      quotes: '='
    },
    templateUrl: 'assets/javascripts/components/feed/view.html',
    controller: function() {

    }
  });
