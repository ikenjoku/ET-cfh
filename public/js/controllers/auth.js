/* eslint prefer-arrow-callback: 0, func-names: 0, no-undef: 0 */
angular.module('mean.system')
  .controller('AuthController', ['$scope', '$location', '$resource', function ($scope, $location, $resource) {
    $scope.newUser = {};
    $scope.user = {};
    const Login = $resource('/api/auth/login', {}, {
      execute: { method: 'POST', hasBody: true }
    });

    const SignUp = $resource('api/auth/signup', {}, {
      execute: { method: 'POST', hasBody: true }
    });

    $scope.SignUpUser = function () {
      SignUp.execute({}, $scope.newUser, function (response) {
        localStorage.setItem('#cfhetusertoken', response.token);
        $location.path('/app');
      }, (error) => {
        console.log(error);
      });
    };

    $scope.SignInUser = function () {
      Login.execute({}, $scope.user, function (response) {
        localStorage.setItem('#cfhetusertoken', response.token);
        $location.path('/app');
      }, (error) => {
        console.log(error);
      });
    };
  }]);
