/* eslint prefer-arrow-callback: 0, func-names: 0 */
angular.module('mean.system')
  .controller('IndexController', ['$scope', 'Global', '$location', 'game', 'AvatarService', function ($scope, Global, $location, game, AvatarService) {
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

    $scope.openModalLoading = function () {
      $('modal-loading-indicator').modal('open');
    };

    $scope.closeModal = function () {
      $('modal1').modal('close');
    };
  }]);
