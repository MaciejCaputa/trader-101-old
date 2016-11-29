angular
  .module('app.components')
  .component('traderSettings', {
    bindings: {
      user: '='
    },
    templateUrl: 'app/components/settings/view.html',
    controller: function() {
      console.log('highlight');
      // hljs.initHighlightingOnLoad();
      // setTimeout(function () {
      //   hljs.initHighlightingOnLoad();
      // }, 4000);

    }
  });
