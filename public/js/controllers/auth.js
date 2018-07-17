/* eslint prefer-arrow-callback: 0, func-names: 0, no-undef: 0 */
angular.module('mean.system')
  .controller('AuthController', ['$scope', '$location', '$resource', function ($scope, $location, $resource) {
    $scope.newUser = {};
    $scope.user = {};
    $scope.authError = '';
    const Login = $resource('/api/auth/login', {}, {
      execute: { method: 'POST', hasBody: true }
    });

    const SignUp = $resource('api/auth/signup', {}, {
      execute: { method: 'POST', hasBody: true }
    });

    $scope.logOut = function () {
      localStorage.removeItem('#cfhetusertoken');
      localStorage.removeItem('username');
      localStorage.removeItem('#cfhetUserId');
    };

    $scope.username = localStorage.getItem('username');

    $scope.checkToken = function () {
      const token = localStorage.getItem('#cfhetusertoken');
      if (token) {
        return true;
      }
      return false;
    };

    $scope.SignUpUser = function () {
      SignUp.execute({}, $scope.newUser, function (response) {
        localStorage.setItem('#cfhetusertoken', response.token);
        localStorage.setItem('#cfhetUserId', response._id);
        localStorage.setItem('username', response.name);
        $location.path('/');
      }, (error) => {
        $scope.authError = error.data.message;
      });
    };

    $scope.SignInUser = function () {
      Login.execute({}, $scope.user, function (response) {
        localStorage.setItem('#cfhetusertoken', response.token);
        localStorage.setItem('#cfhetUserId', response._id);
        localStorage.setItem('username', response.name);
        $location.path('/');
      }, () => {
        $scope.authError = 'Please check your username/password and try again';
      });
    };
  }]);
