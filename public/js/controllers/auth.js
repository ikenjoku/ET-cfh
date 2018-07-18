/* global FileReader */
/* eslint prefer-arrow-callback: 0, func-names: 0 */
angular.module('mean.system')
  .controller('AuthController', ['$scope', '$location', '$resource', 'Upload', 'cloudinary',
    function ($scope, $location, $resource, Upload) {
      $scope.newUser = {};
      $scope.user = {};
      $scope.authError = '';
      const Login = $resource('/api/auth/login', {}, {
        execute: { method: 'POST', hasBody: true }
      });

      const SignUp = $resource('api/auth/signup', {}, {
        execute: { method: 'POST', hasBody: true }
      });

      $scope.uploadImage = function (profilePic) {
        const cloudUrl = Upload.upload({
          url: 'https://api.cloudinary.com/v1_1/dffiyhgto/image/upload',
          data: {
            upload_preset: 'lupttjwi',
            secure: true,
            file: profilePic
          }
        });
        return cloudUrl;
      };

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

      $scope.showProfile = function () {
        document.getElementsByClassName('profile-container')[0].style.display = 'block';
      };
      $scope.imagePreview = '';
      $scope.viewImage = function () {
        const file = event.target.files[0];
        if (file) {
          const fileReader = new FileReader();
          fileReader.readAsDataURL(file);
          fileReader.onload = function (event) {
            $scope.imagePreview = event.target.result;
          };
        }
      };

      $scope.SignUpUser = function () {
        const { profilePic } = $scope;
        // if image is uploaded, save profile picture as avatar
        if (profilePic) {
          $scope.uploadImage(profilePic).then(function (res) {
            $scope.newUser.avatar = res.data.url;
            SignUp.execute({}, $scope.newUser, function (response) {
              localStorage.setItem('#cfhetusertoken', response.token);
              localStorage.setItem('#cfhetUserId', response._id);
              localStorage.setItem('username', response.name);
              $location.path('/');
            }, (error) => {
              $scope.authError = error.data.message;
            });
          });
        } else {
          SignUp.execute({}, $scope.newUser, function (response) {
            localStorage.setItem('#cfhetusertoken', response.token);
            localStorage.setItem('#cfhetUserId', response._id);
            localStorage.setItem('username', response.name);
            $location.path('/');
          }, (error) => {
            $scope.authError = error.data.message;
          });
        }
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
