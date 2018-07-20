/* eslint prefer-arrow-callback: 0, func-names: 0, no-undef: 0 */
describe('Controller: Game(Chat)', function () {
  let $scope;
  const game = {
    messages: [],
    dispatchMessage() {},
    joinGame() {}
  };

  beforeEach(module('mean.system'));
  beforeEach(inject(function ($controller, _$rootScope_) {
    $scope = _$rootScope_.$new();
    $controller('GameController', {
      $scope,
      $http: {},
      $q: {},
      game,
      socket: {
        on() {}
      },
      $timeout: {},
      $location: {
        search() {
          return {};
        }
      },
      MakeAWishFactsService: {
        getMakeAWishFacts() {
          return [];
        }
      },
      $dialog: {},
      $rootScope: _$rootScope_

    });
  }));

  it('should change the scope MessageInput on submit', function () {
    $scope.MessageInput = 'This is a test thing';
    spyOn(game, 'dispatchMessage');
    $scope.SendMessage();
    expect($scope.MessageInput).toEqual('');
    expect(game.dispatchMessage).toHaveBeenCalled();
  });
});
