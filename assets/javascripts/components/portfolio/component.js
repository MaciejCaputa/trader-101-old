angular
  .module('app.components')
  .component('componentPortfolio', {
    bindings: {
      user: '=',
      quotes: '='
    },
    templateUrl: 'assets/javascripts/components/portfolio/view.html',
    controller: function() {
      this.test = 'test';
      console.log(this.user);
    }
  });
