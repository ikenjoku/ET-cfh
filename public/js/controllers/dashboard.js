/* eslint prefer-arrow-callback: 0, func-names: 0 */

angular.module('mean.system')
  .controller('DashboardController', ['$scope', 'DashboardService', function DashboardController($scope, DashboardService) {
    $scope.games = [];
    $scope.currentUser = {
      games: [],
    };

    DashboardService.leaderBoard().then(function (data) {
      $scope.games = data.games;
    });

    DashboardService.gameLog().then(function (data) {
      $scope.currentUser.games = data.games;
    });

    // $scope.currentUser = {
    //   games: [
    //     {
    //       players: [{}, {}, {}, {}],
    //       gameWinner: {
    //         name: 'Kelvin',
    //       },
    //     },
    //     {
    //       players: [{}, {}, {}, {}],
    //       gameWinner: {
    //         name: 'Big Ben',
    //       },
    //     },
    //     {
    //       players: [{}, {}, {}, {}],
    //       gameWinner: {
    //         name: 'Folajimi',
    //       },
    //     },
    //     {
    //       players: [{}, {}, {}, {}],
    //       gameWinner: {
    //         name: 'Dikaeinstein',
    //       },
    //     },
    //   ],
    // };
  }]);
