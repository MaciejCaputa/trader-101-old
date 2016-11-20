
angular
  .module('app', ['app.factory'])

  .controller('ctrl', ['$scope', '$http', 'apiRealTimeQuotes', function($scope, $http, apiRealTimeQuotes) {

    function getRealTimeQuotes() {
      apiRealTimeQuotes.then((quotes) => {
        $scope.quotes = quotes;
        console.info(`apiRealTimeQuotes: ${new Date()}\n`, quotes);
      });
    };

    // Getting real time quotes.
    getRealTimeQuotes();

    // Stock quotes are updated every minute.
    setInterval(function() {
      getRealTimeQuotes();
    }, config.updateInterval);

    // Initialisation
    $scope.login = {};
    $scope.signup = {};
    $scope.quotes = [];
    $scope.user = firebase.auth().currentUser;
    $scope.view = 'quotes';
    $scope.NASDAQ = config.NASDAQ;
    $scope.FTSE = config.FTSE;

    $scope.signUp = function() {
      firebase
        .auth()
        .createUserWithEmailAndPassword($scope.signup.email, $scope.signup.password)
        .then(() => {
          firebase
            .auth()
            .currentUser
            .updateProfile({
              displayName: `${$scope.signup.firstName} ${$scope.signup.lastName}`,
              photoURL: 'https://maciejcaputa.com/assets/images/thumbnail-face.jpg'
            })
            .then(() => {
              firebase
                .database()
                .ref(`users/${firebase.auth().currentUser.uid}`)
                .set({
                  firstName: $scope.signup.firstName,
                  lastName: $scope.signup.lastName,
                  name: `${$scope.signup.firstName} ${$scope.signup.lastName}`,
                  email: $scope.signup.email,
                  avatar: 'https://maciejcaputa.com/assets/images/thumbnail-face.jpg',
                  balance: 10000,
                  transactions: {
                    open: [
                      {
                        symbol: "AAPL",
                        name: "Apple Inc.",
                        price: {
                          open: 113.05
                        },
                        shares: 90,
                        date: ""
                      },
                      {
                        symbol: "GOOGL",
                        name: "Alphabet Inc Class A",
                        price: {
                          open: 801.23
                        },
                        shares: 12,
                        date: ""
                      },
                      {
                        symbol: "MSFT",
                        name: "Microsoft Corp",
                        price: {
                          open: 57.96
                        },
                        shares: 175,
                        date: ""
                      }
                    ],
                    closed: [
                      {
                        symbol: "AMZN",
                        name: "Amazon.com Inc.",
                        price: {
                          open: 737.61,
                          close: 844.36
                        },
                        shares: 10,
                        date: "",
                      },
                      {
                        symbol: "NFLX",
                        name: "Netflix Inc.",
                        price: {
                          open: 82.79,
                          close: 106.28
                        },
                        shares: 100,
                        date: "",
                      },
                    ]
                  }
              });
            })
            .then(() => {
              firebase
                .database()
                .ref(`/users/${firebase.auth().currentUser.uid}`)
                .once('value')
                .then((snapshot) => {
                  $scope.user = snapshot.val();
                  $scope.view = 'quotes';
                  $scope.$apply();
                  console.info('--- LOG IN SUCCEEDED ---');
                  console.info($scope.user);
                });
            });
        })
        .catch((error) => {
          $scope.signup.errorMessage = error.message;
          $scope.$apply();
          console.error('--- SIGN UP FAILED ---');
          console.error(error.code);
          console.error(error.message);
      });
    };

    $scope.logIn = function() {
      firebase
        .auth()
        .signInWithEmailAndPassword($scope.login.email, $scope.login.password)
        .then(() => {
          firebase
            .database()
            .ref(`/users/${firebase.auth().currentUser.uid}`)
            .once('value')
            .then((snapshot) => {
              $scope.user = snapshot.val();
              $scope.$apply();
              console.info('--- LOG IN SUCCEEDED ---');
              console.info($scope.user);
            });
        })
        .catch((error) => {
          $scope.login.errorMessage = error.message;
          $scope.$apply();
          console.error('--- LOG IN FAILED ---');
          console.error(error.code);
          console.error(error.message);
      });
    };

    /**
     * Evaluates student's balance.
     * Adds the transaction to closed transactions.
     * Removes the transaction from open transactions.
     * Updates changes in the database.
     */
    $scope.buy = function(quote, shares) {
      // TODO: IF logged in
      // TODO: If has enough money

      firebase
        .database()
        .ref(`users/${firebase.auth().currentUser.uid}/transactions/open`)
        .push({
          symbol: quote.symbol,
          name: quote.name,
          price: {
            open: quote.level
          },
          shares: shares,
          date: new Date().now()
      });
    };

    /**
     * Evaluates student's balance.
     * Adds the transaction to closed transactions.
     * Removes the transaction from open transactions.
     * Updates changes in the database.
     */
    $scope.sell = function(index) {
      // TODO: If logged in
      // TODO: IF has enough shares
      $scope.currentUser.balance = parseInt($scope.currentUser.balance, 10 )
                                 + parseInt( $scope.currentUser.transactions.open[index].marketValue, 10 );
      $scope.currentUser.transactions.closed.push( $scope.currentUser.transactions.open[index] );
      $scope.currentUser.transactions.open.splice(index, 1);
      // TODO: Update the database
    };

    /**
     * Getting historic quotes for a specific company.
     * @param {string} company - symbol of a company
     * @returns {Array} array of two-element arrays of date and end of the day quote.
     */
    $scope.getCompany = function(company) {
      let collapse, market, url;

      // When choosing a company card its symbol is saved and time span is set to default to one year.
      if (company !== undefined) {
        $scope.currentCompany = company;
        $scope.timeSpan = 366;
      }

       // Choosing an appropriate collapse for uplled data.
      if ($scope.timeSpan > 366) {
        collapse = 'weekly';
        $scope.timeSpan = Math.floor( $scope.timeSpan / 7 );
      } else {
        collapse = 'daily';
      }

      // Getting a corresponding symbol of a market.
      market = config.NASDAQ[$scope.currentCompany] ? 'NASDAQ' : 'LON';

      // Creating a request url.
       url = `${config.quandlBaseUrl}${market}_${$scope.currentCompany}.json`;


      // Making request to Quandl's API to get end of the day historic data.
      $http({method: 'GET', url: url, params: {api_key: config.quandlApiKey, rows: $scope.timeSpan, column_index: 4, collapse: collapse }})
        .then( (response) => {

          // Making pull data from Quandl available as $scope.company variable.
          $scope.company = response.data.dataset;

          // Ensuring that chart is initalised only after $scope.company is initialised.
          setTimeout(function() {
            plotGraph( $scope.company.data );
          }, 0);

        }, (err) => {
          // In case of error print error response.
          console.error(err);
        });
      };

    // Making concat function available in Angular's scope.
    $scope.concat = function(arr1, arr2) {
      return [].concat(arr1, arr2);
    };

    // Reploting graph when windows is resized.
    $( window ).resize(function() {
     plotGraph( $scope.company.data );
    });

    $( window ).change(function() {
     plotGraph( $scope.company.data );
    });

    // Ensuring proper dimension of a canvas element.

    $( 'svg' ).resize(function() {
     plotGraph( $scope.company.data );
    });

    $( 'svg' ).change(function() {
     plotGraph( $scope.company.data );
    });

  }]);
