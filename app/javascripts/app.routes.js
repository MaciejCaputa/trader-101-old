angular
  .module('app.states', ['app.components', 'ui.router'])
  .config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {

    $urlRouterProvider
      .otherwise('/quotes');

    $stateProvider
      .state('feed', {
        url: '/feed',
        template: '<trader-feed user="user" quotes="quotes"></trader-feed>'
      })
      .state('quotes', {
        url: '/quotes',
        template: '<trader-quotes quotes="quotes"></trader-quotes>'
      })
      .state('company', {
        url: '/company/:symbol',
        templateProvider: function($stateParams) {
          const symbol = $stateParams.symbol;
          return `<trader-company user="user" symbol="${symbol}"></trader-company>`;
        }
      })
      .state('portfolio', {
        url: '/portfolio',
        template: '<trader-portfolio user="user" quotes="quotes"></trader-portfolio>'
      })
      .state('settings', {
        url: '/settings',
        template: '<trader-settings user="user" quotes="quotes"></trader-settings>'
      })
      .state('signup', {
        url: '/signup',
        template: '<trader-signup user="user"></trader-signup>'
      });
  }]);


// <trader-feed user="user" quotes="quotes"></trader-feed>
//
// <trader-quotes quotes="quotes"></trader-quotes>
//
// <trader-historic><trader-historic>
//
// <trader-portfolio user="user" quotes="quotes"></trader-portfolio>
//
// <trader-settings user="user" quotes="quotes"></trader-settings>
//
// <trader-signup user="user"></trader-signup>
