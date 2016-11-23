angular
  .module('app.states', ['app.components', 'ui.router'])
  .config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {

    $urlRouterProvider
      .otherwise('/quotes');

    $stateProvider
      .state('feed', {
        url: '/feed',
        template: '<component-feed user="user" quotes="quotes"></component-feed>'
      })
      .state('quotes', {
        url: '/quotes',
        template: '<component-quotes quotes="quotes"></component-quotes>'
      })
      .state('company', {
        url: '/company/:symbol',
        templateProvider: function($stateParams) {
          const symbol = $stateParams.symbol;
          return `<component-company user="user" symbol="${symbol}"></component-company>`;
        }
      })
      .state('portfolio', {
        url: '/portfolio',
        template: '<component-portfolio user="user" quotes="quotes"></component-portfolio>'
      })
      .state('settings', {
        url: '/settings',
        template: '<component-settings user="user" quotes="quotes"></component-settings>'
      })
      .state('signup', {
        url: '/signup',
        template: '<component-signup user="user"></component-signup>'
      });
  }]);


// <component-feed user="user" quotes="quotes"></component-feed>
//
// <component-quotes quotes="quotes"></component-quotes>
//
// <component-historic><component-historic>
//
// <component-portfolio user="user" quotes="quotes"></component-portfolio>
//
// <component-settings user="user" quotes="quotes"></component-settings>
//
// <component-signup user="user"></component-signup>
