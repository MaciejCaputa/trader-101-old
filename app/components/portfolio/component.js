angular
  .module('app.components')
  .component('traderPortfolio', {
    bindings: {
      user: '=',
      quotes: '='
    },
    templateUrl: 'app/components/portfolio/view.html',
    controller: function() {
      this.test = 'test';
      console.log(this.user);
    }
  });
