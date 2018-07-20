/* eslint prefer-arrow-callback: 0, func-names: 0 */

angular.module('mean.system')
  .controller('DashboardController', ['$scope', 'DashboardService', function DashboardController($scope, DashboardService) {
    $scope.games = [];
    $scope.currentUser = {
      games: [],
    };

    DashboardService.leaderBoard().then(function (data) {
      $scope.games = data.games.map(function (game, index) {
        return {
          rank: `${index + 1}`,
          username: game.username,
          gamesWon: game.gamesWon,
        };
      });
    });

    DashboardService.gameLog().then(function (data) {
      $scope.currentUser.games = data.games;
    });
  }]);
