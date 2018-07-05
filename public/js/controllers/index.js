/* eslint prefer-arrow-callback: 0, func-names: 0, no-undef: 0 */
angular.module('mean.system')
  .controller('IndexController', ['$scope', 'Global', '$location', 'socket', 'game', 'AvatarService', '$http', function ($scope, Global, $location, socket, game, AvatarService, $http) {
    $scope.global = Global;

    $scope.playAsGuest = function () {
      game.joinGame();
      $location.path('/app');
    };

    $scope.showError = function () {
      if ($location.search().error) return $location.search().error;
      return false;
    };

    $scope.avatars = [];
    AvatarService.getAvatars()
      .then(function (data) {
        $scope.avatars = data;
      });
    $scope.guest = function() {
      const token = localStorage.getItem('#cfhetusertoken');
      if (!token || token === null) {
        return true;
      }
      return false;
    };

    $scope.user = function() {
      const token = localStorage.getItem('#cfhetusertoken');
      if (!token || token === null) {
        return false;
      }
      return true;
    }
    
    $scope.$watch('$viewContentLoaded', function(){
      const token = localStorage.getItem('#cfhetusertoken');   
      $http({
          method: 'GET',
          url: '/api/verify',
          headers: {
              'Content-Type': 'application/json',
              'authorization': token,
          }
          }).then((res) => {
          if(res.message) {
            return localStorage.removeItem('#cfhetusertoken');
          }else{
            return localStorage.setItem('#cfhetusertoken', res.token);
          }
          });
    });

    $scope.openModal = function () {
      $('modal1').modal('open');
    };

    $scope.closeModal = function () {
      $('modal1').modal('close');
    };
  }]);
