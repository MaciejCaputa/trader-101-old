angular
  .module('app.components')
  .component('traderHeader', {
    bindings: {
      user: '='
    },
    templateUrl: 'app/components/header/view.html',
    controller: function() {
      this.login = {};
      this.logIn = () => {
        firebase
          .auth()
          .signInWithEmailAndPassword(this.login.email, this.login.password)
          .then(() => {
            firebase
              .database()
              .ref(`/users/${firebase.auth().currentUser.uid}`)
              .once('value')
              .then((snapshot) => {
                this.user = snapshot.val();
                $scope.$apply();
                console.info('--- LOG IN SUCCEEDED ---');
                console.info(this.user);
              });
          })
          .catch((error) => {
            this.login.errorMessage = error.message;
            $scope.$apply();
            console.error('--- LOG IN FAILED ---');
            console.error(error.code);
            console.error(error.message);
        });
      };
    }
  });
