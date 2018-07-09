/* eslint prefer-arrow-callback: 0, func-names: 0, no-undef: 0 */
angular.module('mean.system')
  .controller('IndexController', ['$scope', 'Global', '$location', 'socket', 'game', 'AvatarService', function ($scope, Global, $location, socket, game, AvatarService) {
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

    $scope.openModal = function () {
      $('modal1').modal('open');
    };

    $scope.closeModal = function () {
      $('modal1').modal('close');
    };
  }]);
