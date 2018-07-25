/* eslint prefer-arrow-callback: 0, func-names: 0, no-undef: 0, no-var: 0,
vars-on-top: 0, require-jsdoc: 0 */

angular.module('mean.system')
  .controller('InvitePlayersController', ['$scope', '$http', 'game', 'friend', 'socket', function ($scope, $http, game, friend, socket) {
    $scope.hasServerError = false;
    $scope.searchKey = '';
    $scope.disableInviteButton = false;
    $scope.selectedUser = {};
    $scope.invitedUsers = [];
    $scope.showNotFound = false;
    $scope.foundUsers = [];
    $scope.friendRequests = [];
    $scope.dobounceTimeout = null;
    $scope.searchHelper = '';
    var token = localStorage.getItem('#cfhetusertoken');
    $scope.userId = localStorage.getItem('#cfhetUserId');

    $scope.hasInvitedUsers = function () {
      return $scope.invitedUsers.length > 0;
    };

    socket.on('saveAsSent', function () {
      $scope.friendRequests.push($scope.selectedUser);
      $scope.selectedUser = {};
    });

    $scope.sendFriendRequest = function (user) {
      $scope.selectedUser = user;
      const payload = {
        user,
        senderId: $scope.userId,
      };
      friend.dispatchAddFriend(payload);
    };

    $scope.closeReusedModal = function () {
      $('#reuse-modal').modal('close');
      game.isFilledUp = null;
    };

    $scope.findUsers = function () {
      const url = $scope.searchKey.length ? `/api/users/findUsers/${$scope.searchKey}/${$scope.userId}` : '/api/users/findUsers';
      return $http.get(url, { headers: { Authorization: `Bearer ${token}` } }).then(function (response) {
        $scope.foundUsers = response.data.users;
        $scope.showNotFound = $scope.foundUsers.length === 0 && $scope.searchKey.length > 0;
        return response.data.users;
      }, function (error) {
        $scope.searchHelper = error.data;
        $scope.hasServerError = true;
        return error.data;
      });
    };

    $scope.closeReusedModal = function () {
      $('#reuse-modal').modal('close');
      game.isFilledUp = false;
    };

    $scope.sendInvitation = function (user) {
      $scope.selectedUser = user;
      $scope.disableInviteButton = true;
      var url = window.location.href;

      var formData = {
        user,
        link: url,
      };

      return $http.post('/api/users/invite', formData, { headers: { Authorization: `Bearer ${token}` } }).then(function (response) {
        $scope.invitedUsers.push(user);
        $scope.disableInviteButton = false;
        $scope.selectedUser = {};
        friend.dispatchInvitation(formData);
        return response.data.user;
      }, function (error) {
        $scope.searchHelper = error.data.message;
        $scope.hasServerError = true;
        return error;
      });
    };
  }]);
