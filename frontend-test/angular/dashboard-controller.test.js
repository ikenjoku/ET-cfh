/* eslint prefer-arrow-callback: 0, func-names: 0, no-undef: 0 */

describe('DashboardController', function () {
  let $scope, $rootScope, $controller, DashboardService;
  const flag = 'success';
  const leaderBoardGames = [
    {
      rank: '1',
      gamesWon: 2,
      username: 'Nkemjiks',
    },
    {
      rank: '2',
      gamesWon: 3,
      username: 'Dikaeinstein',
    },
  ];

  const gamelogGames = [
    {
      players: [
        { username: 'Nkemjiks' },
        { username: 'Dikaeinstein' }
      ],
      meta: {
        gameWinner: {
          username: 'Dikaeinstein'
        }
      }
    },
    {
      players: [
        { username: 'Nkemjiks' },
        { username: 'Dikaeinstein' }
      ],
      meta: {
        gameWinner: {
          username: 'Dikaeinstein'
        }
      }
    }
  ];

  beforeEach(module('mean.system'));
  beforeEach(inject(function (_$controller_, _$rootScope_) {
    $rootScope = _$rootScope_;
    $controller = _$controller_;
    DashboardService = {
      leaderBoard: function leaderBoard() {},
      gameLog: function gameLog() {}
    };

    spyOn(DashboardService, 'leaderBoard').and.callFake(function () {
      return {
        then: function then(successCallback, errorCallback) {
          if (flag === 'success') successCallback({ games: leaderBoardGames });
          else errorCallback('Error');
        }
      };
    });

    spyOn(DashboardService, 'gameLog').and.callFake(function () {
      return {
        then: function then(successCallback, errorCallback) {
          if (flag === 'success') successCallback({ games: gamelogGames });
          else errorCallback('Error');
        }
      };
    });
  }));

  it('should return the leaderboard with 2 players fetched with $http', function () {
    $scope = $rootScope.$new();
    $controller('DashboardController', {
      $scope,
      DashboardService,
    });

    expect($scope.games.data.length).toEqual(2);
    expect($scope.games.data[0]).toEqual(leaderBoardGames[0]);
  });

  it('should return the gamelog containing 2 games fetched with $http', function () {
    $scope = $rootScope.$new();
    $controller('DashboardController', {
      $scope,
      DashboardService,
    });

    expect($scope.currentUser.games.data.length).toEqual(0);
    $scope.fetchGamelog();
    expect($scope.currentUser.games.data.length).toEqual(2);
    expect($scope.currentUser.games.data[0]).toEqual(gamelogGames[0]);
  });
});
