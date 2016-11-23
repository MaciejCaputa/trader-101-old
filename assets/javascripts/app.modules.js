
angular
  .module('app.components', ['app']);
  
angular
  .module('app', ['app.states', 'app.factories', 'app.components'])

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


    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        // User is signed in.
        console.info(`User ${user.displayName} is signed in.`);

        // Let's let the layout know that user is signed in.
        $scope.user = user;

        // Now we get users personal data.
        firebase
          .database()
          .ref(`/users/${firebase.auth().currentUser.uid}`)
          .once('value')
          .then((snapshot) => {
            // And we swap it with user variable
            $scope.user = snapshot.val();
            $scope.$apply();
          })
          .then(() => {
            console.info('User\'s data has been pulled successfully.');
            console.info($scope.user);
          });

      }
    });

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

  }]);
