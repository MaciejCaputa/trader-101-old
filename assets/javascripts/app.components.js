
angular
  .module('app.components', ['app'])

  .component('componentFeed', {
    bindings: {
      user: '=',
      quotes: '='
    },
    templateUrl: 'assets/javascripts/components/feed.html',
    controller: function() {

    }
  })

  .component('componentQuotes', {
    bindings: {
      quotes: '='
    },
    templateUrl: 'assets/javascripts/components/quotes.html',
    controller: function() {

    }
  })

  .component('componentCompany', {
    bindings: {
      user: '=',
      symbol: '@'
    },
    templateUrl: 'assets/javascripts/components/company.html',
    controller: function(ApiCompanyQuotes) {

      // Time span defaults to one year.
      this.timeSpan = 366;

      /**
       * Getting historic quotes for a specific company.
       * @param {string} company - symbol of a company
       * @returns {Array} array of two-element arrays of date and end of the day quote.
       */
      this.getCompany = () => {

        ApiCompanyQuotes.get(this.symbol, this.timeSpan)
          .then(response => {
            console.log('here');
            // Making pull data from Quandl available as this.company variable.
            this.company = response.data.dataset;
          })
          .then(() => {
            // Plotting the graph.
            plotGraph( this.company.data );
          })
          .catch(error => {
            console.error(error);
          });

      };

      this.getCompany();

      // Reploting graph when windows is resized.
      $( window ).resize(() => {
       plotGraph( this.company.data );
      });

      $( window ).change(() => {
       plotGraph( this.company.data );
      });

      $( 'svg' ).resize(() =>{
       plotGraph( this.company.data );
      });

      $( 'svg' ).change(() =>{
       plotGraph( this.company.data );
      });
    }
  })

  .component('componentPortfolio', {
    bindings: {
      user: '=',
      quotes: '='
    },
    templateUrl: 'assets/javascripts/components/portfolio.html',
    controller: function() {
      this.test = 'test';
      console.log(this.user);
    }
  })

  .component('componentSettings', {
    bindings: {
      user: '='
    },
    templateUrl: 'assets/javascripts/components/settings.html',
    controller: function() {

    }
  })

  .component('componentLogin', {
    templateUrl: 'assets/javascripts/components/login.html',
    controller: function() {

    }
  })

  /**
   * Component Signup
   * Provides functionality by means of which user can log-in and ensures that this functionality can be accessed only form signup component which is important in terms of security.
   * @returns {Object} - signuped and logged in user data in case of successful registration.
   */
  .component('componentSignup', {
    bindings: {
      user: '='
    },
    templateUrl: 'assets/javascripts/components/signup.html',
    controller: function($state, $scope) {

      $scope.$watch('this.user', () =>{
        console.info(this.user);
        console.info(this.user);
        console.info(this.user);
      });

      this.signUp = () => {
        firebase
          .auth()
          .createUserWithEmailAndPassword(this.signup.email, this.signup.password)
          .catch((error) => {
            this.signup.errorMessage = error.message;
            // this.$apply();
            console.error('--- SIGN UP FAILED ---');
            console.error(error.code);
            console.error(error.message);
          })
          .then(() => {
            firebase
              .auth()
              .currentUser
              .updateProfile({
                displayName: `${this.signup.firstName} ${this.signup.lastName}`,
                photoURL: 'https://maciejcaputa.com/assets/images/thumbnail-face.jpg'
              })
              .then(() => {
                firebase
                  .database()
                  .ref(`users/${firebase.auth().currentUser.uid}`)
                  .set({
                    firstName: this.signup.firstName,
                    lastName: this.signup.lastName,
                    name: `${this.signup.firstName} ${this.signup.lastName}`,
                    email: this.signup.email,
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
                // TODO: remake it
                firebase
                  .database()
                  .ref(`/users/${firebase.auth().currentUser.uid}`)
                  .once('value')
                  .then((snapshot) => {
                    this.user = snapshot.val();
                    this.view = 'quotes';
                    // this.$apply();
                    console.info('--- LOG IN SUCCEEDED ---');
                    console.info(this.user);
                  });
              })
              .then(() => {
                this.user = {};
                $scope.$apply(this.user);
                // $state.go('quotes');
              });
          })
          .catch((error) => {
            this.signup.errorMessage = error.message;
            // this.$apply();
            console.error('--- SIGN UP FAILED ---');
            console.error(error.code);
            console.error(error.message);
        });
      };
    }
  });
