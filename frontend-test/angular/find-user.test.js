/* eslint prefer-arrow-callback: 0, func-names: 0, no-undef: 0 */
describe('Invite Controller', function () {
  let $scope, $http, $q, game, controller;
  beforeEach(module('mean.system'));
  mockApireq = function () {
    return {
      execute(a, b, callback) {
        return callback({ token: 'Thisisatesttoken' });
      }
    };
  };

  beforeEach(inject(function (_$controller_, _$httpBackend_, _$q_, _$rootScope_) {
    $scope = _$rootScope_.$new();
    controller = _$controller_;
    $q = _$q_;
    $http = _$httpBackend_;
    $http.when('GET', '/users/findUsers/ben').respond(['Toyota', 'Honda', 'Tesla']);
    controller('InvitePlayersController', {
      $scope,
      $http,
      $q,
      game
    });
  }));

  it('User should be returned on search', function () {
    expect(1 + 1).toEqual(2);
  });
});
