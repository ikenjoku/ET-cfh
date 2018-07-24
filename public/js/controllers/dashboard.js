/* eslint prefer-arrow-callback: 0, func-names: 0 */

angular.module('mean.system')
  .controller('DashboardController', ['$scope', 'DashboardService', function DashboardController($scope, DashboardService) {
    $scope.games = {
      data: [],
      status: null,
    };

    $scope.currentUser = {
      games: {
        data: [],
        status: null,
      },
    };

    $scope.fetchLeaderboard = function () {
      DashboardService.leaderBoard().then(function (data) {
        $scope.games.data = data.games.map(function (game, index) {
          return {
            rank: `${index + 1}`,
            username: game.username,
            gamesWon: game.gamesWon,
          };
        });
      }, function (error) {
        $scope.games.data = error.data
          || 'Error fetching leaderboard, please try again';
        $scope.games.status = error.status;
      });
    };

    $scope.fetchGamelog = function () {
      DashboardService.gameLog().then(function (data) {
        console.log('im called');
        $scope.currentUser.games.data = data.games;
      }, function (error) {
        $scope.currentUser.games.data = error.data
          || 'Error fetching gamelog, please try again';
        $scope.currentUser.games.status = error.status;
      });
    };

    // Initialize tabs
    $('.tabs').tabs();

    // Fetch leaderboard onLoad
    $scope.fetchLeaderboard();
  }]);
