
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

  .component('componentHistoric', {
    templateUrl: 'assets/javascripts/components/historic.html',
    controller: function() {

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
    controller: function() {
      this.signUp = function() {
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
