/* eslint prefer-arrow-callback: 0, func-names: 0, no-undef: 0 */
describe('Invite User', function () {
  let $scope, $http, game, $httpBackend, controller;
  beforeEach(module('mean.system'));
  beforeEach(inject(function (_$controller_, _$httpBackend_, _$http_, _$rootScope_) {
    $scope = _$rootScope_.$new();
    $http = _$http_;
    controller = _$controller_;
    $httpBackend = _$httpBackend_;
    game = {};
    const socket = {
      on() {}
    };
    const friend = {
      dispatchAddFriend() {},
      dispatchInvitation() {},
      addToRoom() {},
    };
    controller('InvitePlayersController', {
      $scope,
      $http,
      game,
      friend,
      socket
    });
  }));

  it('Should return users on search', function () {
    $scope.searchKey = 'ben';
    $scope.userId = '12345';
    let response = null;
    const users = { users: [{ name: 'Benjamin' }, { name: 'Benny' }] };

    $httpBackend.whenGET('/api/users/findUsers/ben/12345').respond(function () {
      return users;
    }());

    $scope.findUsers().then((data) => {
      response = data;
    });

    $httpBackend.flush();
    expect(response).toEqual(users.users);
    expect($scope.foundUsers).toEqual(users.users);
    expect($scope.showNotFound).toEqual(false);
  });

  it('Should send invitation to user', function () {
    let response = null;
    const formData = {
      user: { email: 'benjamin.onah@gmail.com', name: 'Ben Onah', password: 'password' },
      link: 'https://localhost.com'
    };

    $scope.selectedUser = formData.user;
    $scope.disableInviteButton = true;

    $httpBackend.whenPOST('/api/users/invite').respond(function () {
      return formData;
    }());

    $scope.sendInvitation(formData.user).then((data) => {
      response = data;
    });

    $httpBackend.flush();

    expect(response).toEqual(formData.user);
    expect($scope.disableInviteButton).toEqual(false);
    expect($scope.selectedUser).toEqual({});
  });

  it('Should pop up modal', function () {
    $scope.closeReusedModal();
    expect(game.isFilledUp).toEqual(false);
  });
});
